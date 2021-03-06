using System.Threading.Tasks;
using Promises.Abstract;
using Promises.Models;
using System;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using System.Linq;
using Newtonsoft.Json;
using Microsoft.AspNetCore.SignalR;
using Microsoft.AspNetCore.Mvc;
using Promises.Concrete;
using Newtonsoft.Json.Serialization;

namespace Promises.Hubs
{
    [Authorize]
    public class Chat : Hub
    {
        private readonly IMessagesRepository _messagesRepository;
        private readonly IUserTracker<Chat> _userTracker;
        private readonly UserManager<ApplicationUser> _userManager;
        private readonly INotificator<Chat, IMessagesRepository> _notificator;

        public Chat(IUserTracker<Chat> userTracker, 
            IMessagesRepository messagesRepository,
            UserManager<ApplicationUser> userManager,
            INotificator<Chat, IMessagesRepository> notificator)
        {
            _userTracker = userTracker;
            _messagesRepository = messagesRepository;
            _userManager = userManager;
            _notificator = notificator;
        }

        public async Task OnMessageHistoryRead()
        {
            await Clients.Client(Context.ConnectionId).InvokeAsync("OnMessageHistoryRead");
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

        public async Task OnGetHistory(string personId)
        {
            var owner = await _userManager.GetUserAsync(Context.User);
            var ownerId = owner.Id;
            
            var history = _messagesRepository
                .GetMessageHistory(ownerId, personId, MESSAGES_AMOUNT.ALL)
                .OrderBy(m => m.ServerDateUtc)
                .ToList();

            
            var json = JsonConvert.SerializeObject(history, new JsonSerializerSettings {
                ContractResolver = new CamelCasePropertyNamesContractResolver()
            });

            await Clients.Client(Context.ConnectionId).InvokeAsync("OnGetHistory", json);
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
            var json = JsonConvert.SerializeObject(message, new JsonSerializerSettings
            {
                ContractResolver = new CamelCasePropertyNamesContractResolver()
            });
            await Clients.Client(Context.ConnectionId).InvokeAsync("Send", json);
        }
    }
}
