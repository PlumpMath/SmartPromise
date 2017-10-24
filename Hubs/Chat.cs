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
using Promises.Concrete;

namespace Promises.Hubs
{
    [Authorize]
    public class Chat : HubWithPresence
    {
        private IHubContext<Chat> _hubContext;
        private readonly IMessagesRepository _messagesRepository;
        private readonly IUserTracker _userTracker;
        private readonly UserManager<ApplicationUser> _userManager;
        private readonly INotificator<Chat, IMessagesRepository> _notificator;

        public Chat(IUserTracker userTracker, 
            IMessagesRepository messagesRepository,
            UserManager<ApplicationUser> userManager,
            INotificator<Chat, IMessagesRepository> notificator)
            : base(userTracker)
        {
            _userTracker = userTracker;
            _messagesRepository = messagesRepository;
            _userManager = userManager;
            _notificator = notificator;
        }

        public async Task OnMessageHistoryRead(string personOneId, string personTwoId)
        {
            var onlineUsers = await _userTracker.UsersOnline();
            var personOneConId = onlineUsers.FirstOrDefault(u => u.Owner.Id == personOneId)?.ConnectionId;
            var personTwoConId = onlineUsers.FirstOrDefault(u => u.Owner.Id == personTwoId)?.ConnectionId;

            if (personOneConId != null)
            {
                await Clients.Client(personOneConId).InvokeAsync("OnMessageHistoryRead");
            }
            if (personTwoConId != null)
            {
                await Clients.Client(personTwoConId).InvokeAsync("OnMessageHistoryRead");
            }
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

            _notificator.AddConnection(Context.Connection);

            await Clients.Client(Context.ConnectionId).InvokeAsync("OnConnected", "You've connected");
                
            await _userTracker.AddUser(Context.Connection, userDetails);
            
            await base.OnConnectedAsync();

        }

        public override async Task OnDisconnectedAsync(Exception exception)
        {
            _notificator.RemoveConnection(Context.Connection);

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

            _messagesRepository.AddMessage(sender, reciever, message, localDateParsed, isUnread);
        }

        public async Task Send(Message message)
        {
            var onlineUsers = await GetUsersOnline();

            //Check they are even online
            var onlineExceptId = onlineUsers
                .Where(u => u.Owner.Id != message.SenderId && u.Owner.Id != message.ReceiverId)
                .Select(u => u.ConnectionId).ToList();

            await Clients.AllExcept(onlineExceptId)
                .InvokeAsync("Send", JsonConvert.SerializeObject(message));
        }
    }
}
