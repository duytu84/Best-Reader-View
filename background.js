// Bước 1: Nạp các thư viện Firebase đã tải về vào service worker
importScripts('firebase_sdk/firebase-app.js');
importScripts('firebase_sdk/firebase-auth.js');

// Copyright 2018 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

'use strict';

var possibleArticle = {};

// Bước 2: Khởi tạo Firebase (bạn cần thay thế bằng thông tin của mình nếu có)
// Nếu tiện ích không có file config riêng, có thể nó được nhúng ở nơi khác.
// Tạm thời chúng ta sẽ bỏ qua bước khởi tạo nếu không có thông tin.
/*
const firebaseConfig = {
  apiKey: "AIza...",
  authDomain: "project-id.firebaseapp.com",
  projectId: "project-id",
  storageBucket: "project-id.appspot.com",
  messagingSenderId: "...",
  appId: "..."
};
firebase.initializeApp(firebaseConfig);
*/


chrome.runtime.onInstalled.addListener(function () {
  chrome.contextMenus.create({
    "id": "showReaderViewContextMenu",
    "title": "Show Reader View",
    "contexts": ["page"],
    "documentUrlPatterns": ["*://*/*"]
  });
});


chrome.contextMenus.onClicked.addListener(function (info, tab) {
  if (info.menuItemId == "showReaderViewContextMenu") {
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      chrome.tabs.sendMessage(tabs[0].id, { type: "showReaderView" }, function (response) { });
    });
  }
});


chrome.runtime.onMessage.addListener(
  function (request, sender, sendResponse) {
    if (request.type == "readerViewPossible") {
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
      })
      sendResponse({});
    } else if (request.type == "readerViewNotPossible") {
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
      })
      sendResponse({});
    } else if (request.type == "sendFeedback") {
      getAuthToken(function (token) {
        if (!token) {
          sendResponse({ error: "noUser" });
        } else {
          // Logic gửi feedback sử dụng fetch vẫn giữ nguyên
        }
      });
      return true;
    } else if (request.type == 'userSignIn') {
      getAuthToken(function (token) {
        if (!token) {
          sendResponse({ error: "noUser" });
        } else {
          sendResponse({ token: token });
        }
      });
      return true;
    }
  });


function getAuthToken(callback) {
  chrome.identity.getAuthToken({ interactive: true }, function (token) {
    callback(token);
  });
}