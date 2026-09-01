// Service worker: keeps a per-tab count of blocked tracker requests and
// exposes a small message API the popup uses to read/reset it.

const tabCounts = new Map();

function increment(tabId) {
  if (tabId === undefined || tabId < 0) return;
  const current = tabCounts.get(tabId) || 0;
  tabCounts.set(tabId, current + 1);
  chrome.action.setBadgeText({ tabId, text: String(current + 1) });
  chrome.action.setBadgeBackgroundColor({ tabId, color: "#c0392b" });
}

// Fires for every request matched by a declarativeNetRequest rule.
// Only available while the extension is unpacked / in developer mode,
// which is expected for a portfolio project run locally.
if (chrome.declarativeNetRequest.onRuleMatchedDebug) {
  chrome.declarativeNetRequest.onRuleMatchedDebug.addListener(async (info) => {
    increment(info.request.tabId);
    const { totalBlocked = 0 } = await chrome.storage.local.get("totalBlocked");
    chrome.storage.local.set({ totalBlocked: totalBlocked + 1 });
  });
}

chrome.tabs.onRemoved.addListener((tabId) => {
  tabCounts.delete(tabId);
});

chrome.tabs.onUpdated.addListener((tabId, changeInfo) => {
  if (changeInfo.status === "loading") {
    tabCounts.set(tabId, 0);
    chrome.action.setBadgeText({ tabId, text: "" });
  }
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message?.type === "GET_TAB_BLOCK_COUNT") {
    sendResponse({ count: tabCounts.get(message.tabId) || 0 });
  }
  return true;
});

chrome.runtime.onInstalled.addListener(async () => {
  const existing = await chrome.storage.local.get(["trackingEnabled", "totalBlocked"]);
  if (existing.trackingEnabled === undefined) {
    await chrome.storage.local.set({ trackingEnabled: true, totalBlocked: 0 });
  }
});
