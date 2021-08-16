# LINE 加一紀錄機器人 （ PlusOne Bot ）
> _幫你紀錄誰在 LINE 群組傳加一_

LINE 群組開團購、報名課程時，大家瘋傳加一，手動紀錄有夠累～用「LINE 加一紀錄機器人」自動紀錄傳「+1」的使用者到 Google 試算表，並回傳給你！
## 動機 Motivation

這是我為我媽的瑜珈老師設計的一支 LINE 機器人，那位老師以前都是手動紀錄群組喊「+1」預約上課的同學
因此這隻機器人是以「課程預約」為出發點設計的，你也可以修改成其他的功能。


## 功能 Features

- 自動識別傳「+1」的使用者，並將 LINE 名稱記錄到名單
- 搭配 Google 試算表做免費資料庫，快速好用
- 支援「+2」( 預約兩位 ) / 「-1」( 取消預約 ) 功能
- 支援候補名額與自動替補
- 使用 Google App Script 語法開發

## 實機測試 Demo
這是課程的群組截圖，群組只要有人傳 +1，機器人會自動記錄，並回傳告知報名成功與剩下多少名額：

<img src ="https://i2.wp.com/jcshawn.com/wp-content/uploads/2021/08/%E6%88%AA%E5%9C%96-2021-08-16-%E4%B8%8A%E5%8D%8811.51.02.png?w=375&ssl=1">

傳指定關鍵字「名單」就能讓機器人傳送完整的報名名單：

<img src="https://i0.wp.com/jcshawn.com/wp-content/uploads/2021/08/%E6%88%AA%E5%9C%96-2021-08-16-%E4%B8%8A%E5%8D%8811.50.51.png?w=374&ssl=1">

資料都是暫存在 Google 試算表裡，不用另建伺服器或資料庫：

<img src = "https://i2.wp.com/jcshawn.com/wp-content/uploads/2021/08/%E6%88%AA%E5%9C%96-2021-08-16-%E4%B8%8B%E5%8D%8812.04.04.png?w=900&ssl=1">

## 使用方法 How to Use

1. 將 app.js 的內容複製，貼到你的 Google App Script 專案上 


2. 在 CHANNEL_ACCESS_TOKEN 的引號裡填入你的 LINE API Token 權杖：
```sh
var CHANNEL_ACCESS_TOKEN = "***";
```

在第 18 行的 sheet_url 的引號裡填入你的 Google 試算表連結：

```sh
var sheet_url = 'https://docs.google.com/spreadsheets/...'
```

3. 點選 App Script 網頁的部署按鈕，選擇「新增」：
<img src="https://i.imgur.com/5EZeHkr.png">

4. 種類設定為「網路應用程式」：
<img src = "https://i.imgur.com/l6cnTHk.png">

5. 將存取權限改為「所有人」，再按部署：
<img src="https://i.imgur.com/pG5UFnx.png">

6. 接著瀏覽器會出現小視窗，點按「授與存取權」：
<img src="https://i.imgur.com/vIL8K7d.png">

7. 選取 Google 帳號後，點選左下小灰字「顯示進階設定」，並點選做下方的「前往 ***」（ 此為正常流程 ）：

<img src="https://i.imgur.com/Ocn2xNn.png">

8. 點選允許：

<img src="https://i.imgur.com/1Fbfdrp.png">

9. 將下面的網址複製起來，貼到你的 LINE Bot Console 的 Webhook：
<img src="https://i.imgur.com/PosUv29.png">


## 客製化 Customization 


除了 LINE Token 跟 Google Sheet 連結之外，你也可以自訂程式的一些細項或變數名稱，我將一些重要的變數列在下面表格：

變數名稱      | 用途 | 備註
--------------|---------|------------------------
userMessage    | 使用者傳送的文字訊息內容 | string format
user_id    | 使用者的 ID 字串 | 搭配第五十行的 User Info API，查詢使用者名稱 
sheet_name  | Google Sheet 的工作表名稱 | 請填入正確名稱。否則會抓不到
reserve_list | 工作表的全部資料 | 可以自訂修改，但要用 ctrl + F 全部修改
current_list_row | 資料表的最大行數（ 最後一筆資料的行數 ） | .getLastRow() 語法
reply_message | 要回傳給使用者的訊息內容 | JSON Format，**請勿直接填入訊息文字**，請參考 LINE 官方的 API 文件
current_hour | 判斷使用者呼叫機器人的時間（ 取小時 ）| "HH" 是小時格式，請爬文「App Script get current time 」

### reply_message 回覆訊息自訂
reply_message 必須是一個 JSON 格式的內容，以文字訊息為例，格式如下：

```sh
reply_message = [
    "type":"text", // 除非是最後一句，每一句後面要加逗號
    "text":"引號內打要回傳的文字"
]
```

圖片、貼圖、選單、和 Flex Message 圖文格式也是可以用的，詳情請到 LINE 官方 API 文件查看。

## 參考資料
- [用 Line Bot 來搜尋 Google 試算表的資料 - (02)Line Bot 設定 | Boris 的分享小站](https://www.youtube.com/watch?v=Bjg_vZnDHbc)
- [LINE 官方 Messaging API 開發文件](https://developers.line.biz/zh-hant/docs/messaging-api/)
- [Google App Script 開發文件](https://developers.google.com/apps-script/reference/document)
- [How to get the current time in Google spreadsheet using script editor?](https://stackoverflow.com/questions/10182020/how-to-get-the-current-time-in-google-spreadsheet-using-script-editor)
## License

Apache 2.0
**Please credit me ( Chun Shawn jcshawn.com ) if using the code to your own project.**

> Be the pebble that creates ripple of the change. -Tim Cook

