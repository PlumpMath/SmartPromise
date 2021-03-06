﻿
let ModalPay = function () {
    const TESTNET = 'testnet'
    const MAINNET = 'mainnet'
    const ASSET_NEO = 'neo'
    const ASSET_GAS = 'gas'

    const ASSET_ID = "#_asset_type"
    const NET_ID = '#_net_type'
    const AMOUNT_ID = "#_asset_amount"
    const SEND_ID = "#_send_asset"
    const HINT_ID = '#_modal_pay_hint'
    const STATUS_ID = "#_modal_pay_result"
    const LOADER_ID = "#_modal_pay_loader"
    const ADDRESS_TO_PAY_ID = '#_address_to_pay_label'
    const MODAL_ID = "#_modal_pay"
    const BE_AWARE = "Beware! This transaction would cost you 1 gas! "

    const ADDR_TO_PAY = $(ADDRESS_TO_PAY_ID).text()

    const STATUS_ERROR = "Transaction failed: please, try again later. "
    const STATUS_SUCCESS = "Transaction complete: your balance will automatically update when the blockchain has processed it. "
    const INSUFFICIENT_FUNDS = "Insufficient funds. "
    const EMPTY = ""

    let asset = ""
    let net = ""

    let funds = {}

    function IsAmountCorrect(value, fund) {
        return !(parseInt(value) <= 0 || parseInt(value) > parseInt(fund))
    }
    
    function Init() {
        $(NET_ID + ' option[value="testnet"]').attr('selected', 'selected')
        $(ASSET_ID).val("gas")
        $(AMOUNT_ID).val(EMPTY)
        asset = ASSET_GAS
        net = TESTNET
    }

    function OnSuccess() {
        $(STATUS_ID)
            .removeClass()
            .addClass('text-success')
            .html(STATUS_SUCCESS)
    }

    function OnError(err) {
        $(STATUS_ID)
            .removeClass()
            .addClass('text-danger')
            .html(STATUS_ERROR + " " + err)
    }

    function OnWarning() {
        $(STATUS_ID).removeClass().addClass("text-warning").text(BE_AWARE)
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
        Init()
    }

    $(document).ready(
        () => {
            $(MODAL_ID).on('shown.bs.modal', () => {
                ClearMessage()
                Init()
            })
            $.get(_RAZOR_GET_MY_ADDRESS, addr => {
                $(ASSET_ID).change(() => {
                    asset = $(ASSET_ID).val()
                    if (asset == "sc") {
                        OnWarning()
                    } else {
                        $(STATUS_ID).html("")
                    }
                })
                $(NET_ID).change(() => net = $(NET_ID).val())
                $(SEND_ID).click(() => {

                    let token
                    if (asset.toLowerCase() == "sc") {
                        token = parseInt($("#_token_balance").html())
                    }

                    ClearMessage()
                    StartProcessing()
                    HELPERS.GetBalance(addr, net, asset).then(fund => {
                        if (asset.toLowerCase() == "sc") 
                            fund = token

                        let amount = $(AMOUNT_ID).val()
                        let isCorrect = IsAmountCorrect(amount, fund)

                        if (isCorrect == true) {
                            $.get(HELPERS.GetSendAssetUrl(asset, ADDR_TO_PAY, net, amount))
                                .success(res => {
                                    (res == true) ? OnSuccess() : OnError("Probably you should wait till previous transaction get processed.")
                                    EndProcessing()
                                })
                                .error(err => {
                                    let mes = (typeof err.statusText !== 'undefined') ? err.statusText : "Internal error."
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

