function organizeDownload(downloadItem) {
    console.log("Download change detected:", downloadItem);
  
    if (downloadItem.state && downloadItem.state.current === "complete") {
      console.log("Download completed:", downloadItem.id);
  
      browser.downloads.search({id: downloadItem.id})
        .then(([download]) => {
          console.log("Found download:", download);
  
          let downloadDate = new Date(download.startTime);
          let folderName = `${downloadDate.getFullYear()}-${(downloadDate.getMonth() + 1).toString().padStart(2, '0')}-${downloadDate.getDate().toString().padStart(2, '0')}`;
  
          console.log("Created folder name:", folderName);
  
          // Determine the proper path separator for the current platform
          let pathSeparator = download.filename.includes('/') ? '/' : '\\';
  
          // Extract the directory part of the original filename
          let originalDir = download.filename.substring(0, download.filename.lastIndexOf(pathSeparator));
          let fileName = download.filename.split(pathSeparator).pop();
          console.log("originalDir:", originalDir);
          console.log("fileName:", fileName);

          // Construct the new file path by appending the folder name to the original directory
          let newFilePath = `${originalDir}${pathSeparator}${folderName}${pathSeparator}${fileName}`;
          console.log("New file path:", newFilePath);
  
          browser.downloads.move(download.id, {filename: newFilePath})
            .then(() => {
              console.log("File successfully moved to:", newFilePath);
            })
            .catch((error) => {
              console.error("Error moving file:", error);
            });
        })
        .catch((error) => {
          console.error("Error searching for download:", error);
        });
    }
  }
  
  console.log("Downloads Organizer addon loaded");
  browser.downloads.onChanged.addListener(organizeDownload);
  console.log("Download change listener added");
  