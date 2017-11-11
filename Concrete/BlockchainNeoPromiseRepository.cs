using Promises.Abstract;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Promises.Models;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Authorization;
using Newtonsoft.Json;

namespace Promises.Concrete
{
    [Authorize]
    public class BlockchainNeoPromiseRepository : IPromiseRepository
    {
        private readonly IBlockchain _blockchain;
        private readonly UserManager<ApplicationUser> _userManager;
        public BlockchainNeoPromiseRepository(
            IBlockchain blockchain,
            UserManager<ApplicationUser> userManager)
        {
            _blockchain = blockchain;
            _userManager = userManager;
        }

        public async Task<IEnumerable<Promise>> GetPromises(ApplicationUser user)
        {
            var json = await _blockchain.GetStorage(NETWORK_TYPE.TESTNET, user.Address);
            var promises = JsonConvert.DeserializeObject<Promise>(json);
            
            return new List<Promise> { promises };
        }

        public async Task<bool> Add(Promise promise, ApplicationUser user)
        {
            var json = JsonConvert.SerializeObject(promise);
            var res = await _blockchain.InvokeContractAdd(NETWORK_TYPE.TESTNET, user.Wif, user.Address, json, 2);
            return res;
        }

        public Task<bool> Complete(Guid id)
        {
            throw new NotImplementedException();
        }

        public Task<Promise> Get(Guid id)
        {
            throw new NotImplementedException();
        }
    }
}
