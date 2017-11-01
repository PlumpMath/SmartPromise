(function () {
    console.log("______________friends.js______________")

    const TYPE = {
        FRIEND: "F",
        PENDING: "P",
        OTHER: "O"
    }
    
    const FIND_INPUT_ID = '#_find_input'
    
    const OTHERS_LIST_ID = '#_other_users_list'
    const FRIENDS_LIST_ID = '#_friends_list'
    
    const LOADER_ID = "#_loader_id"

    const FRIENDS_LABEL_ID = '#_friends_label_id'
    const OTHERS_LABEL_ID = '#_others_label_id'
    const PENDING_LABEL_ID = '#_pending_label_id'

    const METHOD_FIND_BY_EMAIL = '/FindByEmail/'
    const METHOD_ADD_FRIEND = '/AddFriend/'
    const METHOD_REMOVE_FRIEND = '/RemoveFriend/'
    const CONTROLLER_NAME = '/api/Friends'

    const TITLE_FRIENDS = "Friends"
    const TITLE_OTHERS = "Others"
    const TITLE_Pending = "Pending"
    const TITLE_CLEAR = ""
    
    function StopLoading() {
        $(FRIENDS_LABEL_ID).html(TITLE_FRIENDS)
        $(OTHERS_LABEL_ID).html(TITLE_OTHERS)
        $(PENDING_LABEL_ID).html(TITLE_Pending)
        Loader(LOADER_ID).Hide()
    }

    function StartLoading() {
        $(FRIENDS_LABEL_ID).html(TITLE_CLEAR)
        $(OTHERS_LABEL_ID).html(TITLE_CLEAR)
        $(PENDING_LABEL_ID).html(TITLE_CLEAR)
        Loader(LOADER_ID).Show()
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

    function UserListManager(list_id, type) {
        return ((list_id, type) => {
            const LIST_ID = list_id
            const ITEM_TYPE = type
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
                $.get(CONTROLLER_NAME + METHOD_ADD_FRIEND + param,
                    () => {
                        ClearLists()
                        StartLoading()
                        FindUsers($(FIND_INPUT_ID).val())
                    })
                    .fail(err => console.log(err))
            }

            function RemoveFriend(param) {
                $.get(CONTROLLER_NAME + METHOD_REMOVE_FRIEND + param,
                    () => {
                        ClearLists()
                        StartLoading()
                        FindUsers($(FIND_INPUT_ID).val())
                    })
                    .fail(err => console.log(err))
            }

            function AddFriendHandler(user) {
                $(UserListManager(LIST_ID, ITEM_TYPE).GetIconFriendId(user))
                    .click(() => (ITEM_TYPE === TYPE.FRIEND) ? RemoveFriend(user.id) : AddFriend(user.id))
            }

            function HaveChatWithUser(userId, userEmail) {
                window.location.href = _RAZOR_URL_CABINET_PRIVATE_CHAT
                    .replace('__id__', userId).replace('__email__', userEmail);
            }

            function AddChatHandler(user) {
                $(UserListManager(LIST_ID, ITEM_TYPE).GetIconEnvelopeId(user))
                    .click(() => HaveChatWithUser(user.id, user.email))
            }
            
            //it's unique'
            function GetId(user) {
                return user.id.toString()
            }

            function AddItem(user) {
                //console.log(ITEM_TYPE)
                let friend_option = (ITEM_TYPE === TYPE.FRIEND) ? REMOVE_FRIEND_OPTION : ADD_FRIEND_OPTION
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
                AddFriendHandler(user)
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

                FillList: list => {
                    UserListManager(LIST_ID, ITEM_TYPE).Clear()
                    list.forEach(u => AddItem(u))
                }
            }
        })(list_id, type)
        
    }

    function ConstructFindFunction(friends, others, pending) {
        let friends_copy = [...friends]
        let others_copy = [...others]
        let pending_copy = [...pending]

        return (findString, filtered) => {
            filtered.friends = friends_copy.filter(v => v.email.startsWith(findString))
            filtered.others = others_copy.filter(v => v.email.startsWith(findString))
            filtered.pending = pending_copy.filter(v => v.email.startsWith(findString))
        }
    }

    function ClearLists() {
        UserListManager(OTHERS_LIST_ID, TYPE.OTHER).Clear()
        UserListManager(FRIENDS_LIST_ID, TYPE.FRIEND).Clear()
    }
    
    function FindUsers(param) {
        $.get(CONTROLLER_NAME + METHOD_FIND_BY_EMAIL + param,
            model => {
                let Find = ConstructFindFunction(model.friends, model.others, model.pending)
                StopLoading()

                $(FIND_INPUT_ID).on('input', function () {
                    
                    let filtered = {}
                    
                    Find($(FIND_INPUT_ID).val(), filtered)

                    let others = filtered.others
                    let friends = filtered.friends
                    let pending = filtered.pending

                    UserListManager(OTHERS_LIST_ID, TYPE.OTHER).FillList(others)
                    UserListManager(FRIENDS_LIST_ID, TYPE.FRIEND).FillList(friends)
                })
                
                UserListManager(OTHERS_LIST_ID, TYPE.OTHER).FillList(model.others)
                UserListManager(FRIENDS_LIST_ID, TYPE.FRIEND).FillList(model.friends)
            })
            .fail(err => console.log(err))
    }

    StartLoading()
    //requests for all records in database
    FindUsers("")

})()