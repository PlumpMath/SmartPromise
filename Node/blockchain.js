import {
    getAccountFromWIFKey, generatePrivateKey,
    getStorage, getTransactionHistory, doSendAsset,
    getWIFFromPrivateKey, getBalance, verifyAddress,
    queryRPC, serializeTransaction, create, signTransaction
} from 'neon-js'


const MAIN_ADDRESS = "AXWWMKZaL7BYxSonrdTfAjpY3wnH1F2g4Z"
const TEST_ADDRESS = "AYRBCHPqusVjP37cU2EUfEUrzW83NFWwqj"
const CONTRACT_HASH = "dd1f90ab7f24f222c3aeb3cda34d273cea9d0959"

const SC_OPERATIONS = {
    ADD: "add"
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

    GetStorage: (callback, net, scriptHash, keyAscii) =>
        getStorage(TEST_NET, CONTRACT_HASH, Converter.ascii_to_hex(keyAscii))
            .then(res => callback(null, Converter.hex_to_ascii(res.result)))
    ,

    VerifyAddress: (callback, addr) => callback(null, verifyAddress(addr))
    ,

    CalculateInvokeGas: (callback, operation, net, key, data, scriptHash) => {
        callback(null, 2)
    }
    ,

    InvokeContractAdd: (callback, net, wif, key, data, gasCost) => {
        const account = getAccountFromWIFKey(wif)
        
        getBalance(net, account.address)
            .then((balances) => {
                const intents = [
                    //{ assetId: ASSETS['NEO'], value: 0, scriptHash: scriptHash }
                ]

                const args = [Converter.ascii_to_hex(key), Converter.ascii_to_hex(data)]
                const invoke = { operation: SC_OPERATIONS.ADD, args, scriptHash: CONTRACT_HASH }
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