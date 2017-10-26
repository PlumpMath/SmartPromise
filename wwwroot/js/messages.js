(function () {
    console.log("______________messages.js______________")

    //Should be passed by Razor page I think
    const CONTROLLER_NAME_CABINET = '/Cabinet'
    const METHOD_GET_LAST_MESSAGES = '/GetLastMessagesHistory/'
    const METHOD_GET_MY_USER_INFO = '/GetMyUserInfo/'
    const METHOD_GET_AVATAR = '/GetAvatar'

    let Loader = (function () {
        const LOADER_STYLE = "loader"
        const LOADER_ID = "#_messages_loader_id"

        return {
            Show: () => {
                if (!$(LOADER_ID).hasClass(LOADER_STYLE)) {
                    $(LOADER_ID).addClass(LOADER_STYLE)
                }
            },
            Hide: () => {
                if ($(LOADER_ID).hasClass(LOADER_STYLE)) {
                    $(LOADER_ID).removeClass(LOADER_STYLE)
                }        
            }
        }
    })()

    function AddIdPrefix(str) {
        return '#' + str
    }

    let MessagesListManager = (function () {
        const IMAGE_PREFIX_SENDER = 'S'
        const IMAGE_PREFIX_RECEIVER = 'R'
        const ITEM_PREFIX = 'M'
        const DEFAULT_IMAGE_SRC = ""
        const MESSAGES_LIST_ID = '#_messages_list'

        function GetOwner() {
            return new Promise((resolve, reject) => {
                $.get(CONTROLLER_NAME_CABINET + METHOD_GET_MY_USER_INFO, res => resolve(res))
                    .fail(err => reject(err))
            })
        }

        function GetFriendId(owner, mes) {
            return owner.id === mes.senderId ? mes.receiverId : mes.senderId
        }

        function GetFriendEmail(owner, mes) {
            return owner.id === mes.senderId ? mes.receiverEmail : mes.senderEmail
        }

        function HaveChatWithFriend(friendId, friendEmail) {
            console.log("move")
            window.location.href = _RAZOR_URL_CABINET_PRIVATE_CHAT
                .replace('__id__', friendId).replace('__email__', friendEmail);
        }

        function HaveChatOnClick(mes) {
            let itemId = MessagesListManager.GetItemId(mes)
            GetOwner().then(owner => {
                console.log(owner)
                let friendId = GetFriendId(owner, mes)
                let friendEmail = GetFriendEmail(owner, mes)
                console.log(mes.senderEmail + " " + itemId)
                $(itemId).click(() => HaveChatWithFriend(friendId, friendEmail))
            })
        }

        //it's unique
        function GetId(mes) {
            return mes.senderId.toString() + mes.receiverId.toString() /*mes.serverDateUtc.toString() */
        }

        return {
            GetItemId: mes => '#' + ITEM_PREFIX + GetId(mes)
            ,

            GetReceiverImageId: mes => '#' + IMAGE_PREFIX_RECEIVER + GetId(mes)
            ,

            GetSenderImageId: mes => '#' + IMAGE_PREFIX_SENDER + GetId(mes)
            ,

            AddItem: (mes, options = { append: true, haveChat: true }) => {
                let id = GetId(mes)
                let element = `
                   <a id="` + ITEM_PREFIX + id + `" class="list-group-item clearfix ` +
                    (mes.isUnread ? "unread-message" : "") + `">` + `
                        <div class="text-center">` + mes.content + `</div>` +
                    `   <span class="pull-left">
                            <p><img src="` + _RAZOR_URL_CABINET_GET_AVATAR.replace("__id__", mes.receiverId) +
                    `" id="` + IMAGE_PREFIX_RECEIVER + id + `" 
                                alt="User Avatar" class="img-responsive img-circle" width="70" height="70"/></p>
                            <span class="btn btn-xs btn-default">`
                    + " To : " + mes.receiverEmail + " " +
                    `</span>
                        </span>
                        <span class="pull-right">
                            <p><img src="` + _RAZOR_URL_CABINET_GET_AVATAR.replace("__id__", mes.senderId) +
                    `" id="` + IMAGE_PREFIX_SENDER + id + `" 
                                alt="User Avatar" class="img-responsive img-circle" width="70" height="70"/></p>
                            <span class="btn btn-xs btn-default">`
                    + " From : " + mes.senderEmail + " " +
                    `</span>
                        </span>
                    </a>
                `
                let list = $(MESSAGES_LIST_ID)
                options.append ? list.append(element) : list.prepend(element)
                if (options.haveChat) {
                    HaveChatOnClick(mes)
                }
            },

            RemoveItem: mes => $(MessagesListManager.GetItemId(mes)).remove()
            ,
            
            UpdateItem: mes => {
                MessagesListManager.RemoveItem(mes)
                let options = {
                    append: false,
                    haveChat: true
                }
                MessagesListManager.AddItem(mes, options)
            }
        }
    })()
    
    function GetLastMessagesHistory() {
        $.get(CONTROLLER_NAME_CABINET + METHOD_GET_LAST_MESSAGES,
            res => {
                Loader.Hide()
                res.forEach(m => MessagesListManager.AddItem(m))
            })
            .fail(err => console.log(err))
    }

    _RAZOR_NOTIFICATION_CONNECTION.on("OnMessageAdded", mes => {
        MessagesListManager.UpdateItem(JSON.parse(mes))
    })

    GetLastMessagesHistory()
    Loader.Show()
})()
