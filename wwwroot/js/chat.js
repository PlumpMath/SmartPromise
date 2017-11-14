var Chat = function () {
    console.log("______________privateChat.js______________")

    const FRIEND = _RAZOR_PRIVATE_CHAT_VIEW_MODEL.friend

    const CHAT_PANEL_ID = '#_chat_panel_id'
    const SEND_BUTTON_ID = '#_send_message_btn'
    const INPUT_ID = '#_message_input'
    const ENTER_BUTTON_KEY = 13

    let connection = new signalR.HubConnection('/chat');
    connection.on(`OnGetHistory`, history => OnGetHistory(history))
    connection.on('OnConnected', msg => OnConnected(msg))
    connection.on('OnDisconnected', msg => OnDisconnected(msg))
    connection.on('Send', res => OnMessage(JSON.parse(res)))
    connection.on('OnMessageHistoryRead', () => MessagesListManager.MarkAllMessagesAsRead())

    function OnMessage(msg) {
        MessagesListManager.AddItem(msg)
        MessagesListManager.ScrollToBottom()
    }

    function SendMessage() {
        let msg = $.trim($(INPUT_ID).val())
        if (msg.length === 0)
            return 
        connection.invoke('SendTo', FRIEND.id, msg, Date.now().toString())
    }
    
    function ClearInput() {
        $(INPUT_ID).val("")
    }

    let MessagesListManager = (() => {
        const MESSAGES_LIST_ID = "#_messages_list_id"
        const UNREAD_MESSAGE_STYLE = "unread"
        const INPUT_MESSAGE_STYLE = "message-in pull-left"
        const OUTPUT_MESSAGE_STYLE = "message-out pull-right"

        function AddBase64Prefix(byteArray, contentType) {
            return "data:" + contentType + ";base64," + byteArray
        }

        //seconds are written as double, so we delete all after '.' symbol
        //also there is a redundunt symbol 'T' that also should be edited
        function ParseDate(date) {
            return date.substring(0, date.indexOf('.')).replace('T', ' ')
        }

        function IsInput(msg) {
            return msg.senderId != FRIEND.id
        }
        
        return {
            AddItem: (msg, sender) => {
                let mes_style = msg.isUnread ? UNREAD_MESSAGE_STYLE : ""
                let sender_style = IsInput(msg) ? INPUT_MESSAGE_STYLE : OUTPUT_MESSAGE_STYLE
                let element = `
                    <div class="row ` + mes_style +`">
                        <div class="message ` + sender_style + `">
                            ` + msg.content +`
                        </div>
                    </div>
                `
                $(MESSAGES_LIST_ID).append(element)
            },

            MarkAllMessagesAsRead: () => {
                $(CHAT_PANEL_ID).find('.' + UNREAD_MESSAGE_STYLE).removeClass(UNREAD_MESSAGE_STYLE)
            },

            ScrollToBottom: () => {
                let element = document.getElementById(CHAT_PANEL_ID.substr(1))
                element.scrollTop = element.scrollHeight
            }
        }
    })()

    function OnConnected(msg) {
        console.log(msg)
    }

    function OnDisconnected(msg) {
        console.log(msg)
    }

    function GetHistory() {
        connection.invoke('OnGetHistory', FRIEND.id)
    }
    
    function OnGetHistory(history) {
        let msgArr = JSON.parse(history)
        $(document).ready(() => {
            msgArr.forEach(m => MessagesListManager.AddItem(m))
            MessagesListManager.ScrollToBottom()
        })
    }

    function SetMessageNavBarActive() {
        $('#_cabinet_nav_messages').addClass("active")
    }

    SetMessageNavBarActive()

    connection.start().then(() => {
        GetHistory(FRIEND.id)
        $(document).ready(() => {
            $(INPUT_ID).keyup(event => {
                if (event.keyCode === ENTER_BUTTON_KEY) {
                    $(SEND_BUTTON_ID).click()
                }
            })

            $(INPUT_ID).focus()

            $(SEND_BUTTON_ID).click(() => {
                SendMessage()
                ClearInput()
            })
        })
    }).catch(err => {
        $(document).ready(() => SetMessageNavBarActive())
        console.log(err)
    })
}