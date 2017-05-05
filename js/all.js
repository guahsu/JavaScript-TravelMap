// 設定區
var defaultZip = '104'; //預設行政區
var defaultName = '中山區' //預設行政區
var viewCardNum = 12; //每頁顯示的景點數量
var noDataText = '未提供'; //無資料時顯示的文字

// 替換字元
function replaceAll(str, find, replace) {
  return str.replace(new RegExp(find, 'g'), replace);
}

// 取得JSON行政區
function getViewZip() {
    var xhr = new XMLHttpRequest();
    xhr.open('get', 'data/viewZip.json');
    xhr.send(null);
    xhr.onload = function(){
        var zipData = JSON.parse(xhr.responseText);
        createViewZip(zipData);
    }
}

// 組合行政區下拉選單
function createViewZip(zipData) {
    var zipOption = '';
    for (var index = 0; index < zipData.length; index++) {
        var zipName = zipData[index].District;
        var zipCode = zipData[index].zipcode;
        //把預設行政區放到Option的最前面
        if (zipName == defaultName) {
            zipOption = '<option value="' + zipCode + '">' + zipName + '</option> ' + zipOption;
        } else {
            zipOption += '<option value="' + zipCode + '">' + zipName + '</option> ';
        }
    }
    document.querySelector('.content__select').innerHTML = zipOption;
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
        setViewData(defaultName);
    }
}

// 設定景點資料
var nowArea = '';
var nowData = [];
var nowDataLength = 0;
function setViewData(selectZipName) {
    if (nowArea != selectZipName) {
        nowArea = selectZipName
        nowData = [];
        // 設定行政區大標題
        // document.querySelector('.content__title').textContent = '- ' + selectZipName + ' -';

        // 取出行政區景點資料
        for (var index = 0; index < viewData.length; index++) {
            var dataNo = viewData[index].RowNumber || noDataText;
            var dataZip = viewData[index].address.substr(5, 3) || noDataText;
            var dataTitle = viewData[index].stitle || noDataText;
            var dataBody = viewData[index].xbody || noDataText;
            var dataMRT = viewData[index].MRT || noDataText;
            var dataInfo = viewData[index].info || noDataText;
            var dataOpenTime = viewData[index].MEMO_TIME || noDataText;
            var dataAddress = viewData[index].address || noDataText;
            var dataTel = viewData[index].MEMO_TEL || noDataText;
            // 圖片陣列處理，只取第一筆
            if (viewData[index].file.img.length === undefined) {
                var dataPic = viewData[index].file.img['#text'] || '';
                var dataPicDesc = viewData[index].file.img['-description'] || noDataText;
            } else {
                var dataPic = viewData[index].file.img[0]['#text'] || '';
                var dataPicDesc = viewData[index].file.img[0]['-description'] || noDataText;
            }
            // 放入暫存區
            if (dataZip == selectZipName) {
                selectData = {
                    'dataNo': dataNo,
                    'dataZip': dataZip,
                    'dataTitle': dataTitle,
                    'dataBody':dataBody,
                    'dataMRT': dataMRT,
                    'dataInfo':dataInfo,
                    'dataOpenTime':dataOpenTime,
                    'dataAddress': dataAddress,
                    'dataTel': dataTel,
                    'dataPic': dataPic,
                    'dataPicDesc': dataPicDesc,
                };
                nowData.push(selectData);
            }
        }
        
        //計算目前資料筆數
        nowDataLength = nowData.length;
        //組出第一頁的景點卡
        createViewCard(1);
        //組出分頁按鈕
        createPages(1);
    }        
}

// 組合景點資料卡
function createViewCard(pageNum) {
    var infoBox = '';
    var pagas = '';
    if (pageNum == 1) {
        var pageStart = 0;
        var pageEnd = viewCardNum;
    }else { 
        var pageStart = parseInt(pageNum * viewCardNum - viewCardNum );
        var pageEnd = parseInt(pageNum * viewCardNum);
    }
    for (var index = pageStart; index < pageEnd; index++) {
        //若到達最後一筆則跳出組合迴圈
        if (index == nowDataLength) {
            break;
        }
        infoBox += '<div class="info-box">' +
                    '<div class="info-box__top">' +
                    '<img class="info-box__img" src="' + nowData[index].dataPic + '" alt="' + nowData[index].dataPicDesc + '">' +
                    '<span class="info-box__view-name">' + nowData[index].dataTitle + '</span>' +
                    '<span class="info-box__area-name">' + nowArea + '</span>' +
                    '</div>' +
                    '<div class="info-box__bottom">' +
                    '<span class="info-box__span"><b>地址：</b>' + nowData[index].dataAddress + '</span>' +
                    '<span class="info-box__span"><b>電話：</b>' + nowData[index].dataTel + '</span>' +
                    '<span class="info-box__span"><b>時間：</b>' + nowData[index].dataOpenTime + '</span>' +                    
                    '<button type="button" class="button button--readMore" data-viewNo="' + nowData[index].dataNo + '">景點介紹</span>' + 
                    '</div>' +
                    '</div>';
        
    }
    document.querySelector('.box-area').innerHTML = infoBox;
    setReadMoreClick();
}

// 綁定景點介紹按鈕功能
function setReadMoreClick() {
    var readMoreEl = document.querySelectorAll('.button--readMore');
    for (var index = 0; index < readMoreEl.length; index++) {
            readMoreEl[index].addEventListener('click', function(e){ 
            setViewContent(e.srcElement.getAttribute('data-viewNo'));
        }, false);
    }
}

// 組合分頁按鈕
function createPages(pageNum) {
    var pagas = '';
    var selectDataLenght = nowData.length;
    var pageCount = Math.ceil(selectDataLenght/viewCardNum);
    if (pageCount > 1) {
        for (var index = 0; index < pageCount; index++) {
            setNum = parseInt(index + 1);
            if (pageNum == setNum) {
                pagas += '<li class="paging__pages paging__pages--active">' + setNum + '</li>';
            }else {
                pagas += '<li class="paging__pages">' + setNum + '</li>'; 
            }           
        }
        document.querySelector('.paging').innerHTML = pagas;
        //啟動監聽分頁按鈕
        setPageClick()
    }
}

// 綁定分頁按鈕功能
function setPageClick() {
    var pageEl = document.querySelectorAll('.paging__pages');
    for (var index = 0; index < pageEl.length; index++) {
        pageEl[index].addEventListener('click', function(e){ 
            window.scrollTo(0, 300);
            createViewCard(e.srcElement.textContent);
            createPages(e.srcElement.textContent);
        }, false);
    }
}

// 切換行政區功能
var selectZipName = '';
var selectEl = document.querySelector('.content__select');
selectEl.addEventListener('change', function(){ 
    selectZipName = selectEl.selectedOptions[0].text;
    setViewData(selectZipName) 
}, false);

// 打開景點介紹內容
function setViewContent(viewNo) {
    for (var index = 0; index < nowData.length; index++) {
        if (viewNo == nowData[index].dataNo) {
            document.querySelector('.view-title').textContent = nowData[index].dataTitle;
            document.querySelector('.view-img').setAttribute('src', nowData[index].dataPic);
            document.querySelector('.view-img').setAttribute('alt', nowData[index].dataPicDesc);
            document.querySelector('.view-content').innerHTML = replaceAll(nowData[index].dataBody,'。', '。<br />');
            document.querySelector('.view-add').innerHTML = nowData[index].dataAddress;
            document.querySelector('.view-tel').innerHTML = nowData[index].dataTel;
            document.querySelector('.view-time').innerHTML = replaceAll(nowData[index].dataOpenTime,/\n/g, '<br />');
            document.querySelector('.view-MRT').textContent = nowData[index].dataMRT;
            document.querySelector('.view-info').innerHTML = replaceAll(nowData[index].dataInfo,'。', '。<br />');
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
window.onload = getViewZip();
