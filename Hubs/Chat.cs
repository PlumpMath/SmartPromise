using System.Threading.Tasks;
using Promises.Abstract;
using Promises.Models;
using System;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity;
using static Microsoft.AspNetCore.Hosting.Internal.HostingApplication;
using System.Linq;
using Newtonsoft.Json;
using Microsoft.AspNetCore.SignalR;
using Microsoft.AspNetCore.Mvc;

namespace Promises.Hubs
{
    [Authorize]
    public class Chat : HubWithPresence
    {
        private IHubContext<Chat> _hubContext;
        private readonly IMessagesRepository _messagesRepository;
        private readonly IUserTracker _userTracker;
        private readonly UserManager<ApplicationUser> _userManager;

        public Chat(IUserTracker userTracker, 
            IMessagesRepository messagesRepository,
            UserManager<ApplicationUser> userManager)
            : base(userTracker)
        {
            _userTracker = userTracker;
            _messagesRepository = messagesRepository;
            _userManager = userManager;

            _messagesRepository.OnMessageHistoryRead += OnMessageHistoryRead;
        }

        public void OnMessageHistoryRead()
        {
            int i = 0;
        }

        public override async Task OnConnectedAsync()
        {
            var owner = await _userManager.GetUserAsync(Context.User);
            var ownerId = owner.Id;
            var ownerEmail = await _userManager.GetEmailAsync(owner);

            var userDetails = new UserDetails
            {
                ConnectionId = Context.ConnectionId,
                Owner = new User
                {
                    Email = ownerEmail,
                    Id = ownerId
                }
            };
            
            await Clients.Client(Context.ConnectionId).InvokeAsync("OnConnected", "You've connected");

            await base.OnConnectedAsync();

            await _userTracker.AddUser(Context.Connection, userDetails);
        }

        public override async Task OnDisconnectedAsync(Exception exception)
        {
            await Clients.Client(Context.ConnectionId).InvokeAsync("OnDisconnected", "You've disconected");

            await base.OnDisconnectedAsync(exception);

            await _userTracker.RemoveUser(Context.Connection);
        }

        public override async Task OnUsersJoined(UserDetails[] users)
        {
            await Task.CompletedTask;
        }

        public override async Task OnUsersLeft(UserDetails[] users)
        {
            await Task.CompletedTask;
        }

        public async Task OnGetHistory(string personId)
        {
            var owner = await _userManager.GetUserAsync(Context.User);
            var ownerId = owner.Id;
            
            var history = _messagesRepository
                .GetMessageHistory(ownerId, personId, MESSAGES_AMOUNT.ALL)
                .OrderBy(m => m.ServerDateUtc)
                .ToList();
            
            var result = JsonConvert.SerializeObject(history);
            
            await Clients.Client(Context.ConnectionId).InvokeAsync("OnGetHistory", result);
        }

        //returns connection id if it's online otherwise returns null
        private async Task<string> GetConnectionId(string receiverId)
        {
            var onlineUsers = await _userTracker.UsersOnline();
            var connection = onlineUsers.FirstOrDefault(u => u.Owner.Id == receiverId);
            return connection?.ConnectionId;
        }

        public async Task SendTo(string recieverId, string message, string localDate)
        {
            var posixTime = DateTime.SpecifyKind(new DateTime(1970, 1, 1), DateTimeKind.Utc);
            var localDateParsed = posixTime.AddMilliseconds(Convert.ToInt64(localDate));
            
            var senderUser = await _userManager.GetUserAsync(Context.User);
            var senderId = senderUser.Id;
            var senderEmail = await _userManager.GetEmailAsync(senderUser);
            var recieverEmail = _userManager.Users.Where(u => u.Id == recieverId).FirstOrDefault().Email;

            DateTime localTime = DateTime.Now;

            var reciever = new User {
                Id = recieverId,
                Email = recieverEmail
            };
            var sender = new User {
                Id = senderId,
                Email = senderEmail  
            };

            var receiverConId = await GetConnectionId(recieverId);
            var isUnread = receiverConId == null;

            var mes = _messagesRepository.AddMessage(sender, reciever, message, localDateParsed, isUnread);

            var onlineUsers = await GetUsersOnline();

            var onlineExceptId = onlineUsers
                .Where(u => u.Owner.Id != senderId && u.Owner.Id != recieverId)
                .Select(u => u.ConnectionId).ToList();

            await Clients.AllExcept(onlineExceptId)
                .InvokeAsync("SendTo", JsonConvert.SerializeObject(mes));
        }

        public async Task Send(string message)
        {
            await Clients.All.InvokeAsync("Send", 
                message,
                Context.User.Identity.Name,
                DateTime.Now.ToString("MM/dd/yyyy h:mm tt")
            );
        }
    }
}
