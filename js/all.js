//http://data.ntpc.gov.tw/od/data/api/AC110AF8-C847-43E5-B62C-7985E9E049F9?$format=json
// var zipData = [{"District":"萬里區","zipcode":"207"},{"District":"金山區","zipcode":"208"},{"District":"板橋區","zipcode":"220"},{"District":"汐止區","zipcode":"221"},{"District":"深坑區","zipcode":"222"},{"District":"石碇區","zipcode":"223"},{"District":"瑞芳區","zipcode":"224"},{"District":"平溪區","zipcode":"226"},{"District":"雙溪區","zipcode":"227"},{"District":"貢寮區","zipcode":"228"},{"District":"新店區","zipcode":"231"},{"District":"坪林區","zipcode":"232"},{"District":"烏來區","zipcode":"233"},{"District":"永和區","zipcode":"234"},{"District":"中和區","zipcode":"235"},{"District":"土城區","zipcode":"236"},{"District":"三峽區","zipcode":"237"},{"District":"樹林區","zipcode":"238"},{"District":"鶯歌區","zipcode":"239"},{"District":"三重區","zipcode":"241"},{"District":"新莊區","zipcode":"242"},{"District":"泰山區","zipcode":"243"},{"District":"林口區","zipcode":"244"},{"District":"蘆洲區","zipcode":"247"},{"District":"五股區","zipcode":"248"},{"District":"八里區","zipcode":"249"},{"District":"淡水區","zipcode":"251"},{"District":"三芝區","zipcode":"252"},{"District":"石門區","zipcode":"253"}];
var zipData = [{ "District": "中正區", "zipcode": "100" }, 
{ "District": "大同區", "zipcode": "103" }, 
{ "District": "中山區", "zipcode": "104" }, 
{ "District": "松山區", "zipcode": "105" }, 
{ "District": "大安區", "zipcode": "106" }, 
{ "District": "萬華區", "zipcode": "108" }, 
{ "District": "信義區", "zipcode": "110" }, 
{ "District": "士林區", "zipcode": "111" }, 
{ "District": "北投區", "zipcode": "112" }, 
{ "District": "內湖區", "zipcode": "114" }, 
{ "District": "南港區", "zipcode": "115" }, 
{ "District": "文山區", "zipcode": "116" },];



var defaultZip = '221';
var zipOption = '';

for (var index = 0; index < zipData.length; index++) {
    var zipName = zipData[index].District;
    var zipCode = zipData[index].zipcode;
    //把預設行政區放到Option的最前面
    if (zipCode == defaultZip) {
        zipOption = '<option value="' + zipCode + '">' + zipName + '</option> ' + zipOption; 
    } else {
        zipOption += '<option value="' + zipCode + '">' + zipName + '</option> ';  
    }
}
document.querySelector('#select-area').innerHTML = zipOption;


//取得旅遊景點資料 支援CORS才可用（不可跨網域）
var viewData = '';
var xhr = new XMLHttpRequest();
xhr.open('get', 'https://github.com/guahsu/datas/blob/master/data.json', true);
xhr.send(null);
xhr.onload = function(){
    viewData = JSON.parse(xhr.responseText);
    console.log(viewData);
}

// 取得旅遊景點資料，透過JSONP（callback）
// var viewData = '';
// function getViewData(data) {
//     console.log(data);
// }


//顯示旅遊景點
function showViewList(e) {
    var infoBox = '';
    var selectEl = document.querySelector('#select-area');
    var selectZipCode = selectEl.value;
    var selectZipName = selectEl.selectedOptions[0].text;

    // 顯示行政區大標題
    document.querySelector('.area-title').textContent = selectZipName;

    for (var index = 0; index < viewData.length; index++) {
        
        var dataZip      = viewData[index].address.substr(5,3);
        var dataTitle    = viewData[index].stitle;
        var dataOpenTime = viewData[index].MEMO_TIME;
        var dataAddress  = viewData[index].address;
        var dataTel      = viewData[index].MEMO_TEL;
        var dataPic      = '';

        // 判斷如果圖片不是陣列就直接取，是陣列就取第一筆資料
        if (viewData[index].file.img.length === undefined) {
            dataPic      = viewData[index].file.img['#text'];
        } else {
            dataPic      = viewData[index].file.img[0]['#text'];
        }

        console.log(index + '---' + dataPic);
        // if (dataZip == selectZipCode) {
        if (dataZip == selectZipName) {
            infoBox += '<div class="info-box">' +
                            '<div class="info-top" style="background-image:url(\'' + dataPic + '\');">' +
                                '<span class="view-name">' + dataTitle + '</span>' +
                                '<span class="area-name">' + selectZipName + '</span>' +
                            '</div>' +
                            '<div class="info-bottom">' +
                                '<span class="time">' + dataOpenTime + '</span>' +
                                '<span class="add">' + dataAddress + '</span>' +
                                '<span class="tel">' + dataTel + '</span>' +
                            '</div>' +
                        '</div>';
        }
    }

    document.querySelector('.box-area').innerHTML = infoBox;
}

// 行政區選擇框
var selectEl = document.querySelector('#select-area');
// 讀取完成先顯示景點（使用預設區域）
window.addEventListener('load', showViewList, false);
// 每次變更都切換景點（使用選擇區域）
selectEl.addEventListener('change', showViewList, false);
