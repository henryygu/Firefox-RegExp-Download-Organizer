// Function to save options to storage
function saveOptions() {
  const dateFormat = document.getElementById('dateFormat').value;
  
  browser.storage.local.set({ dateFormat }).then(() => {
    document.getElementById('status').textContent = 'Options saved.';
    setTimeout(() => {
      document.getElementById('status').textContent = '';
    }, 1000);
  });
}

// Function to restore options from storage
function restoreOptions() {
  browser.storage.local.get('dateFormat').then((result) => {
    document.getElementById('dateFormat').value = result.dateFormat || 'YYYY/MM';
  });
}

// Event listeners
document.getElementById('saveButton').addEventListener('click', saveOptions);
document.addEventListener('DOMContentLoaded', restoreOptions);
