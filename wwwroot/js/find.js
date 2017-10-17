(function () {
    console.log("______________find.js______________")

    let find_input_id = '#_find_input'
    let list_id = '#_friends_list'
    let method = '/FindByEmail/'
    let controller = '/Cabinet'

    function clearList() {
        $(list_id).empty()
    }

    function appendItem(email, id) {
        $(list_id).append(`
           <a href="#" id="` + id + `" class="list-group-item clearfix">`
                + email +
                `<span class="pull-right">
                    <span class="btn btn-xs btn-default">
                        <span class="glyphicon glyphicon-plus" aria-hidden="true"></span>
                    </span>
                </span>
            </a>
        `)
    }

    function addClickHandlerAdd(id) {
        let buttonId = "#" + id
        $(buttonId).click(function () {
            console.log(id)
        })
    }

    function GetRequest(param) {
        $.get(controller + method + param,
            function (res) {
                console.log(res)
                clearList()
                res.forEach(
                    v => {
                        //create button
                        appendItem(v.email, v.id);
                        //add listener to it
                        //append is synchrounious so it's legal
                        addClickHandlerAdd(v.id)
                    }
                )

            })
            .fail(function (err) { console.log(err) })
    }

    $(find_input_id).on('input', function () {
        GetRequest($(find_input_id).val())
        /*console.log($(find_input_id).val())*/
    })

    //requests for all records in database
    GetRequest("")

})()