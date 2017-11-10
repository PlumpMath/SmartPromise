var ProfilePage = function () {
    console.log("______________profilePage.js______________")
    
    const SUMBIT_PROMISE_ID = '#_create_promise_button'
    const MODAL_PROMISE_ID = '#_fill_promise_modal'
    const TITLE_ID = "#_promise_title"
    const CONTENT_ID = "#_promise_content"
    
    var PromisesListManager = (function () {
        const PROMISES_LIST_ID = "#_promises_id"
        const COMPLETED_RATING_ID = "#_completed_rating_id"
        const COMPLETE_PROMISE_MODAL_ID = "#_complete_promise"
        const COMPLETE_PROMISE_BTN_ID = '#_complete_promise_btn'
        const BUTTON_PREFIX = "BP"
        const PROMISE_PREFIX = "PP"

        let promises = 0
        let promises_completed = 0

        function GetPromiseId(key) {
            return '#' + PROMISE_PREFIX + GetKey(key)
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
            console.log(promises_completed + "      " + promises)
            let rate = promises_completed === 0 ? 0 : ((promises_completed / promises) * 5).toFixed(2)
            $(COMPLETED_RATING_ID).html(rate + " <small>/ 5</small>")
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
                $(COMPLETE_PROMISE_BTN_ID).unbind('click').click(() => UpdateAsCompleted(key))
            })
        }

        return {
            AddItem: promise => {
                let promiseKey = PROMISE_PREFIX + GetKey(promises)
                let buttonKey = BUTTON_PREFIX + GetKey(promises)
                let element = `
                        <div id="` + promiseKey + `"class="promise-block">
                            <div class="row">
                            <!--
                            <div class="col-sm-3">
                                <img src="http://dummyimage.com/60x60/666/ffffff&text=No+Image" class="img-rounded">
                                <div class="promise-block-name"><a href="#">nktailor</a></div>
                                <div class="promise-block-date">January 29, 2016<br />1 day ago</div>
                            </div>
                            -->
                            <div class="col-sm-9">
                                <div class="promise-block-rate">` + GetComplicityBlock(promise.complicity) + ` </div>
                                <div class="promise-block-title">` + promise.title + `</div>
                                <div class="promise-block-description">` + promise.content +`</div>                                
                            </div>
                            <div class="col-sm-3">
                                <span class="pull-right">
                                    <button id="` + buttonKey + `" type="button" class="btn btn-success">
                                        <span class="glyphicon glyphicon-ok"></span>
                                    </button>
                                </span>
                            </div>
                        </div>
                    </div>`
                
                var key = GetKey(promises)
                console.log(key)
                $(PROMISES_LIST_ID).append(element)
                AddButtonHandler(key)
                ++promises
                UpdateStatistics()
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
            }
        }

    })()

    function GetPromise() {
        return {
            title: $(TITLE_ID).val(),
            content: $(CONTENT_ID).val(),
            complicity: ComplicityManager.GetComplicity()
        }
    }

    $(document).ready( () => {
        ComplicityManager.AddHandlers()
        $(SUMBIT_PROMISE_ID).click(() => {
            let promise = GetPromise()
            PromisesListManager.AddItem(promise)
            $(MODAL_PROMISE_ID).modal("toggle")
        })
    })
}