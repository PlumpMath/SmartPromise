let ModalMint = function () {
    const MINT_CONTROLLER_ID = "#_mint_controller"
    const MINT_OUTPUT_ID = "#_mint_output"
    const SUMBIT_ID = "#_mint_button"
    const MODAL_ID = "#_mint_modal"
    
    const MODAL_MINT = HELPERS.TransactionStatusManager("#_modal_mint_loader", '#_modal_mint_result',
        SUMBIT_ID, Clear)

    
    function Clear() {
        $(MINT_CONTROLLER_ID).val("")
    }

    const INSUFFICIENT_FUNDS = "Insufficient funds."

    function Check(fund) {
        let GasCost = 1
        if (fund < GasCost) {
            MODAL_MINT.OnError(INSUFFICIENT_FUNDS)
            return false
        }

        if ($(MINT_CONTROLLER_ID).val() == "") {
            MODAL_MINT.OnError("Enter amount of neo you want to exhange")
            return false
        }

        return true
    }

    function UpdateOutput() {
        let v = $(MINT_CONTROLLER_ID).val()
        let text = " You'll get " + (((typeof v == "undefined") || v == "")? 0 : v) + " smart coins "
        if ($(MINT_OUTPUT_ID).html() == text)
            return

        $(MINT_OUTPUT_ID).html(text)
    }

    $(MODAL_ID).on('shown.bs.modal', () => {
        MODAL_MINT.Init()
    })

    $(document).ready(() => {
   
        $(MINT_CONTROLLER_ID).bind('keyup', () => UpdateOutput())

        $(SUMBIT_ID).click(() => HELPERS.InvokeContractByUrl("", MODAL_MINT, Check))
    })
}