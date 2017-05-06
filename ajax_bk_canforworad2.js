/*GuaHsu20170505*/

// 設定區
var defaultArea = '中山區' //預設行政區
var pageViewQty = 12; //每頁顯示的景點數量
var noDataText = '未提供'; //無資料時顯示的文字

// 替換字元
function replaceAll(str, find, replace) {
  return str.replace(new RegExp(find, 'g'), replace);
}

// 取得JSON行政區
function getAreaData() {
    var xhr = new XMLHttpRequest();
    xhr.open('get', 'data/viewZip.json');
    xhr.send(null);
    xhr.onload = function(){
        var areaData = JSON.parse(xhr.responseText);
        createAreaSelect(areaData);
    }
}

// 組合行政區下拉選單
function createAreaSelect(areaData) {
    var areaOptions = '';
    for (var i = 0; i < areaData.length; i++) {
        var areaName = areaData[i].District;
        var areaCode = areaData[i].areacode;
        //把預設行政區放到Option的最前面
        if (areaName == defaultArea) {
            areaOptions = '<option value="' + areaCode + '">' + areaName + '</option> ' + areaOptions;
        } else {
            areaOptions += '<option value="' + areaCode + '">' + areaName + '</option> ';
        }
    }
    document.querySelector('.content__select').innerHTML = areaOptions;
    getViewData();
}

// 取得JSON景點資料
var viewData = '';
function getViewData() {
    var xhr = new XMLHttpRequest();
    xhr.open('get', 'data/viewData.json', true);
    xhr.send(null);
    xhr.onload = function(){    
        viewData = JSON.parse(xhr.responseText);
        selectArea();
    }
}

// 設定景點資料
var nowAreaName = '';
var nowViewData = [];
var nowViewDataCnt = 0;
function setViewData(areaName, pageNo) {
    if (nowAreaName != areaName) {
        nowAreaName = areaName
        nowViewData = [];
        // 取出行政區景點資料
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
            // 圖片陣列處理，只取第一筆
            if (viewData[i].file.img.length === undefined) {
                var dataPic = viewData[i].file.img['#text'] || '';
                var dataPicDesc = viewData[i].file.img['-description'] || noDataText;
            } else {
                var dataPic = viewData[i].file.img[0]['#text'] || '';
                var dataPicDesc = viewData[i].file.img[0]['-description'] || noDataText;
            }
            // 放入暫存區
            if (dataAreaName == areaName) {
                nowViewData.push({
                    'dataNo': dataNo,
                    'dataAreaName': dataAreaName,
                    'dataTitle': dataTitle,
                    'dataDesc':dataDesc,
                    'dataMRT': dataMRT,
                    'dataInfo':dataInfo,
                    'dataOpenTime':dataOpenTime,
                    'dataAddress': dataAddress,
                    'dataTel': dataTel,
                    'dataPic': dataPic,
                    'dataPicDesc': dataPicDesc,
                });
            }
        }        
        //計算目前資料筆數
        nowViewDataCnt = nowViewData.length;
    }  
    //檢查是否有傳入頁數
    if (!pageNo) {
        pageNo = '1';
    }
    //組出景點卡
    createView(pageNo);
    //組出分頁按鈕
    createPaging(pageNo);
    //變更選取框內容－for歷史紀錄用
    document.querySelector('.content__select').selectedOptions[0].text = nowAreaName;   
}

// 建立景點
function createView(pageNo) {
    var viewBox = '';
    if (pageNo == 1) {
        var pageStart = 0;
        var pageEnd = pageViewQty;
    }else { 
        var pageStart = parseInt(pageNo * pageViewQty - pageViewQty );
        var pageEnd = parseInt(pageNo * pageViewQty);
    }
    for (var i = pageStart; i < pageEnd; i++) {
        //若到達最後一筆則跳出組合迴圈
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
                    '<span class="info-box__span"><b>地址：</b>' + nowViewData[i].dataAddress + '</span>' +
                    '<span class="info-box__span"><b>電話：</b>' + nowViewData[i].dataTel + '</span>' +
                    '<span class="info-box__span"><b>時間：</b>' + nowViewData[i].dataOpenTime + '</span>' +                    
                    '<button type="button" class="button button--readMore" data-viewNo="' + nowViewData[i].dataNo + '">景點介紹</span>' + 
                    '</div>' +
                    '</div>';
        
    }
    document.querySelector('.box-area').innerHTML = viewBox;
    setReadMoreButton();
}

// 綁定景點介紹按鈕功能
function setReadMoreButton() {
    var readMoreButton = document.querySelectorAll('.button--readMore');
    for (var i = 0; i < readMoreButton.length; i++) {
            readMoreButton[i].addEventListener('click', function(e) { 
                showViewData(e.srcElement.getAttribute('data-viewNo'));
            }, false);
    }
}

// 組合分頁按鈕
function createPaging(pageNo) {
    var page = '';
    var pageCnt = Math.ceil(nowViewDataCnt/pageViewQty);
    if (pageCnt > 1) {
        for (var i = 0; i < pageCnt; i++) {
            var setNo = parseInt(i + 1);
            if (pageNo == setNo) {
                page += '<li class="paging__pages paging__pages--active">' + setNo + '</li>';
            }else {
                page += '<li class="paging__pages">' + setNo + '</li>'; 
            }           
        }
        document.querySelector('.paging').innerHTML = page;
        //啟動監聽分頁按鈕
        setPageButton()
    }
}

// 綁定分頁按鈕功能
function setPageButton() {
    var pageEl = document.querySelectorAll('.paging__pages');
    for (var i = 0; i < pageEl.length; i++) {
        pageEl[i].addEventListener('click', function(e) { 
            pageNo = e.srcElement.textContent;
            window.scrollTo(0, 300);
            setHistory(nowAreaName, pageNo);
            createView(pageNo);
            createPaging(pageNo);
        }, false);
    }
}

// 偵測行政區變更
var selectEl = document.querySelector('.content__select');
selectEl.addEventListener('change', selectArea, false);
// 選擇行政區功能
function selectArea(areaName) {
    areaName = document.querySelector('.content__select').selectedOptions[0].text;
    setHistory(areaName, 1);
    setViewData(areaName) 
}

// 紀錄歷史紀錄
function setHistory(areaName, pageNo){
    console.log('areaName:' + areaName);
    console.log('pageNo:' + pageNo);
    var historyData = JSON.stringify({'areaName': areaName,'pageNo': pageNo});
    history.pushState(historyData, '', '');
}

// 操縱歷史紀錄
window.onpopstate = function(e) {
    console.log('e.state:' + JSON.stringify(e.state));
    var historyData = JSON.parse(e.state);
    console.log('historyData:' + JSON.stringify(historyData));
    setViewData(historyData.areaName, historyData.pageNo);
}

// 離開前紀錄當前的頁面紀錄


// 打開景點介紹內容
function showViewData(viewNo) {
    for (var i = 0; i < nowViewData.length; i++) {
        if (viewNo == nowViewData[i].dataNo) {
            document.querySelector('.view-title').textContent = nowViewData[i].dataTitle;
            document.querySelector('.view-img').setAttribute('src', nowViewData[i].dataPic);
            document.querySelector('.view-img').setAttribute('alt', nowViewData[i].dataPicDesc);
            document.querySelector('.view-content').innerHTML = replaceAll(nowViewData[i].dataDesc,'。', '。<br />');
            document.querySelector('.view-add').innerHTML = nowViewData[i].dataAddress;
            document.querySelector('.view-tel').innerHTML = nowViewData[i].dataTel;
            document.querySelector('.view-time').innerHTML = replaceAll(nowViewData[i].dataOpenTime,/\n/g, '<br />');
            document.querySelector('.view-MRT').textContent = nowViewData[i].dataMRT;
            document.querySelector('.view-info').innerHTML = replaceAll(nowViewData[i].dataInfo,'。', '。<br />');
        }
    }
    document.querySelector('.modal').style.display='block';
}

// 關閉景點介紹內容
var closeModalEl = document.querySelector('.modal');
closeModalEl.addEventListener('click', function(e){
    if(e.target.className == 'modal' || e.target.classList.contains('button--close')){
        document.querySelector('.modal').style.display='none';
    }
})

// 啟動
window.onload = getAreaData();