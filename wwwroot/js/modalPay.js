
let ModalPay = function () {
    const TESTNET = 'testnet'
    const MAINNET = 'mainnet'
    const ASSET_NEO = 'gas'
    const ASSET_GAS = 'neo'

    const ASSET_ID = "#_asset_type"
    const NET_ID = '#_net_type'
    const AMOUNT_ID = "#_asset_amount"
    const SEND_ID = "#_send_asset"
    const HINT_ID = '#_modal_pay_hint'
    const STATUS_ID = "#_modal_pay_result"
    const LOADER_ID = "#_modal_pay_loader"
    const ADDRESS_TO_PAY_ID = '#_address_to_pay_label'
    const MODAL_ID = "#_modal_pay"

    const ADDR_TO_PAY = $(ADDRESS_TO_PAY_ID).text()

    const STATUS_ERROR = "Transaction failed: please, try again later."
    const STATUS_SUCCESS = "Transaction complete: your balance will automatically update when the blockchain has processed it."
    const INSUFFICIENT_FUNDS = "Insufficient funds."
    const EMPTY = ""

    let asset = $(ASSET_ID).val()
    let net = $(NET_ID).val()

    let funds = {}

    function IsAmountCorrect(value, fund) {
        return !(parseInt(value) <= 0 || parseInt(value) > parseInt(fund))
    }

    function Init() {
        ClearMessage()
        $(ASSET_ID + ' option[value="someValue"]').text(TESTNET)
        $(NET_ID + ' option[value="someValue"]').text(ASSET_GAS.toUpperCase())
        $(AMOUNT_ID).val(EMPTY)
    }

    function GetBalance(addr, net, asset) {
        return new Promise((resolve, reject) => {
            $.get(HELPERS.GetBlockchainBalanceUrl(net, addr))
                .success(res => {
                    console.log(res)
                    resolve(res[asset])
                })
                .error(err => reject(err))  
                
        })
    }

    function OnSuccess() {
        $(STATUS_ID)
            .addClass('text-success')
            .removeClass('text-danger')
            .html(STATUS_SUCCESS)
    }

    function OnError(err) {
        $(STATUS_ID)
            .addClass('text-danger')
            .removeClass('text-success')
            .html(STATUS_ERROR + " " + err)
    }

    function ClearMessage() {
        $(STATUS_ID).text("")
    }

    function StartProcessing() {
        $(SEND_ID).prop('disabled', true)
        HELPERS.Loader(LOADER_ID).Show()
    }

    function EndProcessing() {
        $(SEND_ID).prop('disabled', false)
        HELPERS.Loader(LOADER_ID).Hide()
    }

    $(document).ready(
        () => {
            $(MODAL_ID).on('shown.bs.modal', () => Init())
            $.get(_RAZOR_GET_MY_ADDRESS, addr => {
                console.log(addr)
                $(ASSET_ID).change(() => asset = $(ASSET_ID).val())
                $(NET_ID).change(() => net = $(NET_ID).val())
                $(SEND_ID).click(() => {
                    ClearMessage()
                    StartProcessing()
                    GetBalance(addr, net, asset).then(fund => {
                        let amount = $(AMOUNT_ID).val()
                        let isCorrect = IsAmountCorrect(amount, fund)

                        if (isCorrect == true) {
                            $.get(HELPERS.GetSendAssetUrl(asset, ADDR_TO_PAY, net, amount))
                                .success(res => {
                                    (res == true) ? OnSuccess() : OnError()
                                    EndProcessing()
                                })
                                .error(err => {
                                    let mes = (err.statusText !== undefined) ? err.statusText : "internal error"
                                    OnError(mes)
                                    EndProcessing()
                                })
                        } else {
                            OnError(INSUFFICIENT_FUNDS)
                            EndProcessing()
                        }
                    }).catch(err => {
                        OnError(err)
                        EndProcessing()
                    })

                })
            })
        }
    )
    

}

