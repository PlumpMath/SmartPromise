(function () {
    console.log("______________find.js______________")

    let find_input_id = '#_find_input'
    let list_id = '#_friends_list'
    let method = '/FindByEmail/'
    let controller = '/Cabinet'

    function clearList() {
        $(list_id).empty()
    }

    function appendItem(email) {
        $(list_id).append(`
           <a href="#" class="list-group-item clearfix" onclick="alert('Action1 -> Details');">`
                + email +
                `<span class="pull-right">
                    <span class="btn btn-xs btn-default" onclick="alert('Action1 -> Play'); event.stopPropagation();">
                        <span class="glyphicon glyphicon-plus" aria-hidden="true"></span>
                    </span>
                </span>
            </a>
        `)
    }

    $(find_input_id).on('input', function () {
        $.get(controller + method + $(find_input_id).val(),
            function (res) {
                clearList()
                res.forEach(v => appendItem(v))
            })
            .fail(function (err) { console.log(err) })

        /*console.log($(find_input_id).val())*/
    })
})()