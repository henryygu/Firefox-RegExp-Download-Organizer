let rules = [];

console.log('Options script started');

function saveRules() {
  browser.storage.local.set({rules})
    .then(() => console.log('Rules saved:', rules))
    .catch(error => console.error('Error saving rules:', error));
}

function createRuleElement(rule, index) {
  console.log('Creating rule element for:', rule);
  const div = document.createElement('div');
  div.innerHTML = `
    <input type="text" value="${rule.pattern}" placeholder="RegExp Pattern" ${rule.isDefault ? 'disabled' : ''}>
    <input type="text" value="${rule.folder}" placeholder="Destination Folder" ${rule.isDefault ? 'disabled' : ''}>
    <button class="delete" ${rule.isDefault ? 'disabled' : ''}>Delete</button>
    ${rule.isDefault ? '(Default Rule)' : ''}
  `;
  if (!rule.isDefault) {
    div.querySelector('.delete').addEventListener('click', () => {
      console.log('Deleting rule at index:', index);
      rules.splice(index, 1);
      renderRules();
    });
  }
  return div;
}

function renderRules() {
  console.log('Rendering rules');
  const rulesContainer = document.getElementById('rules');
  rulesContainer.innerHTML = '';
  rules.forEach((rule, index) => {
    rulesContainer.appendChild(createRuleElement(rule, index));
  });
}

document.getElementById('addRule').addEventListener('click', () => {
  console.log('Adding new rule');
  rules.push({pattern: '', folder: ''});
  renderRules();
});

document.getElementById('saveRules').addEventListener('click', () => {
  console.log('Saving rules');
  rules = Array.from(document.querySelectorAll('#rules > div')).map(div => ({
    pattern: div.querySelector('input:nth-child(1)').value,
    folder: div.querySelector('input:nth-child(2)').value,
    isDefault: div.textContent.includes('(Default Rule)')
  })).filter(rule => rule.pattern && rule.folder);
  console.log('Rules to save:', rules);
  saveRules();
});

// Load existing rules
browser.storage.local.get('rules').then(result => {
  rules = result.rules || [{pattern: '.*', folder: 'all', isDefault: true}];
  console.log('Rules loaded from storage:', rules);
  renderRules();
}).catch(error => console.error('Error loading rules:', error));

console.log('Options script setup complete');