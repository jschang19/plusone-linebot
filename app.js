/*
* 作者 : Chang Chun Shawn ( jcshawn.com )
* 程式名稱 : 加一 LINE 紀錄機器人
* 簡述 : 這是一個可以紀錄聊天室或群組傳「+1」訊息使用者的 LINE 機器人，將資料存放在 Google Sheet 中，基於 App Script 語法
* 授權: Apache 2.0
* 聯絡方式: contact@jcshawn.com
* 最新更新 : 2022 / 3 / 30
*/

function doPost(e) {
    // LINE Messenging API Token
    var CHANNEL_ACCESS_TOKEN = ''; // LINE Bot API Token
    // 以 JSON 格式解析 User 端傳來的 e 資料
    var msg = JSON.parse(e.postData.contents);

    // for debugging
    Logger.log(msg);
    console.log(msg);

    /* 
    * LINE API JSON 解析資訊
    *
    * replyToken : 一次性回覆 token
    * user_id : 使用者 user id，查詢 username 用
    * userMessage : 使用者訊息，用於判斷是否為預約關鍵字
    * event_type : 訊息事件類型
    */
    const replyToken = msg.events[0].replyToken;
    const user_id = msg.events[0].source.userId;
    const userMessage = msg.events[0].message.text;
    const event_type = msg.events[0].source.type; 

    /*
    * Google Sheet 資料表資訊設定
    *
    * 將 sheet_url 改成你的 Google sheet 網址
    * 將 sheet_name 改成你的工作表名稱
    */
    const sheet_url = 'https://docs.google.com/spreadsheets/d/******';
    const sheet_name = 'reserve';
    const SpreadSheet = SpreadsheetApp.openByUrl(sheet_url);
    const reserve_list = SpreadSheet.getSheetByName(sheet_name);
    /*
     * 預約人數設定
     * 
     * maxium_member : 正式預約人數上限
     * waiting_start : 候補人數開始的欄位，無需修改
     * waiting_member : 開放候補人數
     */
    const maxium_member = 40;
    const waiting_start = maxium_member+1;
    const waiting_member = 3;

    // 必要參數宣告
    var current_hour = Utilities.formatDate(new Date(), "Asia/Taipei", "HH"); // 取得執行時的當下時間
    var current_list_row = reserve_list.getLastRow(); // 取得工作表最後一欄（ 直欄數 ）
    var reply_message = []; // 空白回覆訊息陣列，後期會加入 JSON

    // 查詢傳訊者的 LINE 帳號名稱
    function get_user_name() {
        // 判斷為群組成員還是單一使用者
        switch (event_type) {
            case "user":
                var nameurl = "https://api.line.me/v2/bot/profile/" + user_id;
                break;
            case "group":
                var groupid = msg.events[0].source.groupId;
                var nameurl = "https://api.line.me/v2/bot/group/" + groupid + "/member/" + user_id;
                break;
        }

        try {
            //  呼叫 LINE User Info API，以 user ID 取得該帳號的使用者名稱
            var response = UrlFetchApp.fetch(nameurl, {
                "method": "GET",
                "headers": {
                    "Authorization": "Bearer " + CHANNEL_ACCESS_TOKEN,
                    "Content-Type": "application/json"
                },
            });
            var namedata = JSON.parse(response);
            var reserve_name = namedata.displayName;
        }
        catch {
            reserve_name = "not avaliable";
        }
        return String(reserve_name)
    }

    // 回傳訊息給line 並傳送給使用者
    function send_to_line() {
        var url = 'https://api.line.me/v2/bot/message/reply';
        UrlFetchApp.fetch(url, {
            'headers': {
                'Content-Type': 'application/json; charset=UTF-8',
                'Authorization': 'Bearer ' + CHANNEL_ACCESS_TOKEN,
            },
            'method': 'post',
            'payload': JSON.stringify({
                'replyToken': replyToken,
                'messages': reply_message,
            }),
        });
    }

    // 將輸入值 word 轉為 LINE 文字訊息格式之 JSON
    function format_text_message(word) {
        let text_json = [{
            "type": "text",
            "text": word
        }]

        return text_json;
    }

    
    var reserve_name = get_user_name();

    if (typeof replyToken === 'undefined') {
        return;
    };

    if (userMessage == "+1" | userMessage == "加一" | userMessage == "＋1" | userMessage == "十1") {
        // 檢查是否在晚上七點之前傳送
        if (current_hour >= 0 & current_hour <= 19 | current_hour >= 21) {
            if (current_list_row < maxium_member) {
                reserve_list.getRange(current_list_row + 1, 1).setValue(reserve_name);
                current_list_row = reserve_list.getLastRow();

                reply_message = format_text_message(reserve_name + "成功預約 🙆，是第 " + current_list_row + " 位。" + "還有 " + (maxium_member - current_list_row) + " 位名額")

            }
            // 人數超過最大正式名額時，進入候補
            else if (current_list_row >= maxium_member & current_list_row < (waiting_member + maxium_member)) {
                reserve_name = "候補：" + reserve_name;
                reserve_list.getRange(current_list_row + 1, 1).setValue(reserve_name);
                reply_message = format_text_message("超過 40 人。" + reserve_name + " 為候補預約");

            }
            else {
                reply_message = format_text_message("⚠️ 報名額滿！已達 " + maxium_member + "人");
            }
        }
        else {
            reply_message = format_text_message("現在不是報名時間喔 ～ ，請在 00:00 - 19:00 預約");
        }

        send_to_line()
    }

    else if (userMessage == "+2" | userMessage == "加二" | userMessage == "十2") {
        if (current_hour >= 0 & current_hour <= 19) {
            if (current_list_row < maxium_member) {
                let name_array = [[reserve_name], [reserve_name]];
                reserve_list.getRange(current_list_row + 1, 1, 2, 1).setValues(name_array);
                current_list_row = current_list_row + 2;

                reply_message = format_text_message(reserve_name + "成功預約兩位 🙆" + "還有" + (maxium_member - current_list_row) + "位名額");

            }

            else if (current_list_row >= maxium_member & current_list_row < maxium_member + 2) { // +2 時不給候補
                let waiting_list_name = "候補：" + reserve_name;
                let waiting_names_array = [[waiting_list_name], [waiting_list_name]];
                reserve_list.getRange(current_list_row + 1, 1, 2, 1).setValues(waiting_names_array);

                reply_message = format_text_message(reserve_name + "預約兩位候補");

            }
            // 名單超過 40 人時不新增，回傳通知訊息
            else {
                reply_message = format_text_message("⚠️ 報名額滿！已達 40 人");
            }
        }
        // 非報名時間的訊息通知
        else {
            reply_message = format_text_message("現在不是報名時間喔 ～ ，請在 00:00 - 19:00 預約");
        }


        send_to_line();
    }

    else if (userMessage == "-1" | userMessage == "減一") {

        let all_members = reserve_list.getRange(1, 1, current_list_row, 1).getValues().flat();
        let leaving_member_index = all_members.indexOf(reserve_name);

        if (leaving_member_index != -1) {
            let checking_range = leaving_member_index + 1;
            var waiting_add = reserve_list.getRange(waiting_start, 1).getValue();

            reserve_list.getRange(checking_range, 1).clearContent();
            current_list_row = reserve_list.getLastRow();
            move_all_data();

            var state = reserve_name + "已退出預約";
        }
        else {
            var state = "您尚未報名，不用減一"
        }

        if (waiting_add != "") {
            reply_message = [{
                "type": "text",
                "text": state
            }, {
                "type": "text",
                "text": waiting_add + "候補進入上課名單"
            }]
        }
        else {
            reply_message = format_text_message(state);
        }

        // 將取消報名者下方所有資料向上移動
        function move_all_data() {
            let all_members = reserve_list.getRange(1, 1, current_list_row, 1).getValues().flat();
            let spaced_cell_index = all_members.indexOf("");
            let modify_range = current_list_row - spaced_cell_index - 1;
            let tmp_data = reserve_list.getRange(spaced_cell_index + 2, 1, modify_range, 1).getValues();

            reserve_list.getRange(spaced_cell_index + 1, 1, modify_range, 1).setValues(tmp_data);
            reserve_list.getRange(current_list_row, 1).clearContent();
        }

        send_to_line();
    }

    else if (userMessage == "test") {
        if (current_hour >= 0 & current_hour <= 19) {
            reply_message = [{
                "type": "text",
                "text": "Test"
            }]
        }

        send_to_line();
    }


    else if (userMessage == "報名人數" | userMessage == "名單") {
        var ready_namelist = "【 報名名單 】\n";
        var all_members = reserve_list.getRange(1, 1, current_list_row, 1).getValues().flat();

        for (var x = 0; x <= all_members.length-1; x++) {
            ready_namelist = ready_namelist + "\n" + all_members[x];
        }
        reply_message = [
            {
                "type": "text",
                "text": "共有 " + current_list_row + " 位同學報名 ✋"
            },
            {
                "type": "text",
                "text": ready_namelist
            }]

        send_to_line();
    }

    else if (userMessage == "貼圖") {
        reply_message = [{
            "type": "sticker",
            "packageId": "6136",
            "stickerId": "10551378"
        }]

        send_to_line();
    }

    // 其他非關鍵字的訊息則不回應（ 避免干擾群組聊天室 ）
    else {
        console.log("else here,nothing will happen.")
    }
}
