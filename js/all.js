/******************************
 * 20170505
 * GuaHsu(guaswork@gmail.com)
 * http://guastudio.com
 ******************************/
/**
 * 設定區
 */
var pageViewQty = 12; //每頁顯示的景點數量
var noDataText = '未提供'; //無資料時顯示的文字

/**
 * 替換字元
 * @param {string} str 傳入的字串
 * @param {string} find 要比對的字串
 * @param {string} replace 要替換的字串
 * replace的g代表全部,否則只改第一個比對到的字串
 */
function replaceAll(str, find, replace) {
    return str.replace(new RegExp(find, 'g'), replace);
}

/**
 * 取得台北市行政區資料
 * 透過AJAX取得JSON資料
 */
var areaData = ''; //全部的行政區資料(全域變數)
function getAreaData() {
    var xhr = new XMLHttpRequest();
    xhr.open('get', 'data/viewZip.json', true);
    xhr.send(null);
    xhr.onload = function() {
        if (xhr.status == 200) {            
            areaData = JSON.parse(xhr.responseText);        
            createAreaSelect(); //建立行政區下拉選單
            getViewData(); //取得景點資料
        }else {
            document.querySelector('.box-area').innerHTML = '<h2>取得資料時發生錯誤，請檢查網路狀態並重新整理：）</h2>';
        }
    }
}

/**
 * 取得行政區景點資料
 * 透過AJAX取得JSON資料
 */
var viewData = '';
function getViewData() {
    var xhr = new XMLHttpRequest();
    xhr.open('get', 'data/viewData.json', true);
    xhr.send(null);
    xhr.onload = function() {
        if (xhr.status == 200) {       
            viewData = JSON.parse(xhr.responseText);
            //檢查LocalStorage中是否有存在最後一筆紀錄（瀏覽器重新整理判斷用）
            var lastPage = JSON.parse(localStorage.getItem('lastPage'));
            if (lastPage) {
                selectArea(lastPage.areaName, lastPage.pageNo);
            } else {
                selectArea()
            }
        }else {
            document.querySelector('.box-area').innerHTML = '<h2>取得資料時發生錯誤，請檢查網路狀態並重新整理：）</h2>';
        }
    }
}

/**
 * 組合行政區下拉選單
 */
function createAreaSelect() {
    var areaOptions = '';
    for (var i = 0; i < areaData.length; i++) {
        var areaName = areaData[i].District;
        var areaCode = areaData[i].areacode;
        areaOptions += '<option value="' + areaCode + '">' + areaName + '</option> ';
    }
    document.querySelector('.content__select').innerHTML = areaOptions;
}

/**
 * 設定景點資料
 * @param {*} areaName 行政區
 * @param {*} pageNo 頁碼
 */
var nowAreaName = '';
var nowViewData = []; 
var nowViewDataCnt = 0;
function setViewData(areaName, pageNo) {
    if (nowAreaName != areaName) {
        nowAreaName = areaName
        nowViewData = [];
        for (var i = 0; i < viewData.length; i++) {
            var dataNo = viewData[i].RowNumber || noDataText;
            var dataAreaName = viewData[i].address.substr(5, 3) || noDataText;
            var dataTitle = viewData[i].stitle || noDataText;
            var dataDesc = viewData[i].xbody || noDataText;
            var dataMRT = viewData[i].MRT || noDataText;
            var dataInfo = viewData[i].info || noDataText;
            var dataOpenTime = viewData[i].MEMO_TIME || noDataText;
            var dataAddress = viewData[i].address || noDataText;
            var dataTel = viewData[i].MEMO_TEL || noDataText;
            //景點圖片處理,因有可能非陣列,對其進行陣列判斷
            if (viewData[i].file.img.length === undefined) {
                var dataPic = viewData[i].file.img['#text'] || ''; //
                var dataPicDesc = viewData[i].file.img['-description'] || noDataText;
            } else {               
                var dataPic = viewData[i].file.img[0]['#text'] || '';
                var dataPicDesc = viewData[i].file.img[0]['-description'] || noDataText;
            }           
            if (dataAreaName == nowAreaName) {
                nowViewData.push({
                    'dataNo': dataNo,
                    'dataAreaName': dataAreaName,
                    'dataTitle': dataTitle,
                    'dataDesc': dataDesc,
                    'dataMRT': dataMRT,
                    'dataInfo': dataInfo,
                    'dataOpenTime': dataOpenTime,
                    'dataAddress': dataAddress,
                    'dataTel': dataTel,
                    'dataPic': dataPic,
                    'dataPicDesc': dataPicDesc,
                });
            }
        }       
        nowViewDataCnt = nowViewData.length;
    }
    //檢查是否有傳入頁碼,若無則設為第一頁
    if (!pageNo) {
        pageNo = '1';
    }
    createView(pageNo); //組出對應頁碼景點資料
    createPaging(pageNo); //組出分頁按鈕
    document.querySelector('.content__select').selectedOptions[0].text = nowAreaName;
}

/**
 * 建立景點
 * @param {*} pageNo 頁碼
 */
function createView(pageNo) {
    var viewBox = '';
    if (pageNo == 1) {
        var pageStart = 0;
        var pageEnd = pageViewQty;
    } else {
        var pageStart = parseInt(pageNo * pageViewQty - pageViewQty);
        var pageEnd = parseInt(pageNo * pageViewQty);
    }
    for (var i = pageStart; i < pageEnd; i++) {
        if (i == nowViewDataCnt) {
            break;
        }
        viewBox += '<div class="info-box">' +
            '<div class="info-box__top">' +
            '<img class="info-box__img" src="' + nowViewData[i].dataPic + '" alt="' + nowViewData[i].dataPicDesc + '">' +
            '<span class="info-box__view-name">' + nowViewData[i].dataTitle + '</span>' +
            '<span class="info-box__area-name">' + nowAreaName + '</span>' +
            '</div>' +
            '<div class="info-box__bottom">' +
            '<span class="info-box__span"><b>地址:</b>' + nowViewData[i].dataAddress + '</span>' +
            '<span class="info-box__span"><b>電話:</b>' + nowViewData[i].dataTel + '</span>' +
            '<span class="info-box__span"><b>時間:</b>' + nowViewData[i].dataOpenTime + '</span>' +
            '<button type="button" class="button button--readMore" data-viewNo="' + nowViewData[i].dataNo + '">景點介紹</span>' +
            '</div>' +
            '</div>';

    }
    document.querySelector('.box-area').innerHTML = viewBox;
    //進行景點資料按鈕功能綁定
    setReadMoreButton();
}

/**
 * 景點資料按鈕功能綁定
 */
function setReadMoreButton() {
    var readMoreButton = document.querySelectorAll('.button--readMore');
    for (var i = 0; i < readMoreButton.length; i++) {
        readMoreButton[i].addEventListener('click', function(e) {
            showViewData(e.srcElement.getAttribute('data-viewNo'));
        }, false);
    }
}

/**
 * 組合分頁按鈕
 * @param {*} pageNo 頁碼
 */
function createPaging(pageNo) {
    var page = '';
    //計算分頁數量(當前景點總數/每頁要顯示的景點數量,無條件進位)
    var pageCnt = Math.ceil(nowViewDataCnt / pageViewQty);
    if (pageCnt > 1) {
        for (var i = 0; i < pageCnt; i++) {
            var setNo = parseInt(i + 1);
            if (pageNo == setNo) {
                page += '<li class="paging__pages paging__pages--active">' + setNo + '</li>';
            } else {
                page += '<li class="paging__pages">' + setNo + '</li>';
            }
        }
        document.querySelector('.paging').innerHTML = page;
        //綁定分頁按鈕功能
        setPageButton()
    }
}

/**
 * 綁定分頁按鈕功能
 */
function setPageButton() {
    var pageEl = document.querySelectorAll('.paging__pages');
    for (var i = 0; i < pageEl.length; i++) {
        pageEl[i].addEventListener('click', function(e) {
            pageNo = e.srcElement.textContent;
            window.scrollTo(0, 300);
            //寫入瀏覽紀錄
            setHistory(nowAreaName, pageNo);
            //建立對應頁碼的景點資料
            createView(pageNo); 
            //建立對應頁碼的分頁按鈕
            createPaging(pageNo); 
        }, false);
    }
}

/**
 * 選擇行政區功能
 * @param {*} areaName 行政區
 * @param {*} pageNo 頁碼
 */
function selectArea(areaName, pageNo) {
    //如果沒傳入頁碼,則頁碼為1,並儲存瀏覽紀錄
    if (!pageNo) {
        pageNo = 1;
        areaName = document.querySelector('.content__select').selectedOptions[0].text;
        setHistory(areaName, pageNo);
    }
    //建立對應的景點資料
    setViewData(areaName, pageNo)
}

/**
 * 寫入瀏覽紀錄
 * @param {*} areaName 行政區
 * @param {*} pageNo 頁碼
 * 紀錄當前行政區及頁數,並儲存在history及localstorage中
 */
function setHistory(areaName, pageNo) {
    var historyData = '{"areaName":"' + areaName + '","pageNo":' + pageNo + '}';
    history.pushState(historyData, '', '');
    localStorage.setItem('lastPage', historyData);
}

/**
 * 處理瀏覽器上下頁行為
 * 當觸發時,檢查history.state是否有值
 * true:寫入localStorage中,並取出來組出對應的景點資料
 * false:直接回到上一頁
 */
window.onpopstate = function(e) {
    if (e.state) {
        localStorage.setItem('lastPage', e.state);
        var historyData = JSON.parse(e.state);
        //組出對應的景點資料
        setViewData(historyData.areaName, historyData.pageNo);
    } else {
        history.back();
    }
}

/**
 * 顯示景點資料框
 * @param {*} viewNo 景點編號
 */
function showViewData(viewNo) {
    for (var i = 0; i < nowViewData.length; i++) {
        if (viewNo == nowViewData[i].dataNo) {
            document.querySelector('.view-title').textContent = nowViewData[i].dataTitle;
            document.querySelector('.view-img').setAttribute('src', nowViewData[i].dataPic);
            document.querySelector('.view-img').setAttribute('alt', nowViewData[i].dataPicDesc);
            document.querySelector('.view-content').innerHTML = replaceAll(nowViewData[i].dataDesc, '。', '。<br />');
            document.querySelector('.view-add').innerHTML = nowViewData[i].dataAddress;
            document.querySelector('.view-tel').innerHTML = nowViewData[i].dataTel;
            document.querySelector('.view-time').innerHTML = replaceAll(nowViewData[i].dataOpenTime, /\n/g, '<br />');
            document.querySelector('.view-MRT').textContent = nowViewData[i].dataMRT;
            document.querySelector('.view-info').innerHTML = replaceAll(nowViewData[i].dataInfo, '。', '。<br />');
            break;
        }
    }
    //顯示景點資料框
    document.querySelector('.modal').style.display = 'block';
}

/**
 * 偵測景點資料框關閉
 */
function listenModalClose() {
    var closeModalEl = document.querySelector('.modal');
    closeModalEl.addEventListener('click', function(e) {
        if (e.target.className == 'modal' || e.target.classList.contains('button--close')) {
            document.querySelector('.modal').style.display = 'none';
        }
    })
}

/**
 * 偵測行政區選擇框
 */
function listenSelect() {
    var selectEl = document.querySelector('.content__select');
    selectEl.addEventListener('change', selectArea, false);
}

/**
 * 啟動程式
 */
function goStart() {
    //取得行政區資料
    getAreaData();
    //偵測行政區選擇框
    listenSelect();
    //偵測行政區選擇框
    listenModalClose();
}

//啟動程式
window.onload = goStart();