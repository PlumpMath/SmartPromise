using Promises.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Promises.Abstract
{
    public enum NETWORK_TYPE { TESTNET = 0, MAINNET = 1 };
    public enum ASSET_NAME { NEO = 0, GAS = 1, SC = 2 };
    
    public interface IBlockchain
    {
        Task<Balance> GetBalance(NETWORK_TYPE type, string addr);
        Task<IEnumerable<TransactionHistoryItem>> GetTransactionHistory(
            NETWORK_TYPE type, string addr);
        Task<bool> SendAsset(NETWORK_TYPE type, string wif, ASSET_NAME assetName, string addr, int amount);
        Task<Account> GenerateAccount();
        Task<string> GetStorage(NETWORK_TYPE type, string key);
        Task<bool> VerifyAddress(string addr);
        Task<bool> InvokeContractAdd(NETWORK_TYPE net, string wif, string sh, string data, int gasCost);
        Task<bool> InvokeContractReplace(NETWORK_TYPE net, string wif, string sh, string data, int index, int gasCost);
        Task<bool> InvokeContractMintToken(NETWORK_TYPE net, string wif, int neoAmount, int gasCost);
        Task<bool> InvokeContractTransfer(NETWORK_TYPE net, string wif, string fromSh, string toSh, int amount, int gasCost);
        Task<string> GetScriptHashFromAddress(string address);
        Task<int> GetTokenBalance(NETWORK_TYPE net, string revSh);
        
    }
}
