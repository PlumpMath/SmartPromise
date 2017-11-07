using Microsoft.AspNetCore.NodeServices;
using Promises.Abstract;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Promises.Concrete
{
    public class NeoBlockchain : IBlockchain
    {
        private readonly string LOCATION = "./Node/out/bundle.js";
        private readonly INodeServices _nodeServices;
        public NeoBlockchain(INodeServices nodeServices)
        {
            _nodeServices = nodeServices;
        }
        public async Task<int> GetBalance(NETWORK_TYPE type, string addr)
        {
            var network = (type == NETWORK_TYPE.MAINNET) ? "MainNet" : "TestNet";
            return await _nodeServices.InvokeAsync<int>(LOCATION, network, addr);
        }
    }
}
