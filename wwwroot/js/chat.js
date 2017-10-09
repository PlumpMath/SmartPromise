console.log("______________Chat.js______________")

let chat_connection = $.hubConnection()
let chat_hub = connection.createHubProxy('chat')
let chat_id = "#_chat_id"
let send_message_btn_id = '#_send_message_btn'
let message_input_id = '#_message_input'


function SendMessage() {
    let msg = $.trim($(message_input_id).val())
    console.log(msg)
    chat_hub.invoke('Send', msg)
}

function ClearInput() {
    $(message_input_id).val("")
}

function AddMessage(msg, author, time) {
    console.log("Adding message")
    $(chat_id).append(`
        <li class="right clearfix">
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

chat_hub.on('OnConnected', msg => OnConnected(msg))
chat_hub.on('OnDisconnected', msg => OnDisconnected(msg))
chat_hub.on('Send', (msg, author, time) => { AddMessage(msg, author, time) })

connection.start().done(function () {
    $(document).ready(function () {
        $(send_message_btn_id).click(() => { SendMessage(); ClearInput() })
    })
})
