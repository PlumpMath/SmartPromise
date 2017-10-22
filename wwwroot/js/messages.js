(function () {
    console.log("______________messages.js______________")

    let messages_list_id = '#_messages_list'
    let messages_loader_id = "#_messages_loader_id"
    let method__GetLastMessages = '/GetLastMessagesHistory/'
    let controller_Cabinet = '/Cabinet'

    function showLoader() {
        console.log("gere")
        if (!$(messages_loader_id).hasClass("loader")) {
            $(messages_loader_id).addClass("loader")
        }
    }

    function hideLoader() {
        if ($(messages_loader_id).hasClass("loader")) {
            $(messages_loader_id).removeClass("loader")
        }
    }
    
    function appendItem(senderEmail, receiverEmail, message, list_id, i) {
        $(list_id).append(`
           <a href="#" class="list-group-item clearfix">` + `
                <div id="` + i +`chat" class="text-center">` + message + `</div>` +
            `   <span class="pull-left">
                    <span class="btn btn-xs btn-default">`
                        + " Reciever : " + receiverEmail + " " +
                    `</span>
                </span>
                <span class="pull-right">
                    <span class="btn btn-xs btn-default">`
                        + " Sender : " + senderEmail + " " +
                    `</span>
                </span>
            </a>
        `)
    }

    function AddClickMessageHandler(id) {

    }
    
    function GetLastMessagesHistory() {
        $.get(controller_Cabinet + method__GetLastMessages,
            res => {
                hideLoader()
                res.forEach((v, i) => {
                    appendItem(v.senderEmail, v.receiverEmail, v.content, messages_list_id, i)
                    AddClickMessageHandler(i)
                })
            })
            .fail(err => console.log(err))
    }

    GetLastMessagesHistory()
    showLoader()
})()
