﻿(function () {
    console.log("______________privateChat.js______________")

    //model passed by server using razor
    if (model !== undefined) {
        console.log(model)
    }

    let recieverId = model.userId.id

    let connection = new signalR.HubConnection('/chat');

    let chat_id = "#_chat_id"
    let send_message_btn_id = '#_send_message_btn'
    let message_input_id = '#_message_input'


    function SendMessage() {
        let msg = $.trim($(message_input_id).val())
        console.log(msg)
        connection.invoke('SendTo', recieverId, msg, Date.now().toString())
    }

    function ClearInput() {
        $(message_input_id).val("")
    }

    function AddMessage(msg, author, time, isUnread) {
        console.log(isUnread)
        console.log("Adding message")
        $(chat_id).append(`
        <li class="right clearfix ` + (isUnread? "unread-message" : "") +`">
            <span class="chat-img pull-right">
                <img src="http://placehold.it/50/FA6F57/fff&text=ME" alt="User Avatar" class="img-circle" />
            </span>
            <div class="chat-body clearfix">
                <div class="header">
                    <small class=" text-muted"><span class="glyphicon glyphicon-time"></span>` + time + `</small>
                    <strong class="pull-right primary-font">` + author + `</strong>
                </div>
                <p>` + msg +
            `</p>
            </div>
        </li>`)
    }

    function OnConnected(msg) {
        console.log(msg)
    }

    function OnDisconnected(msg) {
        console.log(msg)
    }

    function GetHistory(personId) {
        connection.invoke('OnGetHistory', personId)
    }


    //seconds are written as double, so we delete all after '.' symbol
    //also there is a redundunt symbol 'T' that also should be edited
    function ParseDate(date) {
        return date.substring(0, date.indexOf('.')).replace('T', ' ')
    }

    function MarkAllMessagesAsRead() {
        $(chat_id).each(function () {
            $(this).find('li').each(function () {
                if ($(this).hasClass("unread-message")) {
                    console.log("removing")
                    $(this).removeClass("unread-message")
                }
            })
        })
    }

    function OnGetHistory(history) {
        let historyArr = JSON.parse(history)
        console.log(history)

        historyArr.forEach(v => AddMessage(v.Content, v.SenderEmail, ParseDate(v.UserDateLocal), v.IsUnread))
    }

    connection.on(`OnGetHistory`, history => OnGetHistory(history))
    connection.on('OnConnected', msg => OnConnected(msg))
    connection.on('OnDisconnected', msg => OnDisconnected(msg))
    connection.on('Send', (mes) => {
        let mes_obj = JSON.parse(mes)
        AddMessage(mes_obj.Content, mes_obj.SenderEmail, ParseDate(mes_obj.UserDateLocal), mes_obj.IsUnread)
    })
    connection.on('OnMessageHistoryRead', () => MarkAllMessagesAsRead())
    
    connection.start().then(() =>
        $(document).ready(() => {
            GetHistory(recieverId)
            $(send_message_btn_id).click(() => {
                SendMessage()
                ClearInput()
            })
        })
    ).catch(err => console.log(err))
})()