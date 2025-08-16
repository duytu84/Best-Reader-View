'use strict';

var possibleArticle = {};

chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    "id": "showReaderViewContextMenu",
    "title": "Show Reader View",
    "contexts": ["page"],
    "documentUrlPatterns": ["*://*/*"]
  });
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === "showReaderViewContextMenu") {
    chrome.tabs.sendMessage(tab.id, { type: "showReaderView" }, (response) => {
      if (chrome.runtime.lastError) {
        // Lỗi này có thể xảy ra nếu content script chưa được tiêm vào, có thể bỏ qua
      }
    });
  }
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === "readerViewPossible") {
    possibleArticle[sender.tab.id] = true;
    chrome.action.setIcon({
      tabId: sender.tab.id,
      path: {
        "32": "images/icon-text-32.png",
        "64": "images/icon-text-64.png"
      }
    });
    chrome.action.setTitle({
      tabId: sender.tab.id,
      title: "Click to show Best Reader View"
    });
    sendResponse({});
  } else if (request.type === "readerViewNotPossible") {
    possibleArticle[sender.tab.id] = false;
    chrome.action.setIcon({
      tabId: sender.tab.id,
      path: {
        "32": "images/icon-text-32-2.png",
        "64": "images/icon-text-64-2.png"
      }
    });
    chrome.action.setTitle({
      tabId: sender.tab.id,
      title: "Best Reader View is not available for this page"
    });
    sendResponse({});
  } else if (request.type === 'userSignIn') {
    getAuthToken((token) => {
      if (!token) {
        sendResponse({ error: "noUser" });
      } else {
        sendResponse({ token: token });
      }
    });
    return true; // Bắt buộc phải có để giữ kênh message mở cho sendResponse bất đồng bộ
  }
});

function getAuthToken(callback) {
  chrome.identity.getAuthToken({ interactive: true }, (token) => {
    if (chrome.runtime.lastError) {
      console.warn(chrome.runtime.lastError.message);
      callback(null);
      return;
    }
    callback(token);
  });
}
