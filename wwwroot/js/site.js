

var connection = $.hubConnection(), hub = connection.createHubProxy('notification');

var join = function (msg) {
    $('<p>').text(msg).appendTo('.room')
}

hub.on('join', join)

connection.start(function () {
    hub.invoke('join')
})