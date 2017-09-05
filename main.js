try {
  StphamTranslator = {

    extensionStatus : null,
    lastText        : "",
    maxHeight       : "",
    setPosition     : false,

    // Khởi tạo chương trình dịch
    init() {

      // Bật-Tắt tiện ích khi khởi động
      chrome.runtime.sendMessage("getExtensionStatus", function (response) {
        StphamTranslator.extensionStatus = (response === "true");
        StphamTranslator.initDivElement();
      });

      // Bật-Tắt tiện ích khi bấm vào icon
      chrome.runtime.onMessage.addListener(function (sendResponse) {
        StphamTranslator.extensionStatus = (sendResponse === "true");
        StphamTranslator.initDivElement();
      });

      // Lắng nghe hành động nhả chuột phải
      document.addEventListener("mouseup", StphamTranslator.mouseupAction);

    },

    // Chạy tiện ích
    run() {
      if (StphamTranslator.extensionStatus === true) {
        // Kiểm tra bôi đen
        let selectionText = StphamTranslator.getSelectionText();
        if (selectionText !== "") {
          let lastText = StphamTranslator.lastText;
          let foreignText = selectionText.replace(/^\s*/, "").replace(/\s*$/, "");
          if (lastText !== foreignText) {
            lastText = foreignText;
            StphamTranslator.translate(foreignText);
          }
        }
      }
    },

    // Thực hiện dịch
    translate(foreignText) {
      let url = "https://translate.googleapis.com/translate_a/single";
      let param = "sl=auto&tl=vi&dt=t&q=" + encodeURIComponent(foreignText);
      let urlFull = url + "?client=gtx&" + param;
      // Dịch bằng API của Google Translate
      StphamTranslator.loadAjax(urlFull).then(function (response) {
        let responseText = "";
        for (let i = 0; i < response[0].length; i++) {
          responseText += response[0][i][0];
        }

        // Hoàn thành dịch và hiển thị kết quả ra màn hình
        let divTranslate = $("#stpham-translate");
        let divTranslateText = $("#stpham-translate-text");
        divTranslateText.text(responseText);
        divTranslate.show();
        divTranslate.css({"top" : divTranslate.position().top, "bottom" : "auto"});
      });
    },

    // Tạo Div
    initDivElement() {
      $(function () {
        if (StphamTranslator.extensionStatus === true) {
          let divTranslate = "<div id=\"stpham-translate\"> <div id=\"stpham-translate-text\"> </div> </div>";
          $("body").append(divTranslate);
          let element = $("#stpham-translate");
          element.draggable({containment : "window"});
          element.resizable();
          element.hide();
        } else {
          $("#stpham-translate").remove();
        }
      });
    },

    // Lắng nghe hành động nhả chuột phải
    mouseupAction(event) {
      if (event.which !== 3) {
        StphamTranslator.run();
      }
    },

    // Lấy chữ của đoạn bôi đen
    getSelectionText() {
      let text = "";
      let activeEl = document.activeElement;
      let activeElTagName = document.activeElement.tagName.toLowerCase();
      if ((activeElTagName === "textarea") || (activeElTagName === "input" && /^(?:text|search|password|tel|url)$/i.test(activeEl.type)) && (typeof activeEl.selectionStart === "number")) {
      } else {
        if (window.getSelection) {
          text = window.getSelection().toString();
        }
      }
      return text;
    },

    // Load Ajax
    loadAjax(url) {
      "use strict";
      let xhr = new XMLHttpRequest();
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
        xhr.open("GET", url);
        xhr.send();
      });
    }

    // Cuối Object
  };
} catch (e) {
  // Làm gì đó
}

// Kích hoạt chức năng
StphamTranslator.init();

