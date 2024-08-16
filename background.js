// Set to track processed downloads
const processedPrefix = 'processed-';

// Utility function to format date
function getFormattedDate() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// Function to process download
function processDownload(downloadItem) {
  // Check if the filename already starts with the processed prefix
  console.log(downloadItem.filename)
  if (downloadItem.filename.includes(processedPrefix)) {
    console.log('Skipping already processed download:', downloadItem.filename);
    return;
  }
  
  console.log('Download initiated:', downloadItem);
  
  // Cancel the original download
  browser.downloads.cancel(downloadItem.id).then(() => {
    console.log('Original download cancelled:', downloadItem.id);
    
    // Extract the URL
    const downloadUrl = downloadItem.url;
    console.log('Original download URL:', downloadUrl);
    
    let pathSeparator = downloadItem.filename.includes('/') ? '/' : '\\';
    let originalDir = downloadItem.filename.substring(0, downloadItem.filename.lastIndexOf(pathSeparator));
    let fileName = downloadItem.filename.split(pathSeparator).pop();
    console.log("originalDir:", originalDir);
    console.log("fileName:", fileName);
    
    // Define the new file path based on the date
    const formattedDate = getFormattedDate();
    const newFilename = `processed-download-${fileName}`; // Customize extension as needed
    const newFilePath = `Downloads/${formattedDate}/${newFilename}`;
    
    // Start a new download with the modified path
    browser.downloads.download({
      url: downloadUrl,
      filename: newFilePath,
      conflictAction: 'uniquify' // Ensure no file overwriting
    }).then((downloadId) => {
      console.log('New download initiated with ID:', downloadId);
    }).catch((error) => {
      console.error('Error starting new download:', error);
    });
  }).catch((error) => {
    console.error('Error cancelling original download:', error);
  });
}

// Listen for download events
browser.downloads.onCreated.addListener((downloadItem) => {
  processDownload(downloadItem);
});
