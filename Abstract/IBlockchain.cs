﻿using Promises.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Promises.Abstract
{
    public enum NETWORK_TYPE { TESTNET = 0, MAINNET = 1 };
    public enum ASSET_NAME { NEO = 0, GAS = 1 };
    
    public interface IBlockchain
    {
        Task<Balance> GetBalance(NETWORK_TYPE type, string addr);
        Task<IEnumerable<TransactionHistoryItem>> GetTransactionHistory(
            NETWORK_TYPE type, string addr);
        Task<bool> SendAsset(NETWORK_TYPE type, string wif, ASSET_NAME assetName, string addr);
        Task<Account> GenerateAccount();
        Task<string> GetStorage(NETWORK_TYPE type, string scriptHash, string key);
        Task<bool> VerifyAddress(string addr);
    }
}