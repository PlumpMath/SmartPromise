
(function () {

    console.log("______________notification.js______________")
    
    const ADD_NOTIFICATION_BUTTON_ID = "#_add_notification_button"
    const MESSAGES_NAV_ID = "#_messages_nav_id"
    const GINGLE_ID = "#_gingle_id"

    let unread_messages_count = 0
    
    function UpdateGingle(new_amount) {
        $(GINGLE_ID).attr("data-count", new_amount)
    }
    
    /*
    function UpdateNavigator(new_amount) {
        let text = "Messages " + "(" + new_amount + ")"
        console.log(text)
        $(unread_messages_count).text(text)   
    }*/

    _RAZOR_NOTIFICATION_CONNECTION.on("OnNewUnreadMessage", user => {
        console.log(JSON.parse(user))
        ++unread_messages_count
        UpdateGingle(unread_messages_count.toString())
        //UpdateNavigator(unread_messages_count.toString())
    })

    _RAZOR_NOTIFICATION_CONNECTION.on("OnMessageHistoryRead", () => {
        unread_messages_count = 0
        UpdateGingle(unread_messages_count.toString())
        //UpdateNavigator(unread_messages_count.toString())
    })
    

    function addNotification() {
        $(notification_list_id).append(`
        <li class="notification">
            <div class="media" >
                <div class="media-left">
                    <div class="media-object">
                        <img data-src="holder.js/50x50?bg=cccccc" class="img-circle" alt="Name">
                    </div>
                </div>

                <div class="media-body">
                    <strong class="notification-title">
                        <a href="#">Nikola Tesla</a> resolved <a href="#">T-14 - Awesome stuff</a>
                    </strong>

                <p class="notification-desc">Resolution: Fixed, Work log: 4h</p>

                    <div class="notification-meta">
                        <small class="timestamp">27. 10. 2015, 08:00</small>
                    </div>
                </div>
            </div>
        </li >`)
    }
})()