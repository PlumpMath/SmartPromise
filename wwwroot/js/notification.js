(function() {

    console.log("______________notification.js______________")

    let add_notification_button_id = "#_add_notification_button"
    
    let connection = new signalR.HubConnection('/notification');
    let notification_counter = 0
    let notification_list_id = '#_notifications_list'
    let notification_counter_id = '#_notification_counter'

    function changeCounter() {
        ++notification_counter
        $(notification_counter_id).attr("data-count", notification_counter.toString())
    }

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

    connection.on('Notify', msg => { addNotification(); changeCounter() })

    connection.start().then(function () {
        $(document).ready(function () {
            $(add_notification_button_id).click(function () {
                connection.invoke('Notify')
            })
        })
    })
})()