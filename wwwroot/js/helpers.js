
var HELPERS = (function () {
    let TransactionStatusManager = (loader_id, status_id, submit_btn_id,
        after_processing) => ((lid, sid, bid, ap) => {

            const LOADER_ID = lid
            const STATUS_ID = sid
            const SUBMIT_ID = bid
            const FUNC_AFTER = ap

            const STATUS_ERROR = "Transaction failed: please, try again later. "
            const STATUS_SUCCESS = "Transaction complete: your balance will automatically update when the blockchain has processed it. "
            const BE_AWARE = "Beware! This transaction would cost you 1 gas! "
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

            function Init() {
                $(STATUS_ID).removeClass().addClass("text-warning").html(BE_AWARE)
                FUNC_AFTER()
                $(SUBMIT_ID).prop('disabled', false)
            }

            return {
                Init,
                StartProcessing,
                EndProcessing,
                OnSuccess,
                OnError,
            }

        })(loader_id, status_id, submit_btn_id, after_processing)

    function InvokeContractByUrl(url, ProcessManager, Check) {
        ProcessManager.StartProcessing()

        $.get(_RAZOR_GET_MY_ADDRESS)
            .success(addr => {
                HELPERS.GetBalance(addr, "TestNet", "gas")
                    .then(fund => {
                        if (Check(fund) === true) {
                            $.post(url)
                                .success(res => {
                                    (res == true) ?
                                        ProcessManager.OnSuccess() :
                                        ProcessManager.OnError("Probably you should wait till previous transaction get processed.")
                                    ProcessManager.EndProcessing()
                                })
                                .error(err => {
                                    let mes = (typeof err.statusText !== 'undefined') ? err.statusText : "Internal error."
                                    ProcessManager.OnError(mes)
                                    ProcessManager.EndProcessing()
                                })
                        } else {
                            ProcessManager.EndProcessing()
                        }
                    })
                    .catch(err => {
                        ProcessManager.OnError(err)
                        ProcessManager.EndProcessing()
                    })
            })
            .error(err => {
                ProcessManager.OnError(err)
                ProcessManager.EndProcessing()
            })
    }


    const NET = {
        "testnet": 0,
        "mainnet": 1
    }

    const ASSETS = {
        "neo": 0,
        "gas": 1,
        "sc" : 2
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
    
    return {
        GetAvatarImageUrl: (width, height, quality, userId) =>
            _RAZOR_URL_CABINET_GET_AVATAR
                .replace("__width__", width.toString())
                .replace("__height__", height.toString())
                .replace("__quality__", quality.toString())
                .replace("__id__", userId.toString())
        ,

        GetUserProfileHref: userId =>
            _RAZOR_PROFILE_LINK.replace("__id__", userId)
        ,
        GetBlockchainBalanceUrl: (net, addr) =>
            _RAZOR_BLOCKCHAIN_GET_BALANCE
                .replace("__network__", NET[net])
                .replace("__addr__", addr)

        ,
        GetSendAssetUrl: (asset, addr, net, amount) => 
            _RAZOR_SEND_ASSET
                .replace("__assetName__", ASSETS[asset])
                .replace("__network__", NET[net])
                .replace("__addr__", addr)
                .replace("__amount__", amount)
        ,
        GetTransactionHistoryUrl: (net, addr) =>
            _RAZOR_GET_TRANSACTION_HISTORY
                .replace("__network__", NET[net])
                .replace("__addr__", addr)
        ,
        GetAddPromiseUrl: (promise) =>
            _RAZOR_ADD_PROMISE
                .replace("__title__", promise.title)
                .replace("__content__", promise.content)
                .replace("__complicity__", promise.complicity)
                .replace("__date__", promise.date)
        ,
        GetCompletePromiseUrl: (id, proof) => 
            _RAZOR_COMPLETE_PROMISE
                .replace("__id__", id)
                .replace("__proof__", proof)
        ,
        GetBalance: (addr, net, asset) => {
            return new Promise((resolve, reject) => {
                $.get(HELPERS.GetBlockchainBalanceUrl(net, addr))
                    .success(res => {
                        resolve(res[asset])
                    })
                    .error(err => reject(err))

            })
        },
        Loader
        ,
        NET
        ,
        ASSETS
        ,
        TransactionStatusManager
        ,
        InvokeContractByUrl
    }
    
})()