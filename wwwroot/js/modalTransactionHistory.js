let ModalTransactionHistory = function () {
    const MODAL_ID = '#_transaction_history_modal'
    const TRANSCATIONS_TABLE_ID = '#_transactions_table_content' 
    const LOADER_ID = "#_modal_tx_loader"

    function Start() {
        Clear()
        HELPERS.Loader(LOADER_ID).Show()
    }

    function End() {
        HELPERS.Loader(LOADER_ID).Hide()
    }

    function Clear() {
        $(TRANSCATIONS_TABLE_ID + " > tr").remove()
    }

    function AppendItem(tx) {
        let item = `
            <tr onclick="document.location = 'https://neoscan-testnet.io/transaction/` + tx.txid + `';">
                <td>` + tx.block_index +`</td>
                <td>` + tx.txid + `</td>
            </tr>
        `
        $(TRANSCATIONS_TABLE_ID).prepend(item)
    }
    
    $(document).ready(() => {
        $(MODAL_ID).on('shown.bs.modal', () => {
            Start()
            $.get(_RAZOR_GET_MY_ADDRESS)
                .success(addr => {
                    $.get(HELPERS.GetTransactionHistoryUrl("testnet", addr))
                        .success(ts => { console.log(ts); ts.forEach(t => AppendItem(t)) })
                    End()
                })
                .error(err => {
                    End()
                    console.log(err)
                })
        })
    })
}