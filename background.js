// Khởi tạo storage
if (localStorage.getItem("extensionStatus") === null) {
  localStorage.setItem("extensionStatus", "true");
}

// Bật-Tắt tiện ích khi khởi động và khi bấm hotkey
chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  if (request === "getExtensionStatus") {
    sendResponse(localStorage.getItem("extensionStatus"));
  }
  if (request === "hotkey") {
    handleExtension(sender.tab);
  }
});

// Bật-Tắt tiện ích khi bấm vào icon
chrome.browserAction.onClicked.addListener(function (tab) {
  handleExtension(tab);
});

// Hàm xử lý tin nhắn
function handleExtension(tab) {
  let extensionStatus = (localStorage.getItem("extensionStatus") === "true") ? "false" : "true";
  // Phản hồi : Bật-Tắt tiện ích từ background
  chrome.tabs.sendMessage(tab.id, extensionStatus);
  // Lưu vào storage trạng thái của extension
  localStorage.setItem("extensionStatus", extensionStatus);
  // Thay đổi icon
  chrome.browserAction.setIcon({path : "icons/icon_" + extensionStatus + ".png"});
}

// Tạo icon Bật-Tắt
chrome.browserAction.setIcon({path : "icons/icon_" + localStorage.getItem("extensionStatus") + ".png"});

