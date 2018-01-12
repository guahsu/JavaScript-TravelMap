# JavaScript-TravelMap

![](http://www.guastudio.com//uploads/content/20170507/travelMap.png) 


### [[連結]](https://guahsu.io/JavaScript-TravelMap/index.html)

台北市的旅遊景點資料站，資料來源是政府資料開放平臺，  
樣式的部分還是簡單的HTML跟CSS刻，主軸放在Javascript上，  
紀錄這次在JavaScript上遇到跟重新學習理解到的東西。

---
## querySelector & querySelectorAll
元素選擇器！  
還記得以前最常使用的就是要找ID時用document.getElementById()，  
當要找Class的時候要用getElementsByClassName()。  

而這次學習了使用`querySelector()`以及`querySelectorAll()`這兩個函式：  
共通點是都可以用css的規則來作為選擇，例如ID用`#`，ClassName用`.`來操作，  
例如：
```html
<div id="divID">AAA</div>
<div class="divClass">BBB</div>
<div class="divClass">CCC</div>
<div data-no="1">DDD</div>
```
要取得AAA的資料可以透過`querySelector('#divID')`  
要取得BBB的資料可以透過`querySelector('.divClass')`  
要取得DDD的資料可以透過`querySelector('div[data-no="1"]')`  

但是若有重複的className透過`querySelector('.divClass')`只會取到第一筆`BBB`的值，  
所以就要用`querySelectorAll('.divClass')`來取得所有className是`.divClass`元素，  
但特別要注意的的是，透過`querySelectorAll()`取得的值會被放入陣列中，  
所以例如寫了：
````javascript
var data = document.querySelectorAll('.divClass').textContent;
````
會得到`['BBB','CCC']`這樣的內容，要取出`BBB`就是`data[0]`！  

學到這裡時，真心覺得jQuery的`$('')`真的很方便啊XD！

---
## addEventListener
綁定事件，使用方法是`element.addEventListner(事件, 執行內容, useCapture)`  

**事件**  
指的是要偵測的事件，例如點擊`click`，內容變換`change`、鍵盤動作`keyCode`

**執行內容**  
指的是要執行的項目，可以直接指定function或直接寫在裡面  
例如：
````javascript
document.body.addEventListner('click', SomeFunction, true);
document.body.addEventListner('click', function(e) { console.log(e) }, false);
````
要注意的是當使用第一種方法直接呼叫別的function時，不能傳參數，  
若要傳參數只能在包一層function，例如：
````javascript
document.body.addEventListner('click', function(e) { SomeFunction(param) }, false);
````

**useCapture**  
目前沒有使用情境，老實說並不是很了解的參數，  
但他是一個`true/false`的設定值，預設是`false`。  
當設定為`true`時，會從指定元素的最外層元素開始往內層執行，  
反之設定為`false`則從指定元素開始往外層執行，舉例：  
```html
<div class="father">
		<div class="child">
		</div>
</div>
```
當設定
````javascript
document.querySelector('.child').addEventListener('click',function() { console.log('C') }), ture)
document.querySelector('.father').addEventListener('click',function() { console.log('F') }), ture)
````
會先印出F（外層），若設定為false時會先印出C（內層）  
若father設定`false`，child設定成`ture`，則會先印`C`，反之則先印`F`  

---
## function(e){}
這次使用了很多fuction的狀態偵測，  
例如前兩個`querySelectorAll`跟`addEventListner`組合時就會用到：  
```javascript
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
```
透過`e.srcElement`來取得觸發事件的元素，進一步取得要操作的值。  

---
## XMLHttpRequest
為了要獲取JSON內容來使前端動態組成景點內容，  
使用XHR(XMLHttpRequest)來做：  
```javascript
/**
 * 取得台北市行政區資料
 * 透過AJAX取得JSON資料
 */
var areaData = ''; //全部的行政區資料(全域變數)
function getAreaData() {
    //建立一個新的XMLHttpRequest
    var xhr = new XMLHttpRequest();
    //設定這個xhr來get放在data資料夾底下的json檔案
    xhr.open('get', 'data/viewZip.json', true);
    //傳送這個xhr的請求
    xhr.send(null);
    //當取得xhr回應後,執行這個function
    xhr.onload = function() {
        //檢查狀態碼，若非200連線OK則顯示錯誤訊息
        if (xhr.status == 200) {
            areaData = JSON.parse(xhr.responseText);
            createAreaSelect(); //建立行政區下拉選單
            getViewData(); //取得景點資料
        }else {
            document.querySelector('.box-area').innerHTML = '<h2>取得資料時發生錯誤，請檢查網路狀態並重新整理：）</h2>';
        }
    }
}
```

---
## window.history
AJAX動態組成的資料在使用者眼裡看起來像是換了一頁，  
但實際上網頁本身並沒有切換頁面，只是”替換“了內容，  
所以自然瀏覽器也不會去紀錄上一頁、下一頁的資料，  
導致切了很多內容後，想回到上一頁卻離開了這個網站。  
  
為了解決這個問題，就要自己產生紀錄！  
從`window.history`中可以得知每次對頁面的切換都會有紀錄，  
可以透過`history.pushState(object, title, url)`來增加紀錄。  
參數分別是（要寫進紀錄的值、標題、網址），其中第二個參數目前是沒作用的。  

並可用`window.onpopstate`來偵測瀏覽器的上、下頁行為  
以這個實作的範例來說，我的想法跟流程是這樣：  

進入網頁時，先寫入當時的行政區與頁碼到history.state中，  
並同時在localStorage寫入相同值，當使用者點擊上、下頁時，  
將寫入的值取出並透過這組值來重組頁面資料，達到切頁的效果。  
  
localStorage寫入值的用途為當重新整理時，要撈到重整前的值來重組畫面，  
故當程式呼叫到寫入瀏覽紀錄時也要寫、動作切上下頁時也要寫入。  

```javascript
/**
 * 寫入瀏覽紀錄
 * @param {*} areaName 行政區
 * @param {*} pageNo 頁碼
 */
function setHistory(areaName, pageNo) {
    //紀錄當前行政區及頁數,並儲存在localstorage中
    //建立紀錄資料變數historyData，並將行政區與頁碼用字串方式存入變數中
    var historyData = '{"areaName":"' + areaName + '","pageNo":' + pageNo + '}';
    //將當前紀錄資料存入瀏覽歷史中
    history.pushState(historyData, '', '');
    //將當前紀錄資料存入localStorage中，儲存最後一次瀏覽的頁面資訊
    localStorage.setItem('lastPage', historyData);
}
```
```javascript
/**
 * 處理瀏覽器上下頁行為
 */
window.onpopstate = function(e) {
    if (e.state) {
        //將當前的頁面存入localStorage中，儲存最後一次瀏覽的頁面資訊
        localStorage.setItem('lastPage', e.state);
        //解析動作取得的瀏覽紀錄
        var historyData = JSON.parse(e.state);
        //組出對應的景點資料
        setViewData(historyData.areaName, historyData.pageNo);
    } else {
        //若已經沒有自己寫入的值，就直接進行預設的上一頁動作
        history.back();
    }
}
```

---
## CSS
小小紀錄一下這次CSS遇到的狀況：  

**使用BEM命名規則**  

各種變數跟樣式命名真的是我很弱的一部份，  
除了英文很破沒幾個單字可以拿來命名之外，  
就是沒有一個規範可以去遵循，後來從前端電子報中看到這個BEM這個關鍵字，  
這種命名方式是遵循Black__Element--Modifier這樣的方式去命名的，  
雖然看起來很長很亂，但其實對健忘的我來說很好找到對應元素，  
不過block in block的處理及modifier的定義我沒有很充分理解，  
第一次使用，會再找機會參考別人的做法。

**select變更樣式**

HTML的原生select修改樣式成背景透明後，在手機上的小箭頭居然會不見!  
`background-color: rgba(255, 255, 255, 0)`

原本想說使用圖片來替代，後來因為解析度的關係(箭頭會看起來糊糊的)，  
在select旁邊寫了一個svg的小箭頭來換頂替。  
```html
<svg class="content__select--arrow">
    <polygon fill="#42ab9e" points="5,10 0,0 10,0"></polygon>
</svg>
```
且為了安全起見，也還是把select的圖標隱藏了  
` -webkit-appearance: none;`  
然後這個我根本沒有在管瀏覽器兼容性啦XD!

