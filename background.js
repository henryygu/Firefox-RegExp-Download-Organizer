// Utility function to format date based on user preference
async function getFormattedDate() {
  const storage = await browser.storage.local.get('dateFormat');
  const format = storage.dateFormat || 'YYYY//MM';
  
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');

  return format.replace('YYYY', year).replace('MM', month);
}

// Function to get the last used download ID
async function getLastDownloadId() {
  const storage = await browser.storage.local.get('lastDownloadId');
  return storage.lastDownloadId || 0;
}

// Function to set the last used download ID
async function setLastDownloadId(downloadId) {
  await browser.storage.local.set({ lastDownloadId: downloadId });
}

// Function to process download
async function processDownload(downloadItem) {
  const lastDownloadId = await getLastDownloadId();
  
  if (downloadItem.id <= lastDownloadId) {
    console.log('Skipping already processed download:', downloadItem.id);
    return;
  }

  console.log('Download initiated:', downloadItem);
  
  browser.downloads.cancel(downloadItem.id).then(async () => {
    console.log('Original download cancelled:', downloadItem.id);
    
    const downloadUrl = downloadItem.url;
    console.log('Original download URL:', downloadUrl);
    
    const formattedDate = await getFormattedDate();
    const newFilename = `processed-download-${formattedDate}.ext`;
    const newFilePath = `Downloads/${formattedDate}/${newFilename}`;
    
    const newDownloadId = lastDownloadId + 1;
    browser.downloads.download({
      url: downloadUrl,
      filename: newFilePath,
      conflictAction: 'uniquify'
    }).then(() => {
      console.log('New download initiated with ID:', newDownloadId);
      setLastDownloadId(newDownloadId);
    }).catch((error) => {
      console.error('Error starting new download:', error);
    });
  }).catch((error) => {
    console.error('Error cancelling original download:', error);
  });
}

browser.downloads.onCreated.addListener((downloadItem) => {
  processDownload(downloadItem);
});
