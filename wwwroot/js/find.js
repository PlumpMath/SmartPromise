(function () {
    console.log("______________find.js______________")

    let find_input_id = '#_find_input'
    let other_users_list_id = '#_other_users_list'
    let friends_list_id = '#_friends_list'
    let method_FindByEmail = '/FindByEmail/'
    let method_AddFriend = '/AddFriend/'
    let method_RemoveFriend = '/RemoveFriend/'
    let controller = '/Cabinet'

    function clearLists() {
        $(other_users_list_id).empty()
        $(friends_list_id).empty()
    }

    function appendItem(email, id, list_id, icon) {
        $(list_id).append(`
           <a href="#" id="` + id + `" class="list-group-item clearfix">`
                + email +
                `<span class="pull-right">
                    <span class="btn btn-xs btn-default">
                        <span class="` +  icon + `" aria-hidden="true"></span>
                    </span>
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
                //can be optimisized
                GetUsers($(find_input_id).val())
            })
            .fail(function (err) { console.log(err) })
    }

    function RemoveFriend(param) {
        $.get(controller + method_RemoveFriend + param,
            function () {
                console.log("Friend has been removed")
                //can be optimisized
                GetUsers($(find_input_id).val())
            })
            .fail(function (err) { console.log(err) })
    }

    function GetUsers(param) {

        let minus_icon = "glyphicon glyphicon-minus"
        let plus_icon = "glyphicon glyphicon-plus"

        $.get(controller + method_FindByEmail + param,
            function (res) {
                console.log(res)
                let otherUsers = res.users

                clearLists()
                otherUsers.forEach(
                    v => {
                        //create button
                        appendItem(v.email, v.id, other_users_list_id, plus_icon);
                        //add listener to it
                        //append is synchrounious so it's legal
                        addClickHandlerAdd(v.id)
                    }
                )

                let friends = res.friends
                friends.forEach(
                    v => {
                        appendItem(v.email, v.id, friends_list_id, minus_icon)
                        addClickHandlerRemove(v.id)
                    }
                )

            })
            .fail(function (err) { console.log(err) })
    }

    $(find_input_id).on('input', function () {
        GetUsers($(find_input_id).val())
        /*console.log($(find_input_id).val())*/
    })

    //requests for all records in database
    GetUsers("")

})()