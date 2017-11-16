using Microsoft.AspNetCore.NodeServices;
using Promises.Abstract;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Promises.Models;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc;

namespace Promises.Concrete
{
    public class NeoBlockchain : IBlockchain
    {

        private readonly string CONTRACT_HASH = "2fc57e9f92119c6b883fe0851b8a6525cc3895cb";
        private readonly INodeServices _nodeServices;
        private readonly IHostingEnvironment _hostingEnvironment;

        public NeoBlockchain(
            INodeServices nodeServices,
            IHostingEnvironment hoistingEnviroment)
        {
            _nodeServices = nodeServices;
            _hostingEnvironment = hoistingEnviroment;
        }

        private string GetScriptLocation() => "./Node/out/bundle.js"; 
        
        public async Task<Account> GenerateAccount()
        {
            return await _nodeServices.InvokeExportAsync<Account>(GetScriptLocation(), "GenerateAccount");
        }

        public async Task<Balance> GetBalance(NETWORK_TYPE type, string addr)
        {
            return await _nodeServices.InvokeExportAsync<Balance>(GetScriptLocation(), "GetBalance", GetNetwork(type), addr);
        }

        public async Task<string> GetStorage(NETWORK_TYPE type, string key)
        {
            try
            {
                var res = await _nodeServices
                    .InvokeExportAsync<string>(GetScriptLocation(), "GetStorage", GetNetwork(type), CONTRACT_HASH, key);
                return res;
            }
            catch (Exception err) {
                return null;
            }
            
        }

        public async Task<IEnumerable<TransactionHistoryItem>> GetTransactionHistory(
            NETWORK_TYPE type, string addr)
        {
            return await _nodeServices.InvokeExportAsync<
                IEnumerable<TransactionHistoryItem>>(GetScriptLocation(), "GetTransactionHistory", GetNetwork(type), addr);
        }

        public async Task<bool> SendAsset(NETWORK_TYPE type, string wif, ASSET_NAME assetName, string addr, int amount)
        {
            var asset = (assetName == ASSET_NAME.NEO) ? "NEO" : "GAS";
            var res = await _nodeServices.InvokeExportAsync<bool>(GetScriptLocation(), 
                "SendAsset", GetNetwork(type), wif, asset, addr, amount);
            return res;
        }

        public async Task<bool> VerifyAddress(string addr)
        {
            return await _nodeServices.InvokeExportAsync<bool>(GetScriptLocation(), "VerifyAddress", addr);
        }

        private string GetNetwork(NETWORK_TYPE type)
        {
            return (type == NETWORK_TYPE.MAINNET) ? "MainNet" : "TestNet";
        }

        public async Task<bool> InvokeContractAdd(NETWORK_TYPE net, string wif,
            string key, string data, int gasCost)
        {
            var res = await _nodeServices.InvokeExportAsync<bool>(
                GetScriptLocation(), "InvokeContractAdd", GetNetwork(net), wif, CONTRACT_HASH, gasCost, key, data);
            return res;
        }

        public async Task<bool> InvokeContractReplace(NETWORK_TYPE net, string wif,
            string key, string data, int index, int gasCost)
        {
            var res = await _nodeServices.InvokeExportAsync<bool>(
                GetScriptLocation(), "InvokeContractReplace", GetNetwork(net), wif, CONTRACT_HASH, gasCost, key, data, index);
            return res;
        }

        public async Task<string> GetScriptHashFromAddress(string address)
        {
            var res = await _nodeServices.InvokeExportAsync<string>(GetScriptLocation(), "GetScriptHashFromAddress", address);
            return res;
        }

        public async Task<int> GetTokenBalance(NETWORK_TYPE net, string revSh)
        {
            try
            {
                var res = await _nodeServices.InvokeExportAsync<string>(GetScriptLocation(), 
                    "GetTokenBalance", GetNetwork(net), CONTRACT_HASH, revSh);
                var a = Int32.Parse(res);
                return a;
            }
            catch (Exception err) {
                return 0;
            }
        }

        public async Task<bool> InvokeContractMintToken(NETWORK_TYPE net, string wif, int neoAmount, int gasCost)
        {
            try
            {
                var res = await _nodeServices.InvokeExportAsync<bool>(GetScriptLocation(),
                    "InvokeContractMintToken", GetNetwork(net), wif, CONTRACT_HASH, gasCost, neoAmount);
                return res;
            }
            catch (Exception ex)
            {
                return false;
            }
                
        }
    }
}
