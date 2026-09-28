// options/options.js
const el = (id) => document.getElementById(id);

const apiKey = el("apiKey");
const model = el("model");
const systemPrompt = el("systemPrompt");
const form = el("settingsForm");
const statusEl = el("status");
const btnClear = el("btnClear");
const btnTest = el("btnTest");
const sampleOut = el("sampleOut");
const btnShortcuts = el("btnShortcuts");
const btnAPIKeys = el("btnAPIKeys");
const btnAPIKeys2 = el("btnAPIKeys2");

async function load() {
  const { geminiApiKey = "", geminiModel = "gemini-2.5-flash", geminiPrompt = "" } =
    await chrome.storage.sync.get(["geminiApiKey", "geminiModel", "geminiPrompt"]);
  apiKey.value = geminiApiKey;
  model.value = geminiModel;
  systemPrompt.value = geminiPrompt;
}
load();

function status(msg, ok = true) {
  statusEl.textContent = msg;
  statusEl.style.color = ok ? "#bbf7d0" : "#fecaca";
  clearTimeout(status._t);
  status._t = setTimeout(() => (statusEl.textContent = ""), 2800);
}

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const key = apiKey.value.trim();
  const mdl = model.value;
  const sp = systemPrompt.value;

  if (!key) {
    status("Please add your Gemini API key.", false);
    return;
  }
  await chrome.storage.sync.set({ geminiApiKey: key, geminiModel: mdl, geminiPrompt: sp });
  status("Settings saved.");
});

btnClear.addEventListener("click", async () => {
  await chrome.storage.sync.remove(["geminiApiKey", "geminiModel", "geminiPrompt"]);
  apiKey.value = "";
  model.value = "gemini-2.5-flash";
  systemPrompt.value = "";
  status("Cleared.");
  sampleOut.classList.add("hidden");
  sampleOut.textContent = "";
});

btnTest.addEventListener("click", async () => {
  status("Testing…");
  sampleOut.classList.add("hidden");
  sampleOut.textContent = "";
  const resp = await chrome.runtime.sendMessage({ type: "UPO_TEST_GEMINI" });
  if (!resp?.ok) {
    status(`Test failed: ${resp?.error || "Unknown error"}`, false);
    return;
  }
  status("Test succeeded.");
  sampleOut.textContent = resp.sample;
  sampleOut.classList.remove("hidden");
});

btnShortcuts.addEventListener("click", () => {
  chrome.runtime.sendMessage({ type: "UPO_OPEN_SHORTCUTS" });
});

btnAPIKeys.addEventListener("click", () => {
  chrome.runtime.sendMessage({ type: "UPO_OPEN_API_KEYS" });
});
btnAPIKeys2.addEventListener("click", () => {
  chrome.runtime.sendMessage({ type: "UPO_OPEN_API_KEYS" });
});
