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

namespace Promises.Hubs
{
    [Authorize]
    public class Chat : HubWithPresence
    {
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
            _messagesRepository.OnMessageAdded += OnMessageAdded;
        }

        public async void OnMessageAdded(Message message)
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
            
            //await Clients.Client(Context.ConnectionId).InvokeAsync("SetUsersOnline", await GetUsersOnline());
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
            //return Clients.Client(Context.ConnectionId).InvokeAsync("UsersJoined", users);
        }

        public override async Task OnUsersLeft(UserDetails[] users)
        {
            await Task.CompletedTask;
            //await Clients.Client(Context.ConnectionId).InvokeAsync("UsersLeft", users);
        }

        public async Task OnGetHistory(string personId)
        {
            var owner = await _userManager.GetUserAsync(Context.User);
            var ownerId = owner.Id;
            
            var history = _messagesRepository.GetMessageHistory(ownerId, personId, MESSAGES_AMOUNT.ALL).ToList();
            
            var result = JsonConvert.SerializeObject(history);
            
            await Clients.Client(Context.ConnectionId).InvokeAsync("OnGetHistory", result);
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

            _messagesRepository.AddMessage(sender, reciever, message, localDateParsed);

            var onlineUsers = await GetUsersOnline();

            var onlineExceptId = onlineUsers
                .Where(u => u.Owner.Id != senderId && u.Owner.Id != recieverId)
                .Select(u => u.ConnectionId).ToList();

            await Clients.AllExcept(onlineExceptId)
                .InvokeAsync("SendTo", senderEmail, message, localDateParsed.ToString());
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
