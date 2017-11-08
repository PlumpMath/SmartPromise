using Microsoft.AspNetCore.NodeServices;
using Promises.Abstract;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Promises.Models;

namespace Promises.Concrete
{
    public class NeoBlockchain : IBlockchain
    {
        private readonly string LOCATION = "./Node/out/bundle.js";
        private readonly INodeServices _nodeServices;
        public NeoBlockchain(INodeServices nodeServices)
        {
            _nodeServices = nodeServices;
        }

        public async Task<Account> GenerateAccount()
        {
            return await _nodeServices.InvokeExportAsync<Account>(LOCATION, "GenerateAccount");
        }

        public async Task<Balance> GetBalance(NETWORK_TYPE type, string addr)
        {
            return await _nodeServices.InvokeExportAsync<Balance>(LOCATION, "GetBalance", GetNetwork(type), addr);
        }

        public async Task<string> GetStorage(NETWORK_TYPE type, string scriptHash, string key)
        {
            return await _nodeServices
                .InvokeExportAsync<string>(LOCATION, "GetStorage", GetNetwork(type), scriptHash, key);
        }

        public async Task<IEnumerable<TransactionHistoryItem>> GetTransactionHistory(
            NETWORK_TYPE type, string addr)
        {
            return await _nodeServices.InvokeExportAsync<
                IEnumerable<TransactionHistoryItem>>(LOCATION, "GetTransactionHistory", GetNetwork(type), addr);
        }

        public async Task<bool> SendAsset(NETWORK_TYPE type, string wif, ASSET_NAME assetName, string addr)
        {
            var asset = (assetName == ASSET_NAME.NEO) ? "NEO" : "GAS";
            return await _nodeServices.InvokeExportAsync<bool>(LOCATION, "SendAsset", GetNetwork(type), wif, asset, addr);
        }

        public async Task<bool> VerifyAddress(string addr)
        {
            return await _nodeServices.InvokeExportAsync<bool>(LOCATION, "VerifyAddress", addr);
        }

        private string GetNetwork(NETWORK_TYPE type)
        {
            return (type == NETWORK_TYPE.MAINNET) ? "MainNet" : "TestNet";
        }
    }
}
