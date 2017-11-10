
let ModalPay = function () {
    const TESTNET = 'TestNet'
    const MAINNET = 'MainNet'
    const ASSET_NEO = 'gas'
    const ASSET_GAS = 'neo'

    

    let asset_type = $('#_asset_type').val().toLowerCase()
    let net_type = $('#_net_type').val()
    
    let funds = {}
    
    function check(value) {
        console.log(parseInt(value) > parseInt(funds[net_type][asset_type]))
        if (parseInt(value) <= 0 || parseInt(value) > parseInt(funds[net_type][asset_type])) {
            showError()
            return false
        }
        return true
    }

    function showOk() {
        $('#_modal_pay_hint')
            .removeClass('text-danger')
            .addClass('text-success')
            .html('success')
    }

    function showError() {
        $('#_modal_pay_hint')
            .removeClass('text-success')
            .addClass('text-danger')
            .html('insufficient funds')
    }

    function clear() {
        $('#_modal_pay_hint').html('')
        $('#_asset_type option[value="someValue"]').text(TESTNET)
        $('#_net_type option[value="someValue"]').text('GAS')
        $('#_asset_amount').val('')
    }
    function GetBalance(addr) {
        return new Promise((resolve, reject) => {
            $.get(HELPERS.GetBlockchainBalanceUrl(TESTNET, addr),
                res => {
                    console.log(res)
                    funds[TESTNET] = res
                    $.get(HELPERS.GetBlockchainBalanceUrl(MAINNET, addr),
                        res => { console.log(res); funds[MAINNET] = res; resolve() })
                })
        })
    }
    
    $.get(_RAZOR_GET_MY_ADDRESS, addr => {
        
        $('#_asset_type').change(() => asset_type = $('#_asset_type').val())
        $('#_net_type').change(() => net_type = $('#_net_type').val())
        $('#_send_asset').click(() => {
            
            HELPERS.Loader('#_modal_pay_loader').Show()
            try {
                GetBalance(addr).then(() => {
                    let amount = $('#_asset_amount').val()
                    console.log(amount)
                    let res = check(amount)
                    
                    $.get(HELPERS.GetSendAssetUrl(1, addr, 0, amount))
                        .success(res => {
                            if (res == true) {
                                $('#_modal_pay_result')
                                    .addClass('text-success')
                                    .removeClass('text-danger')
                                    .html("Success! Wait till transaction get confirmed")
                            } else {
                                $('#_modal_pay_result')
                                    .addClass('text-danger')
                                    .removeClass('text-success')
                                    .html("Error! Something went wrong")
                            }
                            HELPERS.Loader('#_modal_pay_loader').Hide()
                        })
                        .error(() => {
                            $('#_modal_pay_result')
                                .addClass('text-danger')
                                .removeClass('text-success')
                                .html("Error! Something went wrong")
                            HELPERS.Loader('#_modal_pay_loader').Hide()
                        })

                })
            }
            catch (ex) {
                $('#_modal_pay_result')
                    .addClass('text-danger')
                    .removeClass('text-success')
                    .html("Error! Something went wrong")
                HELPERS.Loader('#_modal_pay_loader').Hide()
            }
            
        })
    })
    
}

