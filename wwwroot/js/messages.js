var Messages = function () {
    console.log("______________messages.js______________")
    const CONTROLLER_NAME = '/api/Messages'
    const METHOD_GET_MY_USER_INFO = '/GetOwner/'
    const METHOD_GET_LAST_MESSAGES = '/GetLastMessagesHistory/'

    function main(owner) {
        const OWNER = owner
        console.log(OWNER)

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

            function GetFriendId(mes) {
                return OWNER.id === mes.senderId ? mes.receiverId : mes.senderId
            }

            function GetFriendEmail(mes) {
                return OWNER.id === mes.senderId ? mes.receiverEmail : mes.senderEmail
            }

            function HaveChatWithFriend(friendId, friendEmail) {
                console.log("move")
                window.location.href = _RAZOR_URL_CABINET_PRIVATE_CHAT
                    .replace('__id__', friendId).replace('__email__', friendEmail);
            }

            function HaveChatOnClick(mes) {
                let itemId = MessagesListManager.GetItemId(mes)
                let friendId = GetFriendId(mes)
                let friendEmail = GetFriendEmail(mes)
                console.log(mes.senderEmail + " " + itemId)
                $(itemId).click(() => HaveChatWithFriend(friendId, friendEmail))

            }

            //it's unique
            function GetId(mes) {
                return mes.senderId.toString() + mes.receiverId.toString() /*mes.serverDateUtc.toString() */
            }

            function ParseDate(str) {
                let i = str.toString().indexOf(".")
                return str.toString().replace("T", " ").substr(0, i)
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
                    <a id="` + ITEM_PREFIX + id + `" class="media message list-group-item clearfix ">
                        <span class="pull-left">
                            <img id="` + ITEM_PREFIX + id + `" src="` +
                        HELPERS.GetAvatarImageUrl(70, 70, 100, GetFriendId(mes)) +
                        `" id="` + IMAGE_PREFIX_RECEIVER + id + `" 
                                alt="User Avatar" class="img-responsive img-circle" width="70" height="70"/>                        
                        </span>
                        <div>
                            <small class="pull-right time">` + ParseDate(mes.userDateLocal) + `</small>

                            <h5 class="media-heading">` + GetFriendEmail(mes) + `</h5>
                            <small class="col-lg-10 ` + (mes.isUnread ? "unread-message" : "") + `">` +
                        mes.senderEmail + ": " + mes.content + `"</small>
                        </div>
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
            $.get(CONTROLLER_NAME + METHOD_GET_LAST_MESSAGES,
                res => {
                    Loader.Hide()
                    res.forEach(m => MessagesListManager.AddItem(m))
                })
                .fail(err => console.log(err))
        }

        _RAZOR_NOTIFICATION_CONNECTION.on("OnMessageAdded", mes => {
            MessagesListManager.UpdateItem(JSON.parse(mes))
        })

        Loader.Show()
        GetLastMessagesHistory()
    }


    $.get(CONTROLLER_NAME + METHOD_GET_MY_USER_INFO, res => main(res))
        .fail(err => console.log(err))
}
