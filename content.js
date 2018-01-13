//'use strict';
try {
  StphamTranslator = {
    extensionStatus : null,
    isShow          : false,
    isElement       : false,

    /**
     * Khởi tạo tiện ích dịch
     */
    init() {
      // Bật-Tắt tiện ích khi khởi động
      chrome.runtime.sendMessage("getExtensionStatus", function (response) {
        StphamTranslator.extensionStatus = (response === "true");
        StphamTranslator.initDivElement();
      });

      // Bật-Tắt tiện ích từ background
      chrome.runtime.onMessage.addListener(function (sendResponse) {
        StphamTranslator.extensionStatus = (sendResponse === "true");
        StphamTranslator.initDivElement();
      });

      // Lắng nghe hành động nhả chuột phải
      document.addEventListener("mouseup", StphamTranslator.mouseupAction);

      // Bấm phím tắt F4
      document.addEventListener("keyup", function (e) {
        let keyCode = e.keyCode;
        if (keyCode === 115) {
          chrome.runtime.sendMessage("hotkey");
        }
      });

    },

    /**
     * Chạy tiện ích dịch
     */
    run() {
      if (StphamTranslator.extensionStatus === true) {
        // Kiểm tra bôi đen
        let selectionText = StphamTranslator.getSelectionText();
        if (selectionText !== "") {
          console.log("Run Stpham Translate");
          let foreignText = selectionText.replace(/^\s*/, "").replace(/\s*$/, "");
          StphamTranslator.translate(foreignText);
        }
      }
    },

    /**
     * Thực hiện dịch
     * @param foreignText - Nội dung muốn dịch
     */
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
        // Kiểm tra hiển thị
        if (StphamTranslator.isShow === false) {
		  divTranslate.show();
          divTranslate.css({"top" : divTranslate.position().top, "bottom" : "auto"});
          StphamTranslator.isShow = true;
        }
      });
    },

    /**
     * Khởi tạo thẻ DIV
     */
    initDivElement() {
      $(function () {
        if (StphamTranslator.extensionStatus === true && StphamTranslator.isElement === false) {
          let divTranslate = "<div id=\"stpham-translate\"> <div id=\"stpham-translate-text\"> </div> </div>";
          let aFixedButton = "<a id=\"fixedbutton\"><strong data-text=\"🌎\"></strong></a>";
          $("body").append(divTranslate);
          $("body").append(aFixedButton);
		  
		  $('#fixedbutton').click(function(){
		    if ( $("#stpham-translate").is(":visible") ) { 
		  	$("#stpham-translate").hide(); 
		    } else if ( $("#stpham-translate").is(":hidden") ) { 
		  	$("#stpham-translate").show(); 
		    }
		  })
		  
          let element = $("#stpham-translate");
          element.draggable();
          element.resizable();
          element.hide();
          StphamTranslator.isElement = true;
          StphamTranslator.run();
        } else {
          console.log("Disable Stpham Translate");
          $("#stpham-translate").remove();
          $("#fixedbutton").remove();
          StphamTranslator.isElement = false;
		  StphamTranslator.isShow = false;
        }
      });
    },

    /**
     * Hành động khi bắt được mouseup
     * @param event
     */
    mouseupAction(event) {
      if (event.which !== 3) {
        StphamTranslator.run();
      }
    },

    /**
     * Lấy nội dung đoạn chữ bôi đen
     * @returns {string} - Trả về đoạn chữ được tinh chỉnh
     */
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

    /**
     * Tải Ajax
     * @param url
     * @returns {Promise} - Trả về kết quả html
     */
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

  };
} catch (e) {
}

StphamTranslator.init();

