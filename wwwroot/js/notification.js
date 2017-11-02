
(function () {

    console.log("______________notification.js______________")
    
    const ADD_NOTIFICATION_BUTTON_ID = "#_add_notification_button"
    const MESSAGES_NAV_ID = "#_messages_nav_id"
    
    const CONTROLLER_NAME = '/api/Friends/'
    const METHOD_GET_PENDING_FRIENDS = 'GetPendingFriends/'
        
    let unread_messages_count = 0
    let notifications_count = 0

    var NotificationsManager = (function() {
        const NOTIFICATION_LIST_ID = '#_notifications_list'
        const ACCEPT_FRIEND_BUTTON_PREFIX = 'AF'
        const NOT_ACCEPT_FRIEND_BUTTON_PREFIX = 'NAF'
        const GINGLE_ID = "#_gingle_id"
        const NOTIFICATIONS_LABEL_ID = '#_noti_label_id'

        let notifications_count = 0

        function GetItemId(user) {
            return user.id.toString()
        }

        function IncreaseNotifications() {
            ++notifications_count
            let text = "Notifications (" + notifications_count + ")"
            $(GINGLE_ID).attr("data-count", notifications_count)
            $(NOTIFICATIONS_LABEL_ID).html(text)
        }
        
        return {
            GetNotAcceptFriendButtonId: user => '#' + ACCEPT_FRIEND_BUTTON_PREFIX + GetItemId(user)
            ,

            GetAcceptFriendButtonId: user => '#' + NOT_ACCEPT_FRIEND_BUTTON_PREFIX + GetItemId(user)
            ,
            
            AddItem: user => {
                let element = `
                        <li class="notification">
                            <div class="media">
                                <div class="media-left">
                                    <div class="media-object">
                                        <img src="` + _RAZOR_URL_CABINET_GET_AVATAR.replace("__id__", user.id) +
                                            `" height="50" width="50" class="img-circle" alt="Name">
                                    </div>
                                </div>
                                <div class="media-body">
                                    <strong class="notification-title">Friend request from <a href="#">` + user.email + `</a></strong>

                                    <p>Would like to accept him as a friend?</p>

                                    <button id="`+ NotificationsManager.GetNotAcceptFriendButtonId(user) + `" class="btn btn-success">
                                        <span class="glyphicon glyphicon-ok" href="#"></span>
                                    </button> 

                                    <button id="` + NotificationsManager.GetAcceptFriendButtonId(user) + `" class="btn btn-danger">
                                        <span class="glyphicon glyphicon-remove" href="#"></span>
                                    </button>
                                    
                                    <!-- <div class="notification-meta">
                                        <small class="timestamp">27. 10. 2015, 08:00</small>
                                    </div>-->

                                </div>
                            </div>
                        </li>`
                $(NOTIFICATION_LIST_ID).append(element)
                IncreaseNotifications()
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
        let text = "Messages " + "(" + new_amount + ")"
        $(MESSAGES_NAV_ID).html(text)
        console.log(text)
    }

    _RAZOR_NOTIFICATION_CONNECTION.on("OnNewUnreadMessage", user => {
        ++unread_messages_count
        UpdateNavigator(unread_messages_count.toString())

    })

    _RAZOR_NOTIFICATION_CONNECTION.on("OnMessageHistoryRead", () => {
        unread_messages_count = 0
        UpdateNavigator(unread_messages_count.toString())
    })
})()