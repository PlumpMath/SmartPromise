
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using Promises.Abstract;
using Promises.Models;
using System.Linq;
using System.Collections.Generic;

namespace Promises.Controllers
{
    [Authorize]
    [Produces("application/json")]
    [Route("api/[controller]/[action]")]
    public class BlockchainController : Controller
    {
        private readonly IBlockchain _blockchain;

        public BlockchainController(IBlockchain blockchain)
        {
            _blockchain = blockchain;
        }

        [HttpGet("{network}/{addr}")]
        public async Task<Balance> GetBalance(NETWORK_TYPE network, string addr)
        {
            return await _blockchain.GetBalance(network, addr);
        }

        [HttpGet("{network}/{addr}")]
        public async Task<IEnumerable<TransactionHistoryItem>> GetTransactionHistory(NETWORK_TYPE network, string addr)
        {
            return await _blockchain.GetTransactionHistory(network, addr);
        }

        [HttpGet("{network}/{wif}/{assetName}/{addr}")]
        public async Task<bool> GetTransactionHistory(
            NETWORK_TYPE network, string wif, ASSET_NAME assetName, string addr)
        {
            return await _blockchain.SendAsset(network, wif, assetName, addr);
        }

        [HttpGet()]
        public async Task<Account> GenerateAccount()
        {
            return await _blockchain.GenerateAccount();
        }

        [HttpGet("{network}/{scriptHash}/{key}")]
        public async Task<string> GetStorage(NETWORK_TYPE network, string scriptHash, string key)
        {
            return await _blockchain.GetStorage(network, scriptHash, key);
        }
        
        [HttpGet("{addr}")]
        public async Task<bool> VerifyAddress(string addr)
        {
            return await _blockchain.VerifyAddress(addr);
        }
    }
}