(function () {
    console.log("______________friends.js______________")

    const FIND_INPUT_ID = '#_find_input'
    const OTHERS_LIST_ID = '#_other_users_list'
    const FRIENDS_LIST_ID = '#_friends_list'

    let METHOD_FIND_BY_EMAIL = '/FindByEmail/'
    let METHOD_ADD_FRIEND = '/AddFriend/'
    let METHOD_REMOVE_FRIEND = '/RemoveFriend/'
    let CONTROLLER_NAME_CABINET = '/Cabinet'
    let FRIENDS_LOADER_ID = "#_friends_loader_id"
    let OTHERS_LOADER_ID = "#_others_loader_id"

    function ShowLoaders() {
        Loader(OTHERS_LOADER_ID).Show()
        Loader(FRIENDS_LOADER_ID).Show()
    }

    function HideLoaders() {
        Loader(OTHERS_LOADER_ID).Hide()
        Loader(FRIENDS_LOADER_ID).Hide()
    }

    function Loader(loader_id) {
        return (loader_id => {
            const LOADER_STYLE = "loader"
            const LOADER_ID = loader_id

            return {
                Show: () => {
                    if (!$(LOADER_ID).hasClass(LOADER_STYLE)) {
                        $(LOADER_ID).addClass(LOADER_STYLE)
                    }
                },
                Hide: () => {
                    if ($(LOADER_ID).hasClass(LOADER_STYLE)) {
                        $(LOADER_ID).removeClass(LOADER_STYLE)
                    }
                }
            }
        })(loader_id)
    }

    function UserListManager(list_id) {
        return (list_id => {

            let LIST_ID = list_id
            const ITEM_PREFIX = 'IT'
            const ICON_FRIEND_PREFIX = 'IF'
            const ICON_PREFIX_ENVELOPE = 'IE'
            const LED_PREFIX = 'L'
            const STYLE_ICON_MINUS = "glyphicon glyphicon-minus"
            const STYLE_ICON_PLUS = "glyphicon glyphicon-plus"
            const STYLE_ICON_ENVELOPE =  "glyphicon glyphicon-envelope"

            function AddFriend(param) {
                $.get(CONTROLLER_NAME_CABINET + METHOD_ADD_FRIEND + param,
                    () => {
                        ClearLists()
                        ShowLoaders()
                        FindUsers($(FIND_INPUT_ID).val())
                    })
                    .fail(err => console.log(err))
            }

            function RemoveFriend(param) {
                $.get(CONTROLLER_NAME_CABINET + METHOD_REMOVE_FRIEND + param,
                    () => {
                        ClearLists()
                        ShowLoaders()
                        FindUsers($(FIND_INPUT_ID).val())
                    })
                    .fail(err => console.log(err))
            }

            function AddFriendHandler(user, isFriend) {
                $(UserListManager(LIST_ID).GetIconFriendId(user))
                    .click(() => isFriend ? RemoveFriend(user.id) : AddFriend(user.id))
            }

            function HaveChatWithUser(userId, userEmail) {
                window.location.href = _RAZOR_URL_CABINET_PRIVATE_CHAT
                    .replace('__id__', userId).replace('__email__', userEmail);
            }

            function AddChatHandler(user) {
                $(UserListManager(LIST_ID).GetIconEnvelopeId(user))
                    .click(() => HaveChatWithUser(user.id, user.email))
            }
            
            //it's unique'
            function GetId(user) {
                return user.id.toString()
            }

            function AddItem(user, isFriend) {
                let icon = isFriend ? STYLE_ICON_MINUS : STYLE_ICON_PLUS
                let id = GetId(user)
                let element = `
                       <a class="list-group-item clearfix">`
                    + user.email +
                    `<span class="pull-left">
                                <img src="` + _RAZOR_URL_CABINET_GET_AVATAR.replace("__id__", user.id) +
                    `" alt="User Avatar" class="img-responsive img-circle" width="70" height="70"/>
                            </span>
                            <span class="pull-right">
                                <span id="` + ICON_PREFIX_ENVELOPE + id + `" class="btn btn-xs btn-default">
                                    <span class="` + STYLE_ICON_ENVELOPE + `" aria-hidden="true"></span>
                                </span>
                                <span id="` + ICON_FRIEND_PREFIX + id + `" class="btn btn-xs btn-default">
                                    <span class="` + icon + `" aria-hidden="true"></span>
                                </span>
                                <div id="` + LED_PREFIX + id +
                                `" class="` + (user.isOnline ? "led-online" : "led-offline") + `"></div>       
                            </span>
                        </a>
                    `

                $(LIST_ID).append(element)
                AddFriendHandler(user, isFriend)
                AddChatHandler(user)
            }
            
            return {
                GetIconFriendId: user => '#' + ICON_FRIEND_PREFIX + GetId(user)
                ,

                GetLedId: user => '#' + LED_PREFIX + GetId(user)
                ,

                GetIconEnvelopeId: user => '#' + ICON_PREFIX_ENVELOPE + GetId(user)
                ,

                GetItemId: user => '#' + ITEM_PREFIX + GetId(user)
                ,
                
                Clear: () => $(LIST_ID).empty()
                ,

                FillList: (list, areFriends) => {
                    UserListManager(LIST_ID).Clear()
                    list.forEach(u => AddItem(u, areFriends))
                }
            }
        })(list_id)
        
    }

    function ConstructFindFunction(friends, others) {
        let friends_copy = [...friends]
        let others_copy = [...others]
        return (findString, filtered) => {
            filtered.friends = friends_copy.filter(v => v.email.startsWith(findString))
            filtered.others = others_copy.filter(v => v.email.startsWith(findString))
        }
    }

    function ClearLists() {
        UserListManager(OTHERS_LIST_ID).Clear()
        UserListManager(FRIENDS_LIST_ID).Clear()
    }
    
    function FindUsers(param) {
        $.get(CONTROLLER_NAME_CABINET + METHOD_FIND_BY_EMAIL + param,
            model => {
                let Find = ConstructFindFunction(model.friends, model.others)
                HideLoaders()
                
                $(FIND_INPUT_ID).on('input', function () {
                    
                    let filtered = {}
                    
                    Find($(FIND_INPUT_ID).val(), filtered)

                    let others = filtered.others
                    let friends = filtered.friends

                    UserListManager(OTHERS_LIST_ID).FillList(others, false)
                    UserListManager(FRIENDS_LIST_ID).FillList(friends, true)
                })
                
                UserListManager(OTHERS_LIST_ID).FillList(model.others, false)
                UserListManager(FRIENDS_LIST_ID).FillList(model.friends, true)
            })
            .fail(err => console.log(err))
    }

    ShowLoaders()
    //requests for all records in database
    FindUsers("")

})()