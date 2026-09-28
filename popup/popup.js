// popup/popup.js
const optimizeBtn = document.getElementById("optimizeNow");
const optionsBtn = document.getElementById("openOptions");

optimizeBtn.addEventListener("click", async () => {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (tab?.id) {
    chrome.tabs.sendMessage(tab.id, { type: "UPO_OPTIMIZE_SELECTION" }).catch(() => {});
    window.close();
  }
});

optionsBtn.addEventListener("click", () => {
  chrome.runtime.openOptionsPage();
});
