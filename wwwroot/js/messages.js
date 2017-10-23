(function () {
    console.log("______________messages.js______________")

    let messages_list_id = '#_messages_list'
    let messages_loader_id = "#_messages_loader_id"
    let method__GetLastMessages = '/GetLastMessagesHistory/'
    let controller_Cabinet = '/Cabinet'
    let method_GetMyUserInfo = '/GetMyUserInfo/'
    
    function GetMyUserInfo() {
        return new Promise((resolve, reject) => {
            $.get(controller_Cabinet + method_GetMyUserInfo, res => resolve(res))
                .fail(err => reject(err))
        })
    } 

    function moveToPrivateChat(id, email) {
        window.location.href = url.replace('__id__', id).replace('__email__', email);
    }

    function addClickHandlerMessage(id, email) {
        console.log(id + "  " + email)
        let buttonId = "#" + id + "add_message"
        $(buttonId).click(() => moveToPrivateChat(id, email))
    }
    
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

    //add href instead of click handler? much simpler
    function appendItem(senderEmail, receiverEmail, message, list_id, button_id) {
        $(list_id).append(`
           <a id="` + button_id +`add_message" class="list-group-item clearfix">` + `
                <div class="text-center">` + message + `</div>` +
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

    function GetRecepientId(user, message_obj) {
        return user.id === message_obj.senderId ? message_obj.receiverId : message_obj.senderId
    }

    function GetRecepientEmail(user, message_obj) {
        return user.id === message_obj.senderId ? message_obj.receiverEmail : message_obj.senderEmail
    }
    
    function GetLastMessagesHistory() {
        $.get(controller_Cabinet + method__GetLastMessages,
            res => {
                hideLoader()
                GetMyUserInfo().then(user => {
                    res.forEach(v => {
                        let recepientId = GetRecepientId(user, v)

                        appendItem(v.senderEmail, v.receiverEmail, v.content, messages_list_id, recepientId)
                        addClickHandlerMessage(recepientId, GetRecepientEmail(user, v))
                        //addClickHandlerMessage(v.)
                    })
                })
                
            })
            .fail(err => console.log(err))
    }

    GetLastMessagesHistory()
    showLoader()
})()
