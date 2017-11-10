using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Identity;
using Promises.Models;
using Promises.Abstract;
using Promises.Models.CabinetViewModels;
using Promises.Hubs;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.NodeServices;

namespace Promises.Controllers
{
    [Authorize]
    [Produces("application/json")]
    [Route("api/[controller]/[action]")]
    public class FriendsController : Controller
    {
        private readonly UserManager<ApplicationUser> _userManager;
        private readonly IFriendsRepository _friendsRepository;
        private readonly IUserTracker<Notification> _userTracker;
        
        public FriendsController(
          UserManager<ApplicationUser> userManager,
          IFriendsRepository friendsRepository,
          IUserTracker<Notification> userTracker)
        {
            _userManager = userManager;
            _friendsRepository = friendsRepository;
            _userTracker = userTracker;
        }

        [HttpGet("{firstId}/{secondId}")]
        public IActionResult AreFriends(string firstId, string secondId)
        {
            return new OkObjectResult(_friendsRepository.AreFriends(firstId, secondId));
        }

        [HttpGet("{email?}")]
        public IActionResult FindByEmail(string email = default(string))
        {
            var userId = _userManager.GetUserId(HttpContext.User);

            //TODO: make User table
            var friends = _userManager.Users
                .Where(u =>
                    _friendsRepository.AreFriends(u.Id, userId) && u.Id != userId &&
                    (email == default(string) || u.Email.StartsWith(email))
                )
                .Select(u => new User { Email = u.Email, Id = u.Id })
                .ToList();

            friends.ForEach(async u => u.IsOnline = await IsOnline(u.Id));

            //other users except his friends
            var foundOtherUsers = _userManager.Users
                .Where(u =>
                    !_friendsRepository.AreFriends(u.Id, userId) && !_friendsRepository.ArePendingFriends(u.Id, userId) 
                    && u.Id != userId && (email == default(string) || u.Email.StartsWith(email))
                )
                .Select(u => new User { Email = u.Email, Id = u.Id })
                .ToList();

            foundOtherUsers.ForEach(async u => u.IsOnline = await IsOnline(u.Id));

            var pending = _userManager.Users
                .Where(u =>
                    _friendsRepository.ArePendingFriends(u.Id, userId) && u.Id != userId &&
                    (email == default(string) || u.Email.StartsWith(email))
                )
                .Select(u => new User { Email = u.Email, Id = u.Id })
                .ToList();

            pending.ForEach(async u => u.IsOnline = await IsOnline(u.Id));


            if (foundOtherUsers == null)
            {
                return NotFound();
            }

            var model = new FriendsModel
            {
                Friends = friends,
                Others = foundOtherUsers,
                Pending = pending
            };

            return new OkObjectResult(model);
        }

        [HttpGet]
        public async Task<IActionResult> GetMyAddress()
        {
            var res = await _userManager.GetUserAsync(User);
            return new OkObjectResult(res.Address);
        }

        [HttpGet("{friendUserId}")]
        public IActionResult RequestFriendship(string friendUserId)
        {
            if (!IsThereUser(friendUserId))
                return NotFound();

            var userId = _userManager.GetUserId(HttpContext.User);
            _friendsRepository.RequestFriendship(userId, friendUserId);
            return Ok();
        }

        [HttpGet("{friendUserId}")]
        public IActionResult AcceptFriendship(string friendUserId)
        {
            if (!IsThereUser(friendUserId))
                return NotFound();

            var userId = _userManager.GetUserId(HttpContext.User);
            _friendsRepository.AcceptFriendship(userId, friendUserId);
            return Ok();
        }

        [HttpGet("{friendUserId}")]
        public IActionResult RemoveFriend(string friendUserId)
        {
            if (!IsThereUser(friendUserId))
                return NotFound();

            var userId = _userManager.GetUserId(HttpContext.User);
            _friendsRepository.RemoveFriend(userId, friendUserId);
            return Ok();
        }

        [HttpGet("{friendUserId}")]
        public IActionResult RejectFriendship(string friendUserId)
        {
            if (!IsThereUser(friendUserId))
                return NotFound();

            var userId = _userManager.GetUserId(HttpContext.User);
            _friendsRepository.RejectFriendship(userId, friendUserId);
            return Ok();
        }

        [HttpGet]
        public async Task<IActionResult> GetPendingFriends()
        {
            var userId = _userManager.GetUserId(HttpContext.User);
            var ids = _friendsRepository.GetPendingFriends(userId).ToList();

            IList<User> result = new List <User>{ };

            foreach (var id in  ids)
            {
                var email = (await _userManager.FindByIdAsync(id)).Email;
                result.Add(new Models.User { Id = id, Email = email });
            }
            return new OkObjectResult(result);
        }

        private bool IsThereUser(string id)
        {
            return default(ApplicationUser) != _userManager.Users.FirstOrDefault(u => u.Id == id);
        }

        private async Task<bool> IsOnline(string userId)
        {
            var onlineUsers = await _userTracker.UsersOnline();
            return onlineUsers.FirstOrDefault(u => u.Owner.Id == userId) != null;
        }
    }
}