var Friends = function () {

    const TYPE = {
        FRIEND: 0,
        PENDING: 1,
        OTHER: 2
    }
    
    const FIND_INPUT_ID = '#_find_input'
    const CONTENT_ID = '#_friends_content'
    const OTHERS_LIST_ID = '#_other_users_list'
    const FRIENDS_LIST_ID = '#_friends_list'
    const PENDING_LIST_ID = '#_pending_users_list'
    
    const LOADER_ID = "#_friends_loader"
    
    const METHOD_REQUEST_FRIENDSHIP = '/RequestFriendship/'
    const METHOD_REMOVE_FRIEND = '/RemoveFriend/'
    const METHOD_FIND_BY_EMAIL = '/FindByEmail/'
    const CONTROLLER_NAME = '/api/Friends'

    const TITLE_FRIENDS = "Friends"
    const TITLE_OTHERS = "Others"
    const TITLE_PENDING = "Pending"
    const TITLE_CLEAR = ""


    const FRIENDS = `
        <div>
            <h5 class="text-muted">Friends</h5>
            <div class="list-group container-fluid" id="` + FRIENDS_LIST_ID.slice(1) + `"></div>
        </div>
    `
    const OTHERS = `
        <div>
            <h5 class="text-muted">Others</h5>
            <div id="` + OTHERS_LIST_ID.slice(1) + `" class="list-group container-fluid"></div>
        </div>
    `
    const PENDING = `
        <div>
            <h5 class="text-muted">Pending</h5>
            <div id="` + PENDING_LIST_ID.slice(1) +`" class="list-group container-fluid"></div>
        </div>
    `

    const SEARCH = `
        <input id="` + FIND_INPUT_ID.slice(1) + `" class="form-control input-style" placeholder="Type email to find a person"/>
    `

    const HAVE_NO_RECORDS = `<div align="center"><h5 class="text-muted">Search result is empty</h5></div>`


    function StopLoading() {
        Loader(LOADER_ID).Hide()
    }
    
    function StartLoading() {
        $(FIND_INPUT_ID).remove()
        Clear()
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

    function LoadAllUsers() {
        StartLoading()
        FindUsers("")
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
                    () => LoadAllUsers())
                    .fail(err => console.log(err))
            }

            function RejectFriendship(param) {
                $.get(CONTROLLER_NAME + METHOD_REMOVE_FRIEND + param,
                    () => LoadAllUsers())
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
                                <div class="col-sm-4 col-md-4">
                                    <a href="` +  HELPERS.GetUserProfileHref(user.id) + `">
                                        <img width="100" height="100" alt="" src="` +
                                        HELPERS.GetAvatarImageUrl(100, 100, 100, user.id) +
                                    `" class="img-circle img-responsive" />
                                    </a>
                                </div>
                    
                                <div class="col-sm-8 col-md-8 friend-element">
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
                                            <li><a href="` + HELPERS.GetUserProfileHref(user.id) + `">Profile</a></li>
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

    function Clear() {
        $(CONTENT_ID).html("")
    }

    function IsEmpty(ls) {
        return !ls|| ls.length === 0
    }
    
    function Prepare(others, friends, pending) {
        Clear()

        if (IsEmpty(others) && IsEmpty(friends) && IsEmpty(pending)) {
            $(CONTENT_ID).append(HAVE_NO_RECORDS)
        }
        
        if (!IsEmpty(friends)) {
            $(CONTENT_ID).append(FRIENDS)
        }

        if (!IsEmpty(others)) {
            $(CONTENT_ID).append(OTHERS)
        }
        
        if (!IsEmpty(pending)) {
            $(CONTENT_ID).append(PENDING)
        }
    }
    
    function FindUsers(param) {
        $.get(CONTROLLER_NAME + METHOD_FIND_BY_EMAIL + param,
            model => {
                
                let Find = ConstructFindFunction(model.friends, model.others, model.pending)
                StopLoading()
                $(SEARCH).insertBefore(CONTENT_ID)

                $(FIND_INPUT_ID).on('input', function () {
                    
                    let filtered = {}
                    
                    Find($(FIND_INPUT_ID).val(), filtered)

                    let others = filtered.others
                    let friends = filtered.friends
                    let pending = filtered.pending

                    $(document).ready(() => {
                        Prepare(others, friends, pending)
                        UserListManager(OTHERS_LIST_ID, TYPE.OTHER).FillList(others)
                        UserListManager(FRIENDS_LIST_ID, TYPE.FRIEND).FillList(friends)
                        UserListManager(PENDING_LIST_ID, TYPE.PENDING).FillList(pending)
                    })
                })

                $(document).ready(() => {
                    Prepare(model.others, model.friends, model.pending)
                    UserListManager(OTHERS_LIST_ID, TYPE.OTHER).FillList(model.others)
                    UserListManager(FRIENDS_LIST_ID, TYPE.FRIEND).FillList(model.friends)
                    UserListManager(PENDING_LIST_ID, TYPE.PENDING).FillList(model.pending)
                })
            })
            .fail(err => console.log(err))
    }

    $(document).ready(() => {
        StartLoading()
    })
    
    //requests for all records in database
    LoadAllUsers()

}