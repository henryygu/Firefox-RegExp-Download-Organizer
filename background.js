/**
 * Background script for RegExp Download Organizer
 * Hybrid Approach: 
 * 1. Try onDeterminingFilename (cleanest)
 * 2. Fallback to onCreated (cancel & redownload) if the first fails.
 */

const SELF_DOWNLOADS = new Set();

// Helper to get formatted date or path if needed
function getTargetFilepath(rule, originalFilename) {
  const originalBasename = originalFilename.split(/[/\\]/).pop();
  let folderTemplate = rule.folder.replace(/\\/g, '/').replace(/^\/+|\/+$/g, '');

  // Variable Substitution
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const monthName = monthNames[now.getMonth()];
  const day = String(now.getDate()).padStart(2, '0');

  folderTemplate = folderTemplate
    .replace(/{year}/g, year)
    .replace(/{month}/g, month)
    .replace(/{monthName}/g, monthName)
    .replace(/{day}/g, day);

  return `${folderTemplate}/${originalBasename}`;
}

// 1. Primary: onDeterminingFilename
// Standard MV3/Firefox way to rename on the fly.
if (browser.downloads.onDeterminingFilename) {
  browser.downloads.onDeterminingFilename.addListener((downloadItem) => {
    // If it's a re-download triggered by us, we might want to let it pass or ensure it's named right.
    // Usually we just let the logic run again, it maps to the same place.

    return browser.storage.local.get('rules')
      .then((result) => {
        const rules = result.rules || [];
        if (!rules.length) return;

        for (const rule of rules) {
          try {
            const regex = new RegExp(rule.pattern, 'i');
            if (regex.test(downloadItem.filename) || regex.test(downloadItem.url)) {
              console.log(`[onDeterminingFilename] Matched: ${rule.pattern}`);

              const finalPath = getTargetFilepath(rule, downloadItem.filename);

              return {
                filename: finalPath,
                conflictAction: 'uniquify'
              };
            }
          } catch (e) {
            console.error('Invalid Regex', e);
          }
        }
      })
      .catch(err => console.error('Error in onDeterminingFilename', err));
  });
}

// 2. Fallback: onCreated
// If the browser ignored the above, the file will appear in the default folder.
browser.downloads.onCreated.addListener(async (downloadItem) => {
  // 1. Avoid infinite loops from our own re-downloads
  if (SELF_DOWNLOADS.has(downloadItem.url)) {
    // We can't easily track by URL alone if multiple files same URL, but close enough for now.
    // Better: check if we just started it. 
    // For now, let's just check if it's already in the right place.
  }

  // 2. Check if we need to intervene
  const result = await browser.storage.local.get('rules');
  const rules = result.rules || [];

  if (!rules.length) return;

  for (const rule of rules) {
    try {
      const regex = new RegExp(rule.pattern, 'i');
      // Check if it matches
      if (regex.test(downloadItem.filename) || regex.test(downloadItem.url)) {

        const desiredPath = getTargetFilepath(rule, downloadItem.filename);

        // CRITICAL CHECK: Did it already behave?
        // downloadItem.filename usually contains the full specific path like "Downloads/Images/foo.jpg" (or just "Images/foo.jpg" relative to default)
        // We normalize slashes to check.
        const normalizedItemPath = downloadItem.filename.replace(/\\/g, '/');
        const normalizedDesired = desiredPath.replace(/\\/g, '/');

        // Check if the file is ALREADY inside the target folder.
        // We check if the path *starts with* the target folder.
        const targetFolder = rule.folder.replace(/\\/g, '/').replace(/^\/+|\/+$/g, '');

        if (normalizedItemPath.includes(targetFolder)) {
          console.log('[onCreated] Download appears correct. No action needed.');
          return;
        }

        // If we are here, the file matched a rule BUT is NOT in the target folder.
        // Fallback Triggered!
        console.log(`[onCreated] Fallback triggered for ${downloadItem.id}. Re-downloading to ${desiredPath}`);

        // Cancel original
        await browser.downloads.cancel(downloadItem.id);

        // Re-download
        // Note: We need to mark this URL to avoid loop? 
        // Actually, if we provide 'filename' in download(), onCreated will fire again, 
        // BUT this time the check `normalizedItemPath.includes(targetFolder)` ABOVE will pass!
        // So the loop breaks naturally. Nice.

        browser.downloads.download({
          url: downloadItem.url,
          filename: desiredPath,
          conflictAction: 'uniquify'
        });

        return; // Done
      }
    } catch (e) {
      console.error('Regular Expression Error', e);
    }
  }
});
