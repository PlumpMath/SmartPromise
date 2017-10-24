(function() {

    console.log("______________notification.js______________")
    
    let add_notification_button_id = "#_add_notification_button"
    
    let connection = new signalR.HubConnection('/notification');
    let unread_messages_count = 0
    let messages_navigator_id = "#_messages_navigator_id"
    let notify_gingle_id = "#_notify_gingle_id"

    
    function UpdateGingle(new_amount) {
        $(notify_gingle_id).attr("data-count", new_amount)
    }
    
    /*
    function UpdateNavigator(new_amount) {
        let text = "Messages " + "(" + new_amount + ")"
        console.log(text)
        $(unread_messages_count).text(text)   
    }*/

    connection.on("OnNewUnreadMessage", user => {
        console.log(JSON.parse(user))
        ++unread_messages_count
        UpdateGingle(unread_messages_count.toString())
        //UpdateNavigator(unread_messages_count.toString())
    })

    connection.on("OnMessageHistoryRead", () => {
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
    
    connection.start().then(function () {
        $(document).ready(function () {
            
        })
    })
})()