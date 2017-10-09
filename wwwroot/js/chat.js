﻿console.log("______________Chat.js______________")

let chat_connection = $.hubConnection()
let chat_hub = connection.createHubProxy('chat')
let chat_id = "#_chat_id"
let send_message_btn_id = '#_send_message_btn'

function SendMessage() {
    
}

function AddMessage() {
    console.log("Adding message")
    $(chat_id).append(`
        <li class="right clearfix">
            <span class="chat-img pull-right">
                <img src="http://placehold.it/50/FA6F57/fff&text=ME" alt="User Avatar" class="img-circle" />
            </span>
            <div class="chat-body clearfix">
                <div class="header">
                    <small class=" text-muted"><span class="glyphicon glyphicon-time"></span>13 mins ago</small>
                    <strong class="pull-right primary-font">Bhaumik Patel</strong>
                </div>
                <p>
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit. Curabitur bibendum ornare
                    dolor, quis ullamcorper ligula sodales.
                </p>
            </div>
        </li>`)
}

function OnConnected(msg) {
    console.log(msg)
}

function OnDisconnected(msg) {
    console.log(msg)
}

chat_hub.on('OnConnected', msg => OnConnected())
chat_hub.on('OnDisconnected', msg => OnDisconnected())
//chat_hub.on('Notify', msg => { })

connection.start().done(function () {
    $(document).ready(function () {
        $(send_message_btn_id).click(AddMessage)
    })
})