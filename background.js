// Utility function to format date
function getFormattedDate() {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return `${year}//${month}`;
  }
  
  // Function to get the last used download ID
  async function getLastDownloadId() {
    const storage = await browser.storage.local.get('lastDownloadId');
    return storage.lastDownloadId || 0; // Default to 0 if not set
  }
  
  // Function to set the last used download ID
  async function setLastDownloadId(downloadId) {
    await browser.storage.local.set({ lastDownloadId: downloadId });
  }
  
  // Function to process download
  async function processDownload(downloadItem) {
    const lastDownloadId = await getLastDownloadId();
    
    // Check if the current download ID is greater than the last one used
    if (downloadItem.id <= lastDownloadId) {
      console.log('Skipping already processed download:', downloadItem.id);
      return;
    }
  
    console.log('Download initiated:', downloadItem);
    
    // Cancel the original download
    browser.downloads.cancel(downloadItem.id).then(async () => {
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
      const newDownloadId = downloadItem.id + 1; // Increment ID for new download
      setLastDownloadId(newDownloadId);
      
      browser.downloads.download({
        url: downloadUrl,
        filename: newFilePath,
        conflictAction: 'uniquify' // Ensure no file overwriting
      }).then(() => {
        console.log('New download initiated with ID:', newDownloadId);
        // Update the last used download ID
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
  