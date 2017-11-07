using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Promises.Abstract
{
    public enum NETWORK_TYPE { TESTNET = 0, MAINNET = 1 };
    
    public interface IBlockchain
    {
        Task<int> GetBalance(NETWORK_TYPE type, string addr);
    }
}
