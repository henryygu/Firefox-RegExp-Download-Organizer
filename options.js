document.addEventListener('DOMContentLoaded', restoreOptions);
document.getElementById('saveBtn').addEventListener('click', saveOptions);
document.getElementById('addRuleBtn').addEventListener('click', () => addRuleUI());
document.getElementById('testBtn').addEventListener('click', testRules);

const rulesList = document.getElementById('rulesList');
const toast = document.getElementById('toast');
const testResult = document.getElementById('testResult');

// Default rule structure
const DEFAULT_RULE = { pattern: '', folder: '' };

function createRuleElement(rule = DEFAULT_RULE) {
  const template = document.getElementById('ruleTemplate');
  const clone = template.content.cloneNode(true);

  const el = clone.querySelector('.rule-item');
  const patternInput = el.querySelector('.pattern-input');
  const folderInput = el.querySelector('.folder-input');
  const deleteBtn = el.querySelector('.delete-btn');

  patternInput.value = rule.pattern;
  folderInput.value = rule.folder;

  deleteBtn.addEventListener('click', () => {
    el.remove();
    if (rulesList.children.length === 0) {
      showEmptyState();
    }
  });

  return el;
}

function addRuleUI(rule) {
  const emptyState = document.querySelector('.empty-state');
  if (emptyState) {
    emptyState.remove();
  }
  rulesList.appendChild(createRuleElement(rule));
}

function showEmptyState() {
  if (rulesList.children.length === 0) {
    rulesList.innerHTML = '<div class="empty-state"><p>No rules defined yet.</p></div>';
  }
}

async function testRules() {
  const testInput = document.getElementById('testInput').value.trim();
  if (!testInput) return;

  // Gather current rules from UI (what the user sees, even if not saved)
  const ruleElements = document.querySelectorAll('.rule-item');
  let matchedParams = null;

  for (const el of ruleElements) {
    const pattern = el.querySelector('.pattern-input').value.trim();
    const folder = el.querySelector('.folder-input').value.trim();

    if (!pattern) continue;

    try {
      const regex = new RegExp(pattern, 'i');
      if (regex.test(testInput)) {
        matchedParams = { pattern, folder };
        break; // Stop at first match
      }
    } catch (e) {
      console.error('Invalid Regex in test', e);
    }
  }

  testResult.classList.remove('hidden');
  if (matchedParams) {
    testResult.innerHTML = `
      <span class="test-match">✓ Match Found!</span><br>
      <strong>Rule:</strong> <code>${matchedParams.pattern}</code><br>
      <strong>Target:</strong> <code>Downloads/${matchedParams.folder}/...</code>
    `;
  } else {
    testResult.innerHTML = `
      <span class="test-no-match">✗ No Match</span><br>
      File will go to default Downloads folder.
    `;
  }
}

async function saveOptions() {
  const ruleElements = document.querySelectorAll('.rule-item');
  const rules = [];

  ruleElements.forEach(el => {
    const pattern = el.querySelector('.pattern-input').value.trim();
    const folder = el.querySelector('.folder-input').value.trim();

    if (pattern && folder) {
      rules.push({ pattern, folder });
    }
  });

  await browser.storage.local.set({ rules });
  showToast('Settings Saved');
}

async function restoreOptions() {
  const res = await browser.storage.local.get('rules');
  let rules = res.rules;

  // Load defaults if empty
  if (!rules || rules.length === 0) {
    rules = [
      { pattern: '\\.(jpg|jpeg|png|gif|webp|svg)$', folder: 'Media/Images' },
      { pattern: '\\.(mp4|mkv|avi|mov|webm)$', folder: 'Media/Videos' },
      { pattern: '\\.pdf$', folder: 'Documents/PDFs' },
      { pattern: '\\.(exe|msi|dmg|pkg)$', folder: 'Software/Installers' },
      { pattern: '\\.(zip|rar|7z|tar|gz)$', folder: 'Archives' },
      // Catch-all date rule (yyyy / mm-mmm/)
      { pattern: '.*', folder: '{year}/{month}-{monthName}' }
    ];
    // Save defaults effectively immediately so they persist? 
    // Or just show them. Let's just show them, user can save.
  }

  rulesList.innerHTML = '';
  rules.forEach(rule => addRuleUI(rule));
}

function showToast(msg) {
  toast.textContent = msg;
  toast.classList.remove('hidden');
  setTimeout(() => {
    toast.classList.add('hidden');
  }, 2000);
}