using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Promises.Models;
using Promises.Abstract;

namespace Promises.Controllers
{

    [Authorize]
    [Produces("application/json")]
    [Route("api/[controller]/[action]")]
    public class MessagesController : Controller
    {

        private readonly UserManager<ApplicationUser> _userManager;
        private readonly IMessagesRepository _messagesRepository;
        
        public MessagesController(
          UserManager<ApplicationUser> userManager,
          IMessagesRepository messagesRepository)
        {
            _userManager = userManager;
            _messagesRepository = messagesRepository;
        }

        [HttpGet]
        public async Task<IActionResult> GetOwner()
        {
            var user = await _userManager.GetUserAsync(HttpContext.User);

            return new OkObjectResult(new User
            {
                Email = user.Email,
                Id = user.Id
            });
        }

        [HttpGet]
        public IActionResult GetLastMessagesHistory()
        {
            var userId = _userManager.GetUserId(HttpContext.User);
            var history = _messagesRepository.GetLastMessagesHistory(userId)
                .OrderByDescending(m => m.ServerDateUtc);

            return new OkObjectResult(history);
        }

        [HttpGet]
        public IActionResult GetLastMessageInHistory(string personId)
        {
            var userId = _userManager.GetUserId(HttpContext.User);
            var message = _messagesRepository.FindLastMessage(userId, personId);

            return new OkObjectResult(message);
        }

        [HttpGet]
        public IActionResult GetMessageHistory(string personId)
        {
            var userId = _userManager.GetUserId(HttpContext.User);
            var history = _messagesRepository.GetMessageHistory(userId, personId, MESSAGES_AMOUNT.ALL);

            return new OkObjectResult(history);
        }
    }
}