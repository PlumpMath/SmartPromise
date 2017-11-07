
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using Promises.Abstract;

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
        public async Task<int> GetBalance(NETWORK_TYPE network, string addr)
        {
            return await _blockchain.GetBalance(network, addr);
        }
    }
}