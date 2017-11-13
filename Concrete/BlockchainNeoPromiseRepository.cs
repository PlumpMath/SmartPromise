﻿using Promises.Abstract;
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

namespace Promises.Concrete
{
    [Authorize]
    public class BlockchainNeoPromiseRepository : IPromiseRepository
    {
        private static class SmartPromiseKeyGenerator
        {
            static string PROMISE_PREFIX_HEX = "50"; //P
            static string PROMISE_COUNT_PREFIX_HEX = "43"; //C

            public static string Str2Hex(string str)
            {
                byte[] ba = Encoding.UTF8.GetBytes(str);
                var hexString = BitConverter.ToString(ba);
                hexString = hexString.Replace("-", "");
                return hexString;
            }

            public static string Hex2Str(string hex)
            {
                byte[] da = Enumerable.Range(0, hex.Length)
                    .Where(x => x % 2 == 0)
                    .Select(x => Convert.ToByte(hex.Substring(x, 2), 16))
                    .ToArray();
                    
                var str = Encoding.UTF8.GetString(da);
                return str;
            }

            public static string Num2Hex(int num)
            {
                var hex = num.ToString("X2");
                return hex;
            }

            public static int Hex2Num(string hex)
            {
                int num = int.Parse(hex, System.Globalization.NumberStyles.HexNumber);
                return num;
            }

            public static string GetPromiseKeyHex(string ownerKey, int i) =>
                PROMISE_PREFIX_HEX + Str2Hex(ownerKey) + Num2Hex(i);
            

            public static string GetPromiseCountKeyHex(string ownerKey) =>
                PROMISE_COUNT_PREFIX_HEX + Str2Hex(ownerKey);
        }

        private readonly IBlockchain _blockchain;
        private readonly UserManager<ApplicationUser> _userManager;
        public BlockchainNeoPromiseRepository(
            IBlockchain blockchain,
            UserManager<ApplicationUser> userManager)
        {
            _blockchain = blockchain;
            _userManager = userManager;
        }
        
        private async Task<int> GetPromiseCount(ApplicationUser user)
        {

            var key = SmartPromiseKeyGenerator.GetPromiseCountKeyHex(user.Address);
            var count = await _blockchain.GetStorage(NETWORK_TYPE.TESTNET, key);
            return count == null? 0 : SmartPromiseKeyGenerator.Hex2Num(count);
        }

        public async Task<IEnumerable<Promise>> GetPromises(ApplicationUser user)
        {
            var count = await GetPromiseCount(user);

            if (count == 0)
            {
                return null;
            }

            string[] keys = Enumerable.Range(0, count).Select(i => 
                SmartPromiseKeyGenerator.GetPromiseKeyHex(user.Address, i)).ToArray();
            var promises = await LoadPromises(keys);
            
            return promises;
        }

        public async Task<bool> Add(Promise promise, ApplicationUser user)
        {
            //it's guaranteed it's unique by contract code
            promise.Id = await GetPromiseCount(user);

            var json = JsonConvert.SerializeObject(promise);
            var jsonHex = SmartPromiseKeyGenerator.Str2Hex(json);
            var addressHex = SmartPromiseKeyGenerator.Str2Hex(user.Address);
            var res = await _blockchain.InvokeContractAdd(NETWORK_TYPE.TESTNET, user.Wif, addressHex, jsonHex, 1);
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
                    return JsonConvert.DeserializeObject<Promise>(SmartPromiseKeyGenerator.Hex2Str(p));
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
            var jsonHex = SmartPromiseKeyGenerator.Str2Hex(json);
            var addressHex = SmartPromiseKeyGenerator.Str2Hex(user.Address);

            var res = await _blockchain.InvokeContractReplace(NETWORK_TYPE.TESTNET, user.Wif, addressHex, jsonHex, id, 1);
            return res;
        }

        public async Task<Promise> Get(int id, ApplicationUser user)
        {
            try
            {
                var promiseKeyHex = SmartPromiseKeyGenerator.GetPromiseKeyHex(user.Address, id);
                var promiseJsonHex = await _blockchain.GetStorage(NETWORK_TYPE.TESTNET, promiseKeyHex);
                var promiseJson = SmartPromiseKeyGenerator.Hex2Str(promiseJsonHex);
                return JsonConvert.DeserializeObject<Promise>(promiseJson);
            }
            catch (Exception ex)
            {
                return null;
            }
        }
    }
}
