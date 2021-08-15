/*
* Author : Chang Chun Shawn ( jcshawn.com )
* File Name : plusone-linebot.gs
* Description : This is a program based on Google App Script, assisting you by recording the users who send "+1" in a group chat ( or a room ).
*               The code is aimed to be a LINE Bot ( LINE Messaging API ),and the data will be stored in Google Sheet.
* License: Apache 2.0
* Contact: contact@jcshawn.com
*/ 


function doPost(e) {
  // LINE Messenging API Token
  var CHANNEL_ACCESS_TOKEN = ''; // LINE Bot API Token
  // 以 JSON 格式解析 User 端傳來的 e 資料
  var msg = JSON.parse(e.postData.contents);

  // for debugging
  Logger.log(msg);
  console.log(msg);

  // 從接收到的訊息中取出 replyToken 和發送的訊息文字
  var replyToken = msg.events[0].replyToken;
  var userMessage = msg.events[0].message.text;
  const user_id = msg.events[0].source.userId;
  var event_type = msg.events[0].source.type;


  var sheet_url = 'https://docs.google.com/spreadsheets/d/******';
  // 工作表名稱
  var sheet_name = 'reserve';
  var SpreadSheet = SpreadsheetApp.openByUrl(sheet_url);
  var reserve_list = SpreadSheet.getSheetByName(sheet_name);
  var current_list_row = reserve_list.getLastRow();
  var current_hour = Utilities.formatDate(new Date(), "Asia/Taipei", "HH");
  var maxium_member = 40;
  var waiting_start = 41;
  var waiting_member = 3;
  var reply_message = [];
  // Get 某格資料語法：
  // var data = SheetName.getRange(欄,行).getValue();

  try {
    var groupid = msg.events[0].source.groupId;
  }
  catch{
    console.log("wrong");

  }

  switch (event_type) {
    case "user":
      var nameurl = "https://api.line.me/v2/bot/profile/" + user_id;
      break;
    case "group":
      var nameurl = "https://api.line.me/v2/bot/group/" + groupid + "/member/" + user_id;
      break;

  }

  try {
    //  呼叫 LINE User Info API，以 user ID 取得該帳號的使用者名稱
    var response = UrlFetchApp.fetch(nameurl, {
      "method": "GET",
      "headers": {
        "Authorization": "Bearer Tk3ybTISjPpsOVGlAZn44pxdgJrMj78n36zdcgTRAOBD+ej+xLpWbsVgVG0YQBkmlGc7rx6WgAK9+vUvYIXeL6qlXbudh3bp3QMqJox8Ui1y9OULSTKo4ny+mXyz2oraMuYO7uvfkWAoK+1h8czH+QdB04t89/1O/w1cDnyilFU=",
        "Content-Type": "application/json"
      },
    });

    var namedata = JSON.parse(response);
    var reserve_name = namedata.displayName;
  }

  catch{
    reserve_name = "not avaliable";
  }



  // end of the userName function

  if (typeof replyToken === 'undefined') {
    return;
  };


  if (userMessage == "+1" | userMessage == "加一" | userMessage == "＋1") {
    if (current_hour >= 0 & current_hour <= 19 | current_hour >= 21) {
      if (current_list_row < maxium_member) {
        reserve_list.getRange(current_list_row + 1, 1).setValue(reserve_name);
        current_list_row = reserve_list.getLastRow();

        reply_message = [{
          "type": "text",
          "text": reserve_name + "成功預約 🙆，是第 " + current_list_row + " 位。" + "還有 " + (maxium_member - current_list_row) + " 位名額"
        }]

      }

      else if (current_list_row >= maxium_member & current_list_row < (waiting_member + maxium_member)) {
        reserve_name = "候補：" + reserve_name;
        reserve_list.getRange(current_list_row + 1, 1).setValue(reserve_name);

        reply_message = [{
          "type": "text",
          "text": "超過 40 人。" + reserve_name + " 為候補預約"
        }]

      }

      else {
        reply_message = [{
          "type": "text",
          "text": "⚠️ 報名額滿！已達 " + maxium_member + "人"
        }]
      }
    }
    else {
      reply_message = [{
        "type": "text",
        "text": "現在不是報名時間喔 ～ ，請在 00:00 - 19:00 預約"
      }]
    }

  }

  else if (userMessage == "+2" | userMessage == "加二") {

    if (current_hour >= 0 & current_hour <= 19) {
      if (current_list_row < maxium_member) {
        reserve_list.getRange(current_list_row + 1, 1).setValue(reserve_name);
        reserve_list.getRange(current_list_row + 2, 1).setValue(reserve_name);
        current_list_row = reserve_list.getLastRow();
        console.log(reserve_name + "成功預約兩位 🙆。" + "還有" + (maxium_member - current_list_row) + "位名額");

        reply_message = [{
          "type": "text",
          "text": reserve_name + "成功預約兩位 🙆" + "還有" + (maxium_member - current_list_row) + "位名額"
        }]

      }

      else if (current_list_row >= maxium_member & current_list_row < maxium_member+2) { // +2 時不給候補
        reserve_name = "候補：" + reserve_name;
        reserve_list.getRange(current_list_row + 1, 1).setValue(reserve_name);
        reserve_list.getRange(current_list_row + 2, 1).setValue(reserve_name);

        reply_message = [{
          "type": "text",
          "text": reserve_name + "預約兩位候補"
        }]

      }

      else {
        reply_message = [{
          "type": "text",
          "text": "⚠️ 報名額滿！已達 40 人"
        }]
      }
    }
    else {
      reply_message = [{
        "type": "text",
        "text": "現在不是報名時間喔 ～ ，請在 00:00 - 19:00 預約"
      }]
    }

  }

  else if (userMessage == "-1" | userMessage == "減一") {

    for (var checking_range = 1; checking_range <= current_list_row; checking_range++) {
      if (reserve_name == reserve_list.getRange(checking_range, 1).getValue()) {
        reserve_list.getRange(checking_range, 1).clearContent();
        var state = reserve_name + "已退出預約";
        current_list_row = reserve_list.getLastRow();
        break;
      }
      else {
        var state = "您尚未報名，不用減一"
      }
    }

    for (spaced_range = 1; spaced_range <= current_list_row; spaced_range++) {
      if (reserve_list.getRange(spaced_range, 1).getValue() == "") {
        for (var waiting_range = waiting_start; waiting_range <= (maxium_member + waiting_member); waiting_range++) {
          if (reserve_list.getRange(waiting_range, 1).getValue() != "") {
            var waiting_add = reserve_list.getRange(waiting_range, 1).getValue();
            reserve_list.getRange(spaced_range, 1).setValue(waiting_add);
            reserve_list.getRange(waiting_range, 1).clearContent();
            break;
          }
        }
        break;
      }
    }


    reply_message = [{
      "type": "text",
      "text": state
    },{
      "type": "text",
      "text": waiting_add+"候補進入上課名單"
    }]
  }

  else if (userMessage == "test") {
    if (current_hour >= 0 & current_hour <= 19) {
      reply_message = [{
        "type": "text",
        "text": "Test"
      }]
    }
  }


  else if (userMessage == "報名人數" | userMessage == "名單") {
    var ready_namelist = "【 報名名單 】\n";
    for (var x = 1; x <= current_list_row; x++) {
      ready_namelist = ready_namelist + "\n" + reserve_list.getRange(x, 1).getValue();
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
  }

  else if (userMessage == "貼圖") {
    reply_message = [{
      "type": "sticker",
      "packageId": "6136",
      "stickerId": "10551378"
    }]
  }

  // 其他非關鍵字的訊息則不回應（ 避免干擾群組聊天室 ）
  else {
    reply_message = [];
  }


  //回傳訊息給line 並傳送給使用者
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
