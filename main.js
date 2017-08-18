//'use strict';
try {
  var StphamTranslator = {

    extensionStatus: null,
    lastText: "",

    // Khởi tạo chương trình dịch
    init() {

      // Bật-Tắt tiện ích khi khởi động
      chrome.runtime.sendMessage("getExtensionStatus", function(response) {
        StphamTranslator.extensionStatus = (response == "true") ? true : false;
        console.log("StphamTranslator.extensionStatus => ", StphamTranslator.extensionStatus); // DEBUG
      });

      // Bật-Tắt tiện ích khi bấm vào icon
      chrome.runtime.onMessage.addListener(function (sendResponse) {
        StphamTranslator.extensionStatus = (sendResponse == "true") ? true : false;
        console.log("StphamTranslator.extensionStatus => ", StphamTranslator.extensionStatus); // DEBUG
      });

      // Lắng nghe hành động nhả chuột phải
      document.addEventListener('mouseup', StphamTranslator.mouseup);

    },

    // Lắng nghe hành động nhả chuột phải
    mouseup(event) {
      if (event.which !== 3) {
        StphamTranslator.run();
      }
    },

    // Chạy tiện ích
    run() {
      if (StphamTranslator.extensionStatus === true) {
        var selectionText = StphamTranslator.getSelectionText();
        if (selectionText !== "") {
          var foreignText = selectionText.replace(/^\s*/, "").replace(/\s*$/, "");
          if (StphamTranslator.lastText != foreignText) {
            StphamTranslator.lastText = foreignText;
            StphamTranslator.translate(foreignText);
          }
        }
      }
    },

    // Thực hiện dịch
    translate(foreignText) {
      var url = "https://translate.googleapis.com/translate_a/single";
      var param = "sl=auto&tl=vi&dt=t&q=" + encodeURIComponent(foreignText);
      var urlFull = url + "?client=gtx&" + param;
      // Dịch bằng API của Google Translate
      StphamTranslator.loadAjax(urlFull).then(function (response) {
        var responseText = "";
        for (i = 0; i < response[0].length; i++) {
          responseText += response[0][i][0];
        }
        // Hoàn thành dịch và hiển thị kết quả ra màn hình
        StphamTranslator.complete(responseText);
      });
    },

    complete(responseText) {
      console.clear();
      console.log("%c" + responseText, 'font-size: x-large'); // DEBUG
    },


    // Lấy chữ của đoạn bôi đen
    getSelectionText() {
      var text = "";
      var activeEl = document.activeElement;
      var activeElTagName = document.activeElement.tagName.toLowerCase();
      if ((activeElTagName == "textarea") || (activeElTagName == "input" && /^(?:text|search|password|tel|url)$/i.test(activeEl.type)) && (typeof activeEl.selectionStart == "number")) {} else if (window.getSelection) {
        text = window.getSelection().toString();
      }
      return text;
    },

    // Load Ajax
    loadAjax(url) {
      'use strict';
      var xhr = new XMLHttpRequest();
      return new Promise((resolve, reject) => {
        xhr.onreadystatechange = function () {
          if (xhr.readyState === 4) {
            if (xhr.status === 200) {
              resolve(JSON.parse(xhr.responseText));
            } else {
              reject(xhr.responseText);
            }
          }
        };
        xhr.open('GET', url);
        xhr.send();
      });
    }

    // Cuối Object
  }
} catch(e) {
  // Làm gì đó
}

// Kích hoạt chức năng
StphamTranslator.init();

