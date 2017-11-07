import {
    signTransaction, create, getBalance, ASSETS,
    getAccountFromWIFKey, getScriptHashFromPublicKey,
    queryRPC, serializeTransaction,
    getStorage, doInvokeScript
} from 'neon-js'


const MAIN_ADDRESS = "AXWWMKZaL7BYxSonrdTfAjpY3wnH1F2g4Z"
const TEST_ADDRESS = "AYRBCHPqusVjP37cU2EUfEUrzW83NFWwqj"
const CONTRACT_HASH = "b0cda325106823831a2a0c04504de833c3862500"

const MAIN_NET = "MainNet"
const TEST_NET = "TestNet"

module.exports = function GetBalance(callback, net, addr) {
    getBalance(net, addr).then(
        function (balances) {
            callback(null, parseInt(balances.NEO.balance))
        }
    )
}