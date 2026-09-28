# UPO privacy information

UPO runs a content script on web pages to receive a user-invoked command. It reads the selected text from an editable field only when you invoke optimization. The selected text and UPO's instructions are sent to the Google Gemini API using your own key, and the result is inserted in the field. A test button in Settings sends a fixed example prompt. No other remote service is used by this code. The author receives no telemetry from the extension.

Your Gemini key, model selection and optional custom instructions are stored with Chrome Sync and may sync to your other signed-in Chrome devices. UPO does not store optimized prompts or browser history. Clear these settings using the Clear button in Settings; stop page access by disabling or uninstalling the extension. Google's processing, retention and charges are governed by its terms, not this repository. Avoid using UPO for sensitive or confidential text.

This file documents the behavior of this source version. Before Web Store submission, host an accurate privacy policy at a public URL and fill the dashboard's data-use declarations to match the shipped package.
