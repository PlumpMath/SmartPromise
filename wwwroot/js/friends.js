(function () {
    console.log("______________friends.js______________")

    let find_input_id = '#_find_input'
    let other_users_list_id = '#_other_users_list'
    let friends_list_id = '#_friends_list'
    let method_FindByEmail = '/FindByEmail/'
    let method_AddFriend = '/AddFriend/'
    let method_RemoveFriend = '/RemoveFriend/'
    let method_PrivateChat = '/PrivateChat/'
    let controller = '/Cabinet'
    let friends_loader_id = "#_friends_loader_id"
    let others_loader_id = "#_others_loader_id"

    function GetImage(byteArray) {
        return "data:image/png;base64," + byteArray
    }

    function MakeFind(friends_list, others_list) {
        let friends_copy = [...friends_list]
        let others_copy = [...others_list]
        return function (findString, filtered) {
            
            filtered.friends = friends_copy.filter(v => v.email.startsWith(findString))
            filtered.others = others_copy.filter(v => v.email.startsWith(findString))

        }
    }

    function clearLists() {
        $(other_users_list_id).empty()
        $(friends_list_id).empty()
    }

    function showLoader() {
        clearLists()

        if (!$(friends_loader_id).hasClass("loader")) {
            $(friends_loader_id).addClass("loader")
        }

        if (!$(others_loader_id).hasClass("loader")) {
            $(others_loader_id).addClass("loader")
        }
    }

    function hideLoader() {
        clearLists()

        if ($(friends_loader_id).hasClass("loader")) {
            $(friends_loader_id).removeClass("loader")
        }

        if ($(others_loader_id).hasClass("loader")) {
            $(others_loader_id).removeClass("loader")
        }
    }
    
    function appendItem(email, id, list_id, icon, isOnline, avatarByteArray) {
        console.log("HEREHEREHEREHEREHEREHEREHEREHEREHERE")
        $(list_id).append(`
           <a href="#" class="list-group-item clearfix">`
            + email +           
                `<span class="pull-left">
                    <img src="` + GetImage(avatarByteArray) +`" alt="User Avatar" class="img-responsive img-circle" width="70" height="70"/>
                </span>
                <span class="pull-right">
                    <span id="` + id + `add_message" class="btn btn-xs btn-default">
                        <span class="glyphicon glyphicon-envelope" aria-hidden="true"></span>
                    </span>
                    <span id="` + id + `" class="btn btn-xs btn-default">
                        <span class="` +  icon + `" aria-hidden="true"></span>
                    </span>
                    <div class="` + (isOnline ? "led-online" : "led-offline") + `"></div>       
                </span>
            </a>
        `)
    }

    function addClickHandlerAdd(id) {
        let buttonId = "#" + id
        $(buttonId).click(function () {
            AddFriend(id)
        })
    }

    function moveToPrivateChat(id, email) {
        window.location.href = _RAZOR_URL_CABINET_PRIVATE_CHAT.replace('__id__', id).replace('__email__', email);
    }

    function addClickHandlerMessage(id, email) {
        console.log(id + "  "  + email)
        let buttonId = "#" + id + "add_message"
        $(buttonId).click(function () {
            console.log("clicked")
            moveToPrivateChat(id, email)
        })
    }

    function addClickHandlerRemove(id) {
        let buttonId = "#" + id
        $(buttonId).click(function () {
            RemoveFriend(id)
        })
    }

    function AddFriend(param) {
        $.get(controller + method_AddFriend + param,
            function () {
                console.log("Friend has been added")
                showLoader()
                //can be optimisized
                OnUsersReceived($(find_input_id).val())
            })
            .fail(function (err) { console.log(err) })
    }

    function RemoveFriend(param) {
        $.get(controller + method_RemoveFriend + param,
            function () {
                console.log("Friend has been removed")
                //can be optimisized
                showLoader()
                OnUsersReceived($(find_input_id).val())
            })
            .fail(function (err) { console.log(err) })
    }

    function ShowLists(otherUsers, friends) {

        let minus_icon = "glyphicon glyphicon-minus"
        let plus_icon = "glyphicon glyphicon-plus"
        clearLists()

        otherUsers.forEach(
            v => {
                //create button
                appendItem(v.email, v.id, other_users_list_id, plus_icon, v.isOnline, v.avatar);
                //add listener to it
                //append is synchrounious so it's legal
                addClickHandlerAdd(v.id)
                addClickHandlerMessage(v.id, v.email)
            }
        )

        friends.forEach(
            v => {
                appendItem(v.email, v.id, friends_list_id, minus_icon, v.isOnline, v.avatar)
                addClickHandlerRemove(v.id)
                addClickHandlerMessage(v.id, v.email)
            }
        )
    }

    function OnUsersReceived(param) {
        
        $.get(controller + method_FindByEmail + param,
            function (res) {
                //console.log(res)
                console.log("____________________")
                console.log(res)
                console.log("____________________")

                let Find = MakeFind(res.friends, res.users)
                hideLoader()
                
                $(find_input_id).on('input', function () {
                    //console.log($(find_input_id).val())

                    let filtered = {}
                    
                    Find($(find_input_id).val(), filtered)

                    let otherUsers = filtered.others
                    let friends = filtered.friends

                    ShowLists(otherUsers, friends)
                    /*console.log($(find_input_id).val())*/
                })

                ShowLists(res.users, res.friends)
            })
            .fail(function (err) { console.log(err) })
    }
    
    showLoader()
    //requests for all records in database
    OnUsersReceived("")

})()