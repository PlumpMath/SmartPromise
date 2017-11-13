import {
    getAccountFromWIFKey, generatePrivateKey,
    getStorage, getTransactionHistory, doSendAsset,
    getWIFFromPrivateKey, getBalance, verifyAddress,
    queryRPC, serializeTransaction, create, signTransaction
} from 'neon-js'

const SC_OPERATIONS = {
    ADD: "add",
    REPLACE: "replace"
}

const MAIN_NET = "MainNet"
const TEST_NET = "TestNet"

let Converter = (function () {
    return {
        hex_to_ascii: str1 => {
            var hex = str1.toString();
            var str = '';
            for (var n = 0; n < hex.length; n += 2) {
                str += String.fromCharCode(parseInt(hex.substr(n, 2), 16));
            }
            return str;
        },

        ascii_to_hex: str => {
            var arr1 = [];
            for (var n = 0, l = str.length; n < l; n++) {
                var hex = Number(str.charCodeAt(n)).toString(16);
                arr1.push(hex);
            }
            return arr1.join('');
        }
    }
})()

function InvokeContractFactory(operation) {
    return function (callback, net, wif, scriptHash, gasCost, ...args) {
        const account = getAccountFromWIFKey(wif)

        getBalance(net, account.address)
            .then((balances) => {
                const intents = []
                
                const invoke = { operation, args, scriptHash }
                const unsignedTx = create.invocation(account.publicKeyEncoded, balances, intents, invoke, gasCost, { version: 1 })
                const signedTx = signTransaction(unsignedTx, account.privateKey)

                const hexTx = serializeTransaction(signedTx)
                queryRPC(net, 'sendrawtransaction', [hexTx])
                    .then(res => callback(null, res.result))
                    .catch(err => callback(null, err))
            })
            .catch(err => callback(null, err))
    }
} 

module.exports = {
    GetBalance: (callback, net, addr) =>
        getBalance(net, addr).then(
            balances => callback(null, { NEO: balances.NEO.balance, GAS: balances.GAS.balance }))
    ,

    GetTransactionHistory: (callback, net, addr) =>
        getTransactionHistory(net, addr).then(history => callback(null, history))
    ,
    
    SendAsset: (callback, net, wif, assetName, addr, amount) => {
        let sendAsset = {}
        sendAsset[assetName] = amount

        doSendAsset(net, addr, wif, sendAsset)
            .then(response => {
                let res = (response.result === undefined || response.result === false) ?
                    false : true

                callback(null, res)
            })
            .catch(err => callback(null, err))
    }
    ,

    GenerateAccount: (callback) => {
        let newPrivateKey = generatePrivateKey()
        let newWif = getWIFFromPrivateKey(newPrivateKey)
        let account = getAccountFromWIFKey(newWif)
        callback(null, { address: account.address, privateKey: account.privateKey, wif: newWif })
    }
    ,

    GetStorage: (callback, net, scriptHash, key) => {
        getStorage(net, scriptHash, key)
            .then(res => callback(null, res.result))
            .catch(err => callback(null, err))
    }
    ,

    VerifyAddress: (callback, addr) => {
        callback(null, verifyAddress(addr))
    }
    ,

    CalculateInvokeGas: (callback, operation, net, key, data, scriptHash) => {
        callback(null, 2)
    }
    ,

    InvokeContractAdd: InvokeContractFactory(SC_OPERATIONS.ADD)
    ,

    InvokeContractReplace: InvokeContractFactory(SC_OPERATIONS.REPLACE)
    
}    