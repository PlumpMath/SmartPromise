(function () {
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
                                alt="User Avatar" class="img-responsive img-rounded" width="70" height="70"/>                        
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
})()



/*

<div class="list-group container">
   <a class="media message list-group-item clearfix ">
        <span class="pull-left" href="#">
            <img class="img-responsive img-rounded" data-src="holder.js/32x32" alt="32x32" width="50"; height="50" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAYAAACqaXHeAAACqUlEQVR4Xu2Y60tiURTFl48STFJMwkQjUTDtixq+Av93P6iBJFTgg1JL8QWBGT4QfDX7gDIyNE3nEBO6D0Rh9+5z9rprr19dTa/XW2KHl4YFYAfwCHAG7HAGgkOQKcAUYAowBZgCO6wAY5AxyBhkDDIGdxgC/M8QY5AxyBhkDDIGGYM7rIAyBgeDAYrFIkajEYxGIwKBAA4PDzckpd+322243W54PJ5P5f6Omh9tqiTAfD5HNpuFVqvFyckJms0m9vf3EY/H1/u9vb0hn89jsVj8kwDfUfNviisJ8PLygru7O4TDYVgsFtDh9Xo9NBrNes9cLgeTybThgKenJ1SrVXGf1WoVDup2u4jFYhiPx1I1P7XVBxcoCVCr1UBfTqcTrVYLe3t7OD8/x/HxsdiOPqNGo9Eo0un02gHkBhJmuVzC7/fj5uYGXq8XZ2dnop5Mzf8iwMPDAxqNBmw2GxwOBx4fHzGdTpFMJkVzNB7UGAmSSqU2RoDmnETQ6XQiOyKRiHCOSk0ZEZQcUKlU8Pz8LA5vNptRr9eFCJQBFHq//szG5eWlGA1ywOnpqQhBapoWPfl+vw+fzweXyyU+U635VRGUBOh0OigUCggGg8IFK/teXV3h/v4ew+Hwj/OQU4gUq/w4ODgQrkkkEmKEVGp+tXm6XkkAOngmk4HBYBAjQA6gEKRmyOL05GnR99vbW9jtdjEGdP319bUIR8oA+pnG5OLiQoghU5OElFlKAtCGr6+vKJfLmEwm64aosd/XbDbbyIBSqSSeNKU+HXzlnFAohKOjI6maMs0rO0B20590n7IDflIzMmdhAfiNEL8R4jdC/EZIJj235R6mAFOAKcAUYApsS6LL9MEUYAowBZgCTAGZ9NyWe5gCTAGmAFOAKbAtiS7TB1Ng1ynwDkxRe58vH3FfAAAAAElFTkSuQmCC">
        </span>
        <div>
            <small class="pull-right time"> 12:10am</small>

            <h5 class="media-heading">Naimish Sakhpara</h5>
            <small class="unread col-lg-10">Arnab Goswami: "Hi!."</small>
        </div>
    </a>
</div>

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
*/
