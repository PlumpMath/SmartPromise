using Promises.Abstract;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Promises.Utils
{
    public static class SmartPromiseConverter
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

        private static string Reverse(string str)
        {
            var revSh = str.Reverse().ToArray();
            for (int i = 0; i < revSh.Length; i += 2)
            {
                var tmp = revSh[i];
                revSh[i] = revSh[i + 1];
                revSh[i + 1] = tmp;
            }
            return new string(revSh);
        }

        public static async Task<string> GetPromiseKeyHex(string address, int i, IBlockchain blockchain)
        {
            var sh = await blockchain.GetScriptHashFromAddress(address);
            return PROMISE_PREFIX_HEX + Reverse(sh) + Num2Hex(i);
        }

        public static async Task<string> GetScriptHashReversed(string address, IBlockchain blockchain)
        {
            var sh = await blockchain.GetScriptHashFromAddress(address);
            return Reverse(sh);
        }


        public static async Task<string> GetPromiseCountKeyHex(string address, IBlockchain blockchain)
        {
            var sh = await blockchain.GetScriptHashFromAddress(address);
            return PROMISE_COUNT_PREFIX_HEX + Reverse(sh);
        }
    }
}
