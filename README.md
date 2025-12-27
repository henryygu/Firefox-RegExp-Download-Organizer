# RegExp Download Organizer (MV3)

A modern Firefox extension that organizes your downloads into folders based on regular expressions.

## Features
- **Manifest V3** compliant.
- **On-the-fly Organization**: Renames files before they hit the disk.
- **Rules Based**: Define rules using standard Javascript Regular Expressions.
- **Modern UI**: Clean, dark-mode supported interface.

## Installation

### For Development / Testing
1.  Open Firefox and navigate to `about:debugging#/runtime/this-firefox`.
2.  Click **Load Temporary Add-on...**.
3.  Select the `manifest.json` file in this directory.

### Permanent Installation
 Firefox requires all extensions to be signed by Mozilla to be installed permanently.

1.  **Get the .xpi file**: Use the included `firefox-regexp-download-organizer.xpi`.
2.  **Sign the Add-on**:
    *   Go to [Mozilla Add-on Developer Hub](https://addons.mozilla.org/en-US/developers/).
    *   Upload the `.xpi` file for "Self-Distribution".
    *   Download the signed `.xpi` they provide.
3.  **Install**: Drag the signed `.xpi` into Firefox.

*Note: You can use Firefox Developer Edition to install unsigned extensions by setting `xpinstall.signatures.required` to `false` in `about:config`.*

## Usage
1.  Click the extension icon or go to Add-ons Manager -> Extensions -> Options.
2.  Add a Rule:
    *   **Pattern**: `\.pdf$` (Matches all PDF files)
    *   **Folder**: `Documents/PDFs`
3.  Save.
4.  Download a PDF. It will automatically be saved to `Downloads/Documents/PDFs/filename.pdf`.
