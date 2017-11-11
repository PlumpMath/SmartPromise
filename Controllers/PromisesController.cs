using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Promises.Abstract;
using Promises.Models;
using Microsoft.AspNetCore.Authorization;

namespace Promises.Controllers
{
    [Authorize]
    [Produces("application/json")]
    [Route("api/Promises")]
    public class PromisesController : Controller
    {
        private readonly IPromiseRepository _promiseRepository;

        public PromisesController(
            IPromiseRepository promiseRepository)
        {
            _promiseRepository = promiseRepository;
        }

        [HttpPost("{title}/{content}/{complicity}/{date?}")]
        public IActionResult Add(string title, string content, 
            PromiseComplicity complicity, DateTime date)
        {
            var promise = new Promise
            {
                Title = title,
                Content = content,
                Date = date,
                Complicity = complicity,
                IsCompleted = false
            };

            _promiseRepository.Add(promise);
            return Ok();
        }

        [HttpGet()]
        public IActionResult Get()
        {
            var res = _promiseRepository.Promises;
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