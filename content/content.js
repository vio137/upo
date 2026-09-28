// content/content.js — selection capture, UX overlay, and in-place replacement

let upoToast, upoBar;

function ensureUI() {
  if (!upoToast) {
    upoToast = document.createElement("div");
    upoToast.className = "upo-root-toast";
    upoToast.setAttribute("role", "status");
    upoToast.setAttribute("aria-live", "polite");
    document.documentElement.appendChild(upoToast);
  }
  if (!upoBar) {
    upoBar = document.createElement("div");
    upoBar.className = "upo-status-bar";
    document.documentElement.appendChild(upoBar);
  }
}

function setCursorLoading(on) {
  try { document.documentElement.style.cursor = on ? "progress" : ""; } catch {}
}

function toast(msg, ms = 2200) {
  ensureUI();
  upoToast.textContent = msg;
  upoToast.classList.add("show");
  clearTimeout(toast._t);
  toast._t = setTimeout(() => upoToast.classList.remove("show"), ms);
}

function statusStart() {
  ensureUI();
  upoBar.classList.remove("done");
  upoBar.classList.add("show");
}

function statusDone() {
  if (!upoBar) return;
  upoBar.classList.add("done");
  setTimeout(() => {
    upoBar.classList.remove("show", "done");
  }, 650);
}

// Capture the selection when the command arrives. Chrome's toolbar and context menu can
// move focus; the last focused editable field is retained only for that interaction.
let lastEditable = null;
document.addEventListener("focusin", (event) => {
  const target = event.target;
  if (target instanceof HTMLTextAreaElement ||
      (target instanceof HTMLInputElement && /^(text|search|url|email|tel)$/i.test(target.type))) {
    lastEditable = target;
  }
}, true);

function getSelectionData() {
  const active = document.activeElement;
  const isField = element => element instanceof HTMLTextAreaElement ||
    (element instanceof HTMLInputElement && /^(text|search|url|email|tel)$/i.test(element.type));
  const captureField = field => {
    if (!isField(field) || !field.isConnected || field.disabled || field.readOnly ||
        typeof field.selectionStart !== "number" || field.selectionEnd <= field.selectionStart) return null;
    const start = field.selectionStart, end = field.selectionEnd;
    const text = field.value.slice(start, end);
    return text.trim() ? { kind: "field", field, start, end, text, original: field.value } : null;
  };
  if (isField(active)) return captureField(active);
  const selection = window.getSelection();
  if (selection?.rangeCount && selection.toString().trim()) {
    const range = selection.getRangeAt(0).cloneRange();
    const container = range.commonAncestorContainer;
    const editable = container.nodeType === Node.ELEMENT_NODE ? container : container.parentElement;
    if (editable?.closest('[contenteditable="true"], [contenteditable=""], [contenteditable="plaintext-only"]'))
      return { kind: "range", range, text: selection.toString() };
    return null; // Never send arbitrary page text.
  }
  return captureField(lastEditable); // Toolbar may have moved focus from a selected field.
}

function replaceSelection(selection, optimized) {
  if (selection.kind === "field") {
    const { field, start, end, text, original } = selection;
    if (!field.isConnected || field.disabled || field.readOnly ||
        field.value !== original || field.value.slice(start, end) !== text) return false;
    field.focus();
    field.setRangeText(optimized, start, end, "end");
    field.dispatchEvent(new InputEvent("input", { bubbles: true, inputType: "insertReplacementText", data: optimized }));
    return true;
  }
  const { range, text } = selection;
  if (!range.startContainer.isConnected || range.toString() !== text) return false;
  const editable = range.commonAncestorContainer.nodeType === Node.ELEMENT_NODE
    ? range.commonAncestorContainer : range.commonAncestorContainer.parentElement;
  if (!editable?.closest('[contenteditable="true"], [contenteditable=""], [contenteditable="plaintext-only"]')) return false;
  range.deleteContents();
  const node = document.createTextNode(optimized);
  range.insertNode(node);
  const after = document.createRange();
  after.setStartAfter(node);
  after.collapse(true);
  const current = window.getSelection();
  current.removeAllRanges();
  current.addRange(after);
  editable.dispatchEvent(new InputEvent("input", { bubbles: true, inputType: "insertReplacementText", data: optimized }));
  return true;
}

async function optimizeNow() {
  const selection = getSelectionData();
  if (!selection) { toast("Select text in an editable field first."); return; }
  if (selection.text.length > 12000) { toast("Select at most 12,000 characters."); return; }
  setCursorLoading(true);
  statusStart();
  toast("Optimizing text…");
  try {
    const response = await chrome.runtime.sendMessage({ type: "UPO_CALL_GEMINI", text: selection.text });
    if (!response?.ok) throw new Error(response?.error || "Request failed");
    const optimized = response.optimized?.trim();
    if (!optimized) throw new Error("Gemini returned no text");
    if (!replaceSelection(selection, optimized)) {
      toast("Text changed while optimizing. Nothing was replaced.", 3600);
      return;
    }
    toast("Prompt optimized.", 1500);
  } catch (error) {
    toast(`Error: ${error.message}`, 3600);
  } finally {
    statusDone();
    setCursorLoading(false);
  }
}

// Listen for triggers from background/popup
chrome.runtime.onMessage.addListener((msg) => {
  if (msg?.type === "UPO_OPTIMIZE_SELECTION") {
    optimizeNow();
  }
});
