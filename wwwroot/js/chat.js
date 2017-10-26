(function () {
    console.log("______________privateChat.js______________")

    const OWNER = _RAZOR_PRIVATE_CHAT_VIEW_MODEL.owner
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
        MessagesListManager.AddItem(msg, GetSender(msg))
    }

    function SendMessage() {
        let msg = $.trim($(INPUT_ID).val())
        connection.invoke('SendTo', FRIEND.id, msg, Date.now().toString())
    }
    
    function ClearInput() {
        $(INPUT_ID).val("")
    }

    let MessagesListManager = (() => {
        const MESSAGES_LIST_ID = "#_messages_list_id"
        const UNREAD_MESSAGE_STYLE = "unread-message"

        function AddBase64Prefix(byteArray, contentType) {
            return "data:" + contentType + ";base64," + byteArray
        }

        //seconds are written as double, so we delete all after '.' symbol
        //also there is a redundunt symbol 'T' that also should be edited
        function ParseDate(date) {
            return date.substring(0, date.indexOf('.')).replace('T', ' ')
        }
        
        return {
            AddItem: (msg, sender) => {
                let mes_style = msg.isUnread ? UNREAD_MESSAGE_STYLE : ""
                let element = `
                    <li class="right clearfix ` + mes_style + `">
                        <span class="chat-img pull-right">
                            <img src="` + AddBase64Prefix(sender.avatar, sender.avatarContentType) + 
                            `" alt="User Avatar" class="img-responsive img-circle" width="70" height="70"/>
                        </span>
                        <div class="chat-body clearfix">
                            <div class="header">
                                <small class=" text-muted"><span class="glyphicon glyphicon-time"></span>` +
                                    ParseDate(msg.userDateLocal.toString()) + `</small>
                                <strong class="pull-right primary-font">` + msg.senderEmail + `</strong>
                            </div>
                            <p>` + msg.content +
                                `</p>
                        </div>
                    </li>`
                $(MESSAGES_LIST_ID).append(element)
            },

            MarkAllMessagesAsRead: () => {
                $(MESSAGES_LIST_ID).each(function () {
                    $(this).find('li').each(function () {
                        if ($(this).hasClass(UNREAD_MESSAGE_STYLE)) {
                            $(this).removeClass(UNREAD_MESSAGE_STYLE)
                        }
                    })
                })
            },

            ScrollToBottom: () => {
                let element = document.getElementById(CHAT_PANEL_ID.substr(1))
                element.scrollTop = element.scrollHeight
            }
        }
    })()

    function GetSender(msg) {
        return msg.senderId == FRIEND.id ? FRIEND : OWNER 
    }
    
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
        msgArr.forEach(m => MessagesListManager.AddItem(m, GetSender(m)))
        MessagesListManager.ScrollToBottom()
    }
    
    connection.start().then(() =>
        $(document).ready(() => {
            
            $(INPUT_ID).keyup(event => {
                if (event.keyCode === ENTER_BUTTON_KEY) {
                    $(SEND_BUTTON_ID).click()
                }
            })

            $(INPUT_ID).focus()

            GetHistory(FRIEND.id)

            $(SEND_BUTTON_ID).click(() => {
                MessagesListManager.ScrollToBottom()
                SendMessage()
                ClearInput()
            })
        })
    ).catch(err => console.log(err))
})()