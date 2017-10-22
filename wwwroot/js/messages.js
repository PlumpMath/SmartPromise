(function () {
    console.log("______________messages.js______________")

    let messages_list_id = '#_friends_list'
    let messages_loader_id = "#_messages_loader_id"
    let method__GetLastMessages = '/GetLastMessagesHistory/'
    let controller_Cabinet = '/Cabinet'

    function showLoader() {
        if (!$(messages_list_id).hasClass("loader")) {
            $(messages_list_id).addClass("loader")
        }
    }

    function hideLoader() {
        if ($(messages_list_id).hasClass("loader")) {
            $(messages_list_id).removeClass("loader")
        }
    }
    /*
    function appendItem(email, id, list_id, icon) {
        $(list_id).append(`
           <a href="#" class="list-group-item clearfix">`
            + email +
            `<span class="pull-right">
                    <span id="` + id + `add_message" class="btn btn-xs btn-default">
                        <span class="glyphicon glyphicon-envelope" aria-hidden="true"></span>
                    </span>
                    <span id="` + id + `" class="btn btn-xs btn-default">
                        <span class="` + icon + `" aria-hidden="true"></span>
                    </span>
                </span>
            </a>
        `)
    }*/

    function GetLastMessagesHistory() {
        $.get(controller_Cabinet + method__GetLastMessages,
            res => console.log(res))
            .fail(err => console.log(err))
    }

    GetLastMessagesHistory()

})()
