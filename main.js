//'use strict';
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
        StphamTranslator.makeElement();
      });

      // Bật-Tắt tiện ích khi bấm vào icon
      chrome.runtime.onMessage.addListener(function (sendResponse) {
        StphamTranslator.extensionStatus = (sendResponse === "true");
        StphamTranslator.makeElement();
      });

      // Lắng nghe hành động nhả chuột phải
      document.addEventListener("mouseup", StphamTranslator.mouseupAction);

    },

    // Lắng nghe hành động nhả chuột phải
    mouseupAction(event) {
      if (event.which !== 3) {
        StphamTranslator.run();
      }
    },

    // Chạy tiện ích
    run() {
      if (StphamTranslator.extensionStatus === true) {
        // Kiểm tra bôi đen
        let selectionText = StphamTranslator.getSelectionText();
        if (selectionText !== "") {
          let foreignText = selectionText.replace(/^\s*/, "").replace(/\s*$/, "");
          if (StphamTranslator.lastText !== foreignText) {
            StphamTranslator.lastText = foreignText;
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
        for (i = 0; i < response[0].length; i++) {
          responseText += response[0][i][0];
        }

        // Hoàn thành dịch và hiển thị kết quả ra màn hình
        let element = $("#stpham-translate");
        let elementText = $("#stpham-translate-text");

        elementText.text(responseText);

        if (StphamTranslator.setPosition === false) {
          StphamTranslator.delay(2000).then(function () {
            StphamTranslator.setPositionAction();
            StphamTranslator.setPosition = true;
            element.show();
          });
        }

        // StphamTranslator.delay(100).then(setSize);
        //
        // function setSize() {
        //   //element.css("min-height", (StphamTranslator.maxHeight < elementText.height()) ? StphamTranslator.maxHeight : elementText.height());
        //   //element.css("min-width", elementText.width());
        //   // element.css("height", element.width());
        //   // element.css("width", element.width());
        //
        //   //elementText.css("min-height", element.height());
        //   //elementText.css("min-width", element.width());
        //   // elementText.css("height", element.height());
        //   // elementText.css("width", element.width());
        // }
        //
        // StphamTranslator.delay(500).then();

      });
    },

    delay(ms) {
      let ctr, rej, p = new Promise(function (resolve, reject) {
        ctr = setTimeout(resolve, ms);
        rej = reject;
      });
      p.cancel = function () {
        clearTimeout(ctr);
        rej(Error("Cancelled"));
      };
      return p;
    },

    // Tạo Div
    makeElement() {
      $(function () {
        if (StphamTranslator.extensionStatus === true) {
          let divTranslate = "<div id=\"stpham-translate\"> <div id=\"stpham-translate-text\"> </div> </div>";
          $("body").append(divTranslate);
          let element = $("#stpham-translate");
          element.hide();
          element.draggable();
          element.resizable();
          StphamTranslator.initPosition();
        } else {
          $("#stpham-translate").remove();
        }
      });
    },

    // Định vị vị trí hiển thị
    setPositionAction() {
      $(function () {
        let element = $("#stpham-translate");

        let elementHeight = element.height();

        console.log("elementHeight > ", elementHeight);
        console.log("StphamTranslator.maxHeight > ", StphamTranslator.maxHeight);

        element.css("height", (elementHeight >= StphamTranslator.maxHeight) ? StphamTranslator.maxHeight : elementHeight);
      });
    },

    // Khởi tạo vị trí hiển thị
    initPosition() {
      $(function () {
        let windowHeight = $(window).height();
        let windowWidth = $(window).width();
        let maxHeight = (windowHeight * 40 / 100);
        let minHeight = (windowHeight * 10 / 100);
        let maxWidth = (windowWidth * 90 / 100);
        let mixWidth = (windowWidth * 30 / 100);
        let left = (windowWidth - maxWidth) / 2;
        let bottom = (windowHeight - maxHeight) / 2;

        StphamTranslator.maxHeight = maxHeight;

        let element = $("#stpham-translate");

        element.css("max-height", maxHeight);
        element.css("min-height", minHeight);
        element.css("max-width", maxWidth);
        element.css("min-width", mixWidth);

        element.css("height", minHeight);
        element.css("width", maxWidth);
        element.css("left", left);
        element.css("bottom", bottom);

        let elementText = $("#stpham-translate-text");

        elementText.css("max-height", maxHeight);
        elementText.css("max-width", maxWidth);
      });
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

