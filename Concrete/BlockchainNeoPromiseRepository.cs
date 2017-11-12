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

            private static string Hex2Str(string hex)
            {
                byte[] da = Enumerable.Range(0, hex.Length)
                    .Where(x => x % 2 == 0)
                    .Select(x => Convert.ToByte(hex.Substring(x, 2), 16))
                    .ToArray();
                    
                var str = Encoding.UTF8.GetString(da);
                return str;
            }

            private static string Num2Hex(int num)
            {
                var hex = num.ToString("X2");
                return hex;
            }

            private static int Hex2Num(string hex)
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
        
        private async Task<string> GetPromiseCount(ApplicationUser user)
        {

            var key = SmartPromiseKeyGenerator.GetPromiseCountKeyHex(user.Address);
            var count = await _blockchain.GetStorage(NETWORK_TYPE.TESTNET, key);
            return count;
        }

        public async Task<IEnumerable<Promise>> GetPromises(ApplicationUser user)
        {
            var count = await GetPromiseCount(user);
            //var json = await _blockchain.GetStorage(NETWORK_TYPE.TESTNET, user.Address);
            //var promises = JsonConvert.DeserializeObject<Promise>(json);

            return null;
            //return new List<Promise> { promises };
        }

        public async Task<bool> Add(Promise promise, ApplicationUser user)
        {
            var json = JsonConvert.SerializeObject(promise);
            var jsonHex = SmartPromiseKeyGenerator.Str2Hex(json);
            var addressHex = SmartPromiseKeyGenerator.Str2Hex(user.Address);
            var res = await _blockchain.InvokeContractAdd(NETWORK_TYPE.TESTNET, user.Wif, addressHex, jsonHex, 1);
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
