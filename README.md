# UPO - Universal Prompt Optimizer

A Manifest V3 Chrome extension that rewrites text you select in an editable web field using your own Google Gemini API key. It does not read a conversation history or run until you select text and invoke it. Results should be reviewed before sending to anyone.

## Install and use

1. Download or clone this repository (`https://github.com/vio137/upo`). Open `chrome://extensions`, turn on Developer mode, choose **Load unpacked**, and select the folder containing `manifest.json`.
2. Open UPO settings and enter a Gemini API key from [Google AI Studio](https://aistudio.google.com/app/api-keys). The default model is Gemini 2.5 Flash. Use **Test Call** to check your own key; API availability and pricing depend on your Google account.
3. Select text in a standard text field, textarea or editable area. Use the context menu, toolbar button or `Ctrl+Shift+Y` (`Command+Shift+Y` on macOS). Set another shortcut at `chrome://extensions/shortcuts` if needed. The selection is replaced only if the field has not changed while the request is in flight.

This extension cannot run on Chrome internal pages, protected pages or every rich-text editor. Long selections over 12,000 characters are rejected. Some editors may not treat programmatic changes as user input; verify the final field before sending. UPO does not automatically submit the result.

## Privacy and permissions

- **All websites (content script):** watches for your explicit command and reads only the selected text from an editable field, then replaces that selection. Broad site access is needed to work in editors across different sites, not to collect browsing history.
- **storage:** keeps your chosen model, custom prompt and API key in Chrome Sync. Chrome Sync may synchronize them to other signed-in Chrome devices; do not use a key you are unwilling to store there.
- **contextMenus:** provides the right-click action.
- **Google Gemini host access:** sends the selected text and instructions to Google's Generative Language API only when you invoke optimization or the Settings test. Google's handling and any usage charges follow your Google account and applicable terms.

The extension does not send selected text to the repository owner. It has no analytics or telemetry in this code. Do not select passwords, private keys or confidential text. Clear settings from the Settings page to remove saved configuration. This repository's [privacy policy](PRIVACY.md) describes the data flow; a public hosted policy URL and accurate Web Store dashboard disclosures are still needed for publication.

## Development

No build tooling or third-party runtime dependencies. Source files are bundled directly. Run `node --check` on JavaScript files and validate `manifest.json` before packaging. Test the unpacked extension in Chrome on ordinary textarea, input and contenteditable fields, including a field changed while Gemini is responding. Code and examples are provided as-is; no guarantee is made about output quality or Web Store review.

Author: Arnab Mandal. [Issues](https://github.com/vio137/upo/issues).
