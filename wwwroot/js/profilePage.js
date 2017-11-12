let TransactionStatusManager = (loader_id, status_id, submit_btn_id,
    after_processing) => ((lid, sid, bid, ap) => {

        const LOADER_ID = lid
        const STATUS_ID = sid
        const SUBMIT_ID = bid
        const FUNC_AFTER = ap

        const STATUS_ERROR = "Transaction failed: please, try again later. "
        const STATUS_SUCCESS = "Transaction complete: your balance will automatically update when the blockchain has processed it. "
        const BE_AWARE = "Beware! This transaction would cost you 1 gas! "
        const INSUFFICIENT_FUNDS = "Insufficient funds."
        const EMPTY = ""

        function OnError(err) {
            $(STATUS_ID).removeClass().addClass("text-danger").html(STATUS_ERROR + err)
        }

        function OnSuccess() {
            $(STATUS_ID).removeClass().addClass("text-success").html(STATUS_SUCCESS)
        }

        function StartProcessing() {
            ClearStatus()
            $(SUBMIT_ID).prop('disabled', true)
            console.log(LOADER_ID)
            HELPERS.Loader(LOADER_ID).Show()
        }

        function ClearStatus() {
            $(STATUS_ID).html(EMPTY)
        }

        function EndProcessing() {
            $(SUBMIT_ID).prop('disabled', false)
            HELPERS.Loader(LOADER_ID).Hide()
            FUNC_AFTER()
        }

        function Init(ls_id) {
            $(STATUS_ID).removeClass().addClass("text-warning").html(BE_AWARE)
            FUNC_AFTER()
        }

        return {
            Init,
            StartProcessing,
            EndProcessing,
            OnSuccess,
            OnError,
        }

    })(loader_id, status_id, submit_btn_id, after_processing)


var ProfilePage = function () {
    console.log("______________profilePage.js______________")
    
    const SUMBIT_PROMISE_ID = '#_create_promise_button'
    const MODAL_PROMISE_ID = '#_fill_promise_modal'
    const TITLE_ID = "#_promise_title"
    const CONTENT_ID = "#_promise_content"
    const LOADER_ID = '#_promises_loader'
    const EMPTY = ""

    const PROMISE_STATUS = {
        ERROR: -1,
        COMPLTED: 1,
        NOT_COMPLETED: 0
    }
    
    const MODAL_FILL_PROMISE = TransactionStatusManager("#_modal_create_promise_loader", '#_modal_create_promise_result',
        '#_create_promise_button', EmptyFillPromiseForm)
    
    function EmptyFillPromiseForm() {
        $(TITLE_ID).val(EMPTY)
        $(CONTENT_ID).val(EMPTY)
        ComplicityManager.Clear()
    }

    function Check(fund) {
        let GasCost = 1
        if (fund <= GasCost) {
            MODAL_FILL_PROMISE.OnError(INSUFFICIENT_FUNDS)
            return false
        }

        if ($(TITLE_ID).val() === "") {
            MODAL_FILL_PROMISE.OnError("Please, fill the title.")
            return false
        }

        if ($(CONTENT_ID).val() === "") {
            MODAL_FILL_PROMISE.OnError("Please, fill the content.")
            return false
        }

        return true
    }
    
    var PromisesListManager = (function () {
        const PROMISES_LIST_ID = "#_promises_id"
        const COMPLETED_RATING_ID = "#_completed_rating_id"
        const COMPLETE_PROMISE_MODAL_ID = "#_complete_promise"
        const COMPLETE_PROMISE_BTN_ID = '#_complete_promise_btn'
        const BUTTON_PREFIX = "BP"

        let promises = 0
        let promises_completed = 0

        function GetPromiseId(key) {
            return '#' + GetKey(key)
        }

        function GetCompleteButtonId(key) {
            return '#' + BUTTON_PREFIX + GetKey(key)
        }

        function GetKey(index) {
            return index.toString()
        }
        
        function GetComplicityBlock(complicity) {
            const bright_start = `
                <button type="button" class="btn btn-warning btn-xs" aria-label="Left Align">
                    <span class="glyphicon glyphicon-star" aria-hidden="true"></span>
                </button>
            `

            const grey_start = `
                <button type="button" class="btn btn-default btn-grey btn-xs" aria-label="Left Align">
                    <span class="glyphicon glyphicon-star" aria-hidden="true"></span>
                </button>
            `
            let res = ""
            for (let i = ComplicityManager.MIN_COMPLICITY; i <= ComplicityManager.MAX_COMPLICITY; ++i) {
                res += (i <= complicity)? bright_start : grey_start
            }
            return res
        }

        function UpdateStatistics() {
            //let rate = promises_completed === 0 ? 0 : ((promises_completed / promises) * 5).toFixed(2)
            $(COMPLETED_RATING_ID).html(promises_completed + " <small>/" + promises + "</small>")
        }

        function UpdateAsCompleted(key) {
            $(GetPromiseId(key)).addClass("promise-block-completed")
            $(GetCompleteButtonId(key)).hide()
            ++promises_completed
            UpdateStatistics()
        }

        function AddButtonHandler(key) {
            $(GetCompleteButtonId(key)).click(() => {
                $(COMPLETE_PROMISE_MODAL_ID).modal("toggle")
                $(COMPLETE_PROMISE_BTN_ID).unbind('click').click(() => {
                    $.post(HELPERS.GetCompletePromiseUrl(key)).then(() => {
                        let comment = `
                            <div class="promise-block promise-block-comment">
                                <div class="row">
                                    <div class="col-sm-9">
                                        <div class="promise-block-title">` + "Promise completed!" + `</div>
                                        <div class="promise-block-description">` + "Proof : " + "I made this" + `</div>                                
                                    </div>
                                    <div class="col-sm-3"></div>
                                </div>
                            </div>
                        `
                        $(comment).insertAfter(GetPromiseId(key))
                        UpdateAsCompleted(key)
                    })
                })
            })
        }
        
        function GetPromiseStyle(promise) {
            switch (promise.status) {
                case PROMISE_STATUS.COMPLTED:
                    return "promise-block promise-block-completed"
                case PROMISE_STATUS.ERROR:
                    return "promise-block promise-block-error"
                case PROMISE_STATUS.NOT_COMPLETED:
                default:
                    return "promise-block"
            }
        }

        return {
            AddItem: promise => {
                let promiseKey = GetKey(promise.id)
                let buttonKey = BUTTON_PREFIX + GetKey(promise.id)
                console.log(promise.id)
                let promiseStyle = GetPromiseStyle(promise)
                let completeButton = (promise.status === PROMISE_STATUS.COMPLTED || promise.status === PROMISE_STATUS.ERROR) ?
                    "" : `
                    <span class="pull-right">
                        <button id="` + buttonKey + `" type="button" class="btn btn-success">
                            <span class="glyphicon glyphicon-ok"></span>
                        </button>
                    </span>
                ` 
                
                let complicityBlock = (promise.status == PROMISE_STATUS.ERROR) ?
                    "" : `<div class="promise-block-rate">` + GetComplicityBlock(promise.complicity) + ` </div>`
                let element = `
                        <div id="` + promiseKey + `"class="` + promiseStyle + `">
                            <div class="row">
                            <!--
                            <div class="col-sm-3">
                                <img src="http://dummyimage.com/60x60/666/ffffff&text=No+Image" class="img-rounded">
                                <div class="promise-block-name"><a href="#">nktailor</a></div>
                                <div class="promise-block-date">January 29, 2016<br />1 day ago</div>
                            </div>
                            -->
                            <div class="col-sm-9">` + complicityBlock + `
                                <div class="promise-block-title">` + promise.title + `</div>
                                <div class="promise-block-description">` + promise.content +`</div>                                
                            </div>
                            <div class="col-sm-3">` + completeButton + `</div>
                        </div>
                    </div>`

                $(PROMISES_LIST_ID).prepend(element)
                AddButtonHandler(promiseKey)
                if (promise.isCompleted)
                    ++promises_completed
                ++promises
                UpdateStatistics()
            }

            ,
            Clear: () => {
                promises_completed = 0
                promises = 0
                $(PROMISES_LIST_ID + "> div").remove()
            }
            
        }
    })()

    var ComplicityManager = (function () {
        const COMPLICITY_CONTROL_ID = '#_complicity_control_id'
        const MAX_COMPLICITY = 5
        const MIN_COMPLICITY = 1
        
        function GetComplicityButtonId(complicity) {
            return "#_complicity_" + complicity + "_id"
        }
        
        function ChangeComplicity(complicity) {
            for (let i = MIN_COMPLICITY; i <= MAX_COMPLICITY; ++i) {
                let id = GetComplicityButtonId(i)
                $(id).removeClass(i <= complicity ? "btn-default btn-grey" : "btn-warning")
                $(id).addClass(i <= complicity ? "btn-warning" : "btn-default btn-grey")
            }
        }
        
        return {
            MIN_COMPLICITY,
            MAX_COMPLICITY,
            AddHandlers: () => {
                for (let i = MIN_COMPLICITY; i <= MAX_COMPLICITY; ++i)
                    $(GetComplicityButtonId(i)).click(() => ChangeComplicity(i))
            },
            GetComplicity: () => {
                let complicity = 0
                $(COMPLICITY_CONTROL_ID + ' > button').each(
                    function () {
                        if ($(this).hasClass("btn-warning"))
                            ++complicity
                    })
                return complicity
            },
            Clear: () =>
                ChangeComplicity(MIN_COMPLICITY)

        }

    })()

    function GetPromise() {
        return {
            title: $(TITLE_ID).val(),
            content: $(CONTENT_ID).val(),
            complicity: ComplicityManager.GetComplicity(),
            date: Date.now()
        }
    }

    function Update() {
        PromisesListManager.Clear()
        HELPERS.Loader(LOADER_ID).Show()
        $.get(_RAZOR_GET_PROMISES.replace("__address__", _RAZOR_PROFILE_VIEW_USER_ADDRESS))
            .success(ps => {
                HELPERS.Loader(LOADER_ID).Hide()
                ps.forEach(p => PromisesListManager.AddItem(p))
            })

    }
    
    $(document).ready(() => {
        ComplicityManager.AddHandlers()

        $(MODAL_PROMISE_ID).on('shown.bs.modal', () => {
            MODAL_FILL_PROMISE.Init()
        })

        Update()
        $(SUMBIT_PROMISE_ID).click(() => {
            let promise = GetPromise()
            MODAL_FILL_PROMISE.StartProcessing()

            $.get(_RAZOR_GET_MY_ADDRESS)
                .success(addr => {
                    HELPERS.GetBalance(addr, "TestNet", "gas")
                        .then(fund => {
                            if (Check(fund) === true) {
                                $.post(HELPERS.GetAddPromiseUrl(promise))
                                    .success(res => {
                                        (res == true) ?
                                            MODAL_FILL_PROMISE.OnSuccess() :
                                            MODAL_FILL_PROMISE.OnError("Probably you should wait till previous transaction get processed.")
                                        MODAL_FILL_PROMISE.EndProcessing()
                                    })
                                    .error(err => {
                                        let mes = (typeof err.statusText !== 'undefined') ? err.statusText : "Internal error."
                                        MODAL_FILL_PROMISE.OnError(mes)
                                        MODAL_FILL_PROMISE.EndProcessing()
                                    })
                            } else {
                                MODAL_FILL_PROMISE.EndProcessing()
                            }
                        })
                        .catch(err => {
                            MODAL_FILL_PROMISE.OnError(err)
                            MODAL_FILL_PROMISE.EndProcessing()
                        })
                    })  
                })
                .error(err => {
                    MODAL_FILL_PROMISE.OnError(err)
                    MODAL_FILL_PROMISE.EndProcessing()
                })
            
            //PromisesListManager.AddItem(promise)
            


            //$(MODAL_PROMISE_ID).modal("toggle")
        })

}