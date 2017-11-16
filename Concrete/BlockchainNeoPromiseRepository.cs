using Promises.Abstract;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Promises.Models;
using Microsoft.AspNetCore.Identity;
using System.Numerics;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Authorization;
using Newtonsoft.Json;
using System.Text;
using Promises.Utils;

namespace Promises.Concrete
{
    [Authorize]
    public class BlockchainNeoPromiseRepository : IPromiseRepository
    {

        private readonly int GAS_COST = 1;
        private readonly IBlockchain _blockchain;
        public BlockchainNeoPromiseRepository(
            IBlockchain blockchain,
            UserManager<ApplicationUser> userManager)
        {
            _blockchain = blockchain;
        }
        
        private async Task<int> GetPromiseCount(ApplicationUser user)
        {
            var key = await SmartPromiseConverter.GetPromiseCountKeyHex(user.Address, _blockchain);
            var count = await _blockchain.GetStorage(NETWORK_TYPE.TESTNET, key);
            return count == null? 0 : SmartPromiseConverter.Hex2Num(count);
        }

        public async Task<IEnumerable<Promise>> GetPromises(ApplicationUser user)
        {
            var count = await GetPromiseCount(user);
           
            if (count == 0)
            {
                return null;
            }

            var keys = await Task.WhenAll(Enumerable.Range(1, count)
                .Select(i => SmartPromiseConverter.GetPromiseKeyHex(user.Address, i, _blockchain)));
            
            var promises = await LoadPromises(keys);
            
            return promises;
        }

        public async Task<bool> Add(Promise promise, ApplicationUser user)
        {
            //it's guaranteed it's unique by contract code
            var counter = await GetPromiseCount(user);
            promise.Id = (counter == 0) ? 1 : counter + 1;

            var json = JsonConvert.SerializeObject(promise);
            var jsonHex = SmartPromiseConverter.Str2Hex(json);
            var revSh = await SmartPromiseConverter.GetScriptHashReversed(user.Address, _blockchain);
            var res = await _blockchain.InvokeContractAdd(NETWORK_TYPE.TESTNET, user.Wif, revSh, jsonHex, GAS_COST);
            return res;
        }

        private async Task<IEnumerable<Promise>> LoadPromises(string[] keys)
        {
            var jsonPromisesHex = await Task.WhenAll(
                keys.Select(key => _blockchain.GetStorage(NETWORK_TYPE.TESTNET, key))
            );

            var promises = jsonPromisesHex.ToAsyncEnumerable().Select(p => {
                try
                {
                    return JsonConvert.DeserializeObject<Promise>(SmartPromiseConverter.Hex2Str(p));
                }
                catch (Exception)
                {
                    return new Promise {
                        Title = "Error while loading. Please, try later.",
                        Content = "",
                        Complicity = 0,
                        Status = PROMISE_STATUS.ERROR
                    };
                }
            }).ToEnumerable();
            
            return promises;
        }

        public async Task<bool> Complete(int id, string proof, ApplicationUser user)
        {
            var promise = await Get(id, user);
            if (promise == null)
                return false;

            promise.Status = PROMISE_STATUS.COMPLETED;
            promise.Proof = proof;
            var json = JsonConvert.SerializeObject(promise);
            var jsonHex = SmartPromiseConverter.Str2Hex(json);
            var revSh = await SmartPromiseConverter.GetScriptHashReversed(user.Address, _blockchain);
            var res = await _blockchain.InvokeContractReplace(NETWORK_TYPE.TESTNET, user.Wif, revSh, jsonHex, id, GAS_COST);
            return res;
        }

        public async Task<Promise> Get(int id, ApplicationUser user)
        {
            try
            {
                var promiseKeyHex = await SmartPromiseConverter.GetPromiseKeyHex(user.Address, id, _blockchain);
                var promiseJsonHex = await _blockchain.GetStorage(NETWORK_TYPE.TESTNET, promiseKeyHex);
                var promiseJson = SmartPromiseConverter.Hex2Str(promiseJsonHex);
                return JsonConvert.DeserializeObject<Promise>(promiseJson);
            }
            catch (Exception ex)
            {
                return null;
            }
        }
    }
}
