// Khởi tạo storage
if (localStorage.getItem("extensionStatus") === null) {
  localStorage.setItem("extensionStatus", "true");
}

// Bật-Tắt tiện ích khi khởi động
chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  if (request === "getExtensionStatus") {
    sendResponse(localStorage.getItem("extensionStatus"));
  }
});

// Bật-Tắt tiện ích khi bấm vào icon
chrome.browserAction.onClicked.addListener(function (tab) {
  var extensionStatus = (localStorage.getItem("extensionStatus") === "true") ? "false" : "true";
  chrome.tabs.sendMessage(tab.id, extensionStatus);
  localStorage.setItem("extensionStatus", extensionStatus);
  chrome.browserAction.setIcon({path : "icon_" + extensionStatus + ".png"});
});

// Tạo icon Bật-Tắt
chrome.browserAction.setIcon({path : "icon_" + localStorage.getItem("extensionStatus") + ".png"});
