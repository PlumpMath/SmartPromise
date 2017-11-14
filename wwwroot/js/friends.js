var Friends = function () {

    const TYPE = {
        FRIEND: 0,
        PENDING: 1,
        OTHER: 2
    }
    
    const FIND_INPUT_ID = '#_find_input'
    const FIND_ID = '#_friend_find_input'
    const OTHERS_LIST_ID = '#_other_users_list'
    const FRIENDS_LIST_ID = '#_friends_list'
    const PENDING_LIST_ID = '#_pending_users_list'
    
    const LOADER_ID = "#_loader_id"

    const FRIENDS_LABEL_ID = '#_friends_label_id'
    const OTHERS_LABEL_ID = '#_others_label_id'
    const PENDING_LABEL_ID = '#_pending_label_id'

    const METHOD_REQUEST_FRIENDSHIP = '/RequestFriendship/'
    const METHOD_REMOVE_FRIEND = '/RemoveFriend/'
    const METHOD_FIND_BY_EMAIL = '/FindByEmail/'
    const CONTROLLER_NAME = '/api/Friends'

    const TITLE_FRIENDS = "Friends"
    const TITLE_OTHERS = "Others"
    const TITLE_PENDING = "Pending"
    const TITLE_CLEAR = ""
    
    function StopLoading() {
        ShowFindInpit()
        Loader(LOADER_ID).Hide()
    }

    function HideFindInput() {
        $(FIND_ID).hide()
    }

    function ShowFindInpit() {
        $(FIND_ID).show()
    }

    function StartLoading() {
        HideFindInput()
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
            const ITEM_PREFIX = 'IP'
            const USER_ACTION_PREFIX = 'UAP'
            const MESSAGE_PREFIX = 'MP'
            const ONLINE_INDICATOR_PREFIX = 'OIP'

            const STYLE_ICON_MINUS = "glyphicon glyphicon-minus"
            const STYLE_ICON_PLUS = "glyphicon glyphicon-plus"
            const STYLE_ICON_ENVELOPE = "glyphicon glyphicon-envelope"

            const STYLE_ICON_ONLINE = "led-online"
            const STYLE_ICON_OFFLINE = "led-offline"

            const REMOVE_FRIEND_OPTION = "Remove friend"
            const ADD_FRIEND_OPTION = "Add friend"
            const REQUEST_FRIEND_OPTION = "Request friend"
            const NO_OPTION = ""


            function RequestFriendship(param) {
                $.get(CONTROLLER_NAME + METHOD_REQUEST_FRIENDSHIP + param,
                    () => {
                        ClearLists()
                        StartLoading()
                        FindUsers($(FIND_INPUT_ID).val())
                    })
                    .fail(err => console.log(err))
            }

            function RejectFriendship(param) {
                $.get(CONTROLLER_NAME + METHOD_REMOVE_FRIEND + param,
                    () => {
                        ClearLists()
                        StartLoading()
                        FindUsers($(FIND_INPUT_ID).val())
                    })
                    .fail(err => console.log(err))
            }

            function AddFriendHandler(user) {
                $(UserListManager(LIST_ID, ITEM_TYPE).GetUserActionId(user))
                    .click(() => {
                        switch (ITEM_TYPE) {
                            case TYPE.FRIEND:
                                RejectFriendship(user.id)
                                break
                            case TYPE.OTHER:
                                RequestFriendship(user.id)
                                break
                            case TYPE.PENDING:
                                //do nothing
                                break
                        }
                    })
            }

            function HaveChatWithUser(userId, userEmail) {
                window.location.href = _RAZOR_URL_CABINET_PRIVATE_CHAT
                    .replace('__id__', userId).replace('__email__', userEmail);
            }

            function AddChatHandler(user) {
                $(UserListManager(LIST_ID, ITEM_TYPE).GetMessageButtonId(user))
                    .click(() => HaveChatWithUser(user.id, user.email))
            }
            
            //it's unique'
            function GetId(user) {
                return user.id.toString()
            }

            function GetActionOption() {
                switch (ITEM_TYPE) {
                    case TYPE.FRIEND:
                        return REMOVE_FRIEND_OPTION
                    case TYPE.OTHER:
                        return ADD_FRIEND_OPTION
                    case TYPE.PENDING:
                    default:                       
                        return NO_OPTION
                }
            }

            function AddItem(user) {
                let style_presense = user.isOnline ? STYLE_ICON_ONLINE : STYLE_ICON_OFFLINE
                let id = GetId(user)
                let element = `
                    <div class="col-12">
                        <div class="well well-sm">
                            <div class="row">
                                <div class="col-sm-6 col-md-4">
                                    <a href="` +  HELPERS.GetUserProfileHref(user.id) + `">
                                        <img width="100" height="100" alt="" src="` +
                                        HELPERS.GetAvatarImageUrl(100, 100, 100, user.id) +
                                    `" class="img-circle img-responsive" />
                                    </a>
                                </div>
                    
                                <div class="col-sm-6 col-md-8 friend-element">
                                    <div id="` + ONLINE_INDICATOR_PREFIX + id + `" class="top-right-corner ` + style_presense +`"></div>
                                    <h4>` + user.email + `</h4>
                                    <div class="btn-group">
                                        <button type="button" class="btn btn-primary">Action</button>
                                        <button type="button" class="btn btn-primary dropdown-toggle" data-toggle="dropdown">
                                            <span class="caret"></span><span class="sr-only">Social</span>
                                        </button>
                                        <ul class="dropdown-menu" role="menu">
                                            <li><a id="` + MESSAGE_PREFIX + id + `">Message</a></li>
                                            <li><a id="` + USER_ACTION_PREFIX + id + `" >` + GetActionOption() + `</a></li>
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
                GetUserActionId: user => '#' + USER_ACTION_PREFIX + GetId(user)
                ,

                GetOnlineIndicatorPrefix: user => '#' + ONLINE_INDICATOR_PREFIX + GetId(user)
                ,

                GetMessageButtonId: user => '#' + MESSAGE_PREFIX + GetId(user)
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
            filtered.friends = friends_copy.filter(v => v.email.toLowerCase().startsWith(findString.toLowerCase()))
            filtered.others = others_copy.filter(v => v.email.toLowerCase().startsWith(findString.toLowerCase()))
            filtered.pending = pending_copy.filter(v => v.email.toLowerCase().startsWith(findString.toLowerCase()))
        }
    }

    function ClearLists() {
        UserListManager(OTHERS_LIST_ID, TYPE.OTHER).Clear()
        UserListManager(FRIENDS_LIST_ID, TYPE.FRIEND).Clear()
        UserListManager(PENDING_LIST_ID, TYPE.PENDING).Clear()
    }

    function UpdateLabels(others, friends, pending) {
        (others && others.length !== 0) ? $(OTHERS_LABEL_ID).html(TITLE_OTHERS + "<br/>") : $(OTHERS_LABEL_ID).html("");
        (friends && friends.length !== 0) ? $(FRIENDS_LABEL_ID).html(TITLE_FRIENDS + "<br/>") : $(FRIENDS_LABEL_ID).html("");
        (pending && pending.length !== 0) ? $(PENDING_LABEL_ID).html(TITLE_PENDING + "<br/>") : $(PENDING_LABEL_ID).html("");
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

                    $(document).ready(() => {
                        UserListManager(OTHERS_LIST_ID, TYPE.OTHER).FillList(others)
                        UserListManager(FRIENDS_LIST_ID, TYPE.FRIEND).FillList(friends)
                        UserListManager(PENDING_LIST_ID, TYPE.PENDING).FillList(pending)
                        UpdateLabels(others, friends, pending)
                    })
                })

                $(document).ready(() => {
                    UserListManager(OTHERS_LIST_ID, TYPE.OTHER).FillList(model.others)
                    UserListManager(FRIENDS_LIST_ID, TYPE.FRIEND).FillList(model.friends)
                    UserListManager(PENDING_LIST_ID, TYPE.PENDING).FillList(model.pending)
                    UpdateLabels(model.others, model.friends, model.pending)
                })
            })
            .fail(err => console.log(err))
    }

    $(document).ready(() => {
        StartLoading()
    })
    
    //requests for all records in database
    FindUsers("")

}