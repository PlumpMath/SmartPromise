
var Notification = function () {
    
    console.log("______________notification.js______________")
    
    const ADD_NOTIFICATION_BUTTON_ID = "#_add_notification_button"
    const MESSAGES_NAV_ID = "#_messages_nav_id"
    
    const CONTROLLER_NAME = '/api/Friends/'
    const METHOD_GET_PENDING_FRIENDS = 'GetPendingFriends/'
    const METHOD_ACCEPT_FRIENDSHIP = 'AcceptFriendship/'
    const METHOD_REJECT_FRIENDSHIP = 'RejectFriendship/'

    let unread_messages_count = 0
    let notifications_count = 0

    var NotificationsManager = (function() {
        
        const ACCEPT_FRIEND_BUTTON_PREFIX = 'AF'
        const NOT_ACCEPT_FRIEND_BUTTON_PREFIX = 'NAF'
        const ITEM_PREFIX = 'IP'

        const GINGLE_ID = "#_gingle_id"
        const NOTIFICATIONS_LABEL_ID = '#_noti_label_id'
        const NOTIFICATION_LIST_ID = '#_notifications_list'

        let notifications_count = 0

        function GetItemId(user) {
            return user.id.toString()
        }

        function Show() {
            let text = "Notifications (" + notifications_count + ")"
            $(GINGLE_ID).attr("data-count", notifications_count)
            $(NOTIFICATIONS_LABEL_ID).html(text)
        }

        function IncreaseNotifications() {
            ++notifications_count
            Show()
        }

        function DecreaseNotifications() {
            --notifications_count
            Show()
        }

        function AcceptFriendship(user) {
            $.get(CONTROLLER_NAME + METHOD_ACCEPT_FRIENDSHIP + user.id, () => RemoveItem(user))
        }

        function RejectFriendship(user) {
            $.get(CONTROLLER_NAME + METHOD_REJECT_FRIENDSHIP + user.id, () => RemoveItem(user))
        }

        function AddAcceptFriendshipHandler(user) {
            let id = NotificationsManager.GetAcceptFriendButtonId(user)
            $(id).click(() => AcceptFriendship(user))
        }

        function AddRejectFriendshipHandler(user) {
            let id = NotificationsManager.GetNotAcceptFriendButtonId(user)
            $(id).click(() => RejectFriendship(user))
        }
            

        function RemoveItem(user) {
            let item_id = NotificationsManager.GetItemId(user)
            $(item_id).remove()
            DecreaseNotifications()
        }
        
        return {
            GetNotAcceptFriendButtonId: user => '#' + NOT_ACCEPT_FRIEND_BUTTON_PREFIX + GetItemId(user)
            ,

            GetAcceptFriendButtonId: user => '#' + ACCEPT_FRIEND_BUTTON_PREFIX + GetItemId(user)
            ,

            GetItemId: user => '#' + ITEM_PREFIX + GetItemId(user)
            ,

            AddItem: user => {
                let element = `
                        <li id="` + ITEM_PREFIX + GetItemId(user) +`" class="notification">
                            <div class="media">
                                <div class="media-left">
                                    <div class="media-object">
                                        <img src="` + HELPERS.GetAvatarImageUrl(50, 50, 100, user.id) +
                                            `" height="50" width="50" class="img-circle" alt="Name">
                                    </div>
                                </div>
                                <div class="media-body">
                                    <strong class="notification-title">Friend request from <a href="` + HELPERS.GetUserProfileHref(user.id) + `">` +
                                        user.email + `</a></strong>

                                    <p>Would like to accept him as a friend?</p>

                                    <button type="button" id="`+ ACCEPT_FRIEND_BUTTON_PREFIX + GetItemId(user) + `" class="btn btn-success">
                                        <span class="glyphicon glyphicon-ok"></span>
                                    </button> 

                                    <button type="button" id="` + NOT_ACCEPT_FRIEND_BUTTON_PREFIX + GetItemId(user) + `" class="btn btn-danger">
                                        <span class="glyphicon glyphicon-remove"></span>
                                    </button>
                                    
                                    <!-- <div class="notification-meta">
                                        <small class="timestamp">27. 10. 2015, 08:00</small>
                                    </div>-->

                                </div>
                            </div>
                        </li>`
                $(NOTIFICATION_LIST_ID).append(element)
                IncreaseNotifications()
                AddAcceptFriendshipHandler(user)
                AddRejectFriendshipHandler(user)
            }
        }
    })()
    
    function GetPendingFriends() {
        $.get(CONTROLLER_NAME + METHOD_GET_PENDING_FRIENDS, res => {
            res.forEach(u => NotificationsManager.AddItem(u))
        })
    }

    GetPendingFriends()
    
    function UpdateNavigator(new_amount) {
        let text = (new_amount == 0)? "" : new_amount
        $(MESSAGES_NAV_ID).html(text)
    }

    _RAZOR_NOTIFICATION_CONNECTION.on("OnNewUnreadMessage", user => {
        ++unread_messages_count
        UpdateNavigator(unread_messages_count.toString())

    })

    _RAZOR_NOTIFICATION_CONNECTION.on("OnMessageHistoryRead", () => {
        unread_messages_count = 0
        UpdateNavigator(unread_messages_count.toString())
    })
}