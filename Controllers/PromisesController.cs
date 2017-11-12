using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Promises.Abstract;
using Promises.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;

namespace Promises.Controllers
{
    [Authorize]
    [Produces("application/json")]
    [Route("api/Promises")]
    public class PromisesController : Controller
    {
        private readonly IPromiseRepository _promiseRepository;
        private readonly UserManager<ApplicationUser> _userManager;

        public PromisesController(
            IPromiseRepository promiseRepository,
            UserManager<ApplicationUser> userManager)
        {
            _promiseRepository = promiseRepository;
            _userManager = userManager;
        }

        [HttpPost("{title}/{content}/{complicity}/{date?}")]
        public async Task<IActionResult> Add(string title, string content, 
            PromiseComplicity complicity, DateTime date)
        {
            var user = await _userManager.GetUserAsync(User);
            var promise = new Promise
            {
                Title = title,
                Content = content,
                Date = date,
                Complicity = complicity,
                Status = PROMISE_STATUS.NOT_COMPLTED
            };

            var res = await _promiseRepository.Add(promise, user);
            return new OkObjectResult(res);
        }

        [HttpGet("{address}")]
        public async Task<IActionResult> Get(string address)
        {
            var user = _userManager.Users.FirstOrDefault(u => u.Address == address);
            var res = await _promiseRepository.GetPromises(user);
            return new OkObjectResult(res);
        }

        [HttpPost("{id}")]
        public IActionResult Complete(Guid id)
        {
            _promiseRepository.Complete(id);
            return Ok();
        }
    }
}