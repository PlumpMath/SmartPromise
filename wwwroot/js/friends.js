(function () {
    console.log("______________friends.js______________")

    const FIND_INPUT_ID = '#_find_input'
    const OTHERS_LIST_ID = '#_other_users_list'
    const FRIENDS_LIST_ID = '#_friends_list'
    const FRIENDS_LOADER_ID = "#_friends_loader_id"
    const OTHERS_LOADER_ID = "#_others_loader_id"
    
    const METHOD_FIND_BY_EMAIL = '/FindByEmail/'
    const METHOD_ADD_FRIEND = '/AddFriend/'
    const METHOD_REMOVE_FRIEND = '/RemoveFriend/'
    const CONTROLLER_NAME_CABINET = '/Cabinet'
    
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
            const STYLE_ICON_ENVELOPE = "glyphicon glyphicon-envelope"
            const STYLE_ICON_ONLINE = "led-online"
            const STYLE_ICON_OFFLINE = "led-offline"
            const REMOVE_FRIEND_OPTION = "Remove friend"
            const ADD_FRIEND_OPTION = "Add friend"


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
                let friend_option = isFriend ? REMOVE_FRIEND_OPTION : ADD_FRIEND_OPTION
                let style_presense = user.isOnline ? STYLE_ICON_ONLINE : STYLE_ICON_OFFLINE
                let id = GetId(user)
                let element = `
                    <div class="col-12">
                        <div class="well well-sm">
                            <div class="row">
                                <div class="col-sm-6 col-md-4">
                                    <img width="100" height="100" alt="" src="` +
                                        _RAZOR_URL_CABINET_GET_AVATAR.replace("__id__", user.id) +
                                    `" class="img-rounded img-responsive" />
                                </div>
                    
                                <div class="col-sm-6 col-md-8 friend-element">
                                    <div id="` + LED_PREFIX + id + `" class="top-right-corner ` + style_presense +`"></div>
                                    <h4>` + user.email + `</h4>
                                    <div class="btn-group">
                                        <button type="button" class="btn btn-primary">Action</button>
                                        <button type="button" class="btn btn-primary dropdown-toggle" data-toggle="dropdown">
                                            <span class="caret"></span><span class="sr-only">Social</span>
                                        </button>
                                        <ul class="dropdown-menu" role="menu">
                                            <li><a id="` + ICON_PREFIX_ENVELOPE + id + `">Message</a></li>
                                            <li><a id="` + ICON_FRIEND_PREFIX + id + `" >` + friend_option + `</a></li>
                                            <li class="divider"></li>
                                            <li><a href="#">Profile</a></li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
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