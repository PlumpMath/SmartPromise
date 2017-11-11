
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using Promises.Abstract;
using Promises.Models;
using System.Linq;
using System.Collections.Generic;
using Microsoft.AspNetCore.Identity;
using Newtonsoft.Json;

namespace Promises.Controllers
{
    [Authorize]
    [Produces("application/json")]
    [Route("api/[controller]/[action]")]
    public class BlockchainController : Controller
    {
        private readonly IBlockchain _blockchain;
        private readonly UserManager<ApplicationUser> _userManager;

        public BlockchainController(
            IBlockchain blockchain,
            UserManager<ApplicationUser> userManager)
        {
            _blockchain = blockchain;
            _userManager = userManager;
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
        

        [HttpGet()]
        public async Task<Account> GenerateAccount()
        {
            return await _blockchain.GenerateAccount();
        }

        [HttpGet("{type}/{assetName}/{addr}/{amount}")]
        public async Task<bool> SendAsset(NETWORK_TYPE type, ASSET_NAME assetName, string addr, int amount)
        {
            var user = await _userManager.GetUserAsync(User);
            return await _blockchain.SendAsset(type, user.Wif, assetName, addr, amount);
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

        [HttpGet("{net}/{data}")]
        public async Task<bool> ContractInvokeAddPromise(NETWORK_TYPE net, Promise data)
        {
            var json = JsonConvert.SerializeObject(data);
            var user = await _userManager.GetUserAsync(User);

            return await _blockchain.InvokeContractAdd(net, user.Wif, user.Email, json, 2);
        }
    }
}