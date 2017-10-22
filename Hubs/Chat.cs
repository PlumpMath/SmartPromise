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


            //very bad, email property should be written in Message object
            //replace all the reciever id and sender id with their emails respectively
            history.ForEach(m => m.ReceiverId = _userManager.Users.Where(v => v.Id == m.ReceiverId).Select(v => v.Email).FirstOrDefault());
            history.ForEach(m => m.SenderId = _userManager.Users.Where(v => v.Id == m.SenderId).Select(v => v.Email).FirstOrDefault());

            var result = JsonConvert.SerializeObject(history);
            
            await Clients.Client(Context.ConnectionId).InvokeAsync("OnGetHistory", result);
        }

        public async Task SendTo(string userId, string message, string localDate)
        {
            var posixTime = DateTime.SpecifyKind(new DateTime(1970, 1, 1), DateTimeKind.Utc);
            var localDateParsed = posixTime.AddMilliseconds(Convert.ToInt64(localDate));
            
            var owner = await _userManager.GetUserAsync(Context.User);
            var ownerId = owner.Id;
            var ownerEmail = await _userManager.GetEmailAsync(owner);

            DateTime localTime = DateTime.Now;//DateTime.Parse(localDate);

            _messagesRepository.AddMessage(ownerId, userId, message, localDateParsed);

            var onlineUsers = await GetUsersOnline();

            var onlineExceptId = onlineUsers
                .Where(u => u.Owner.Id != ownerId && u.Owner.Id != userId)
                .Select(u => u.ConnectionId).ToList();

            await Clients.AllExcept(onlineExceptId).InvokeAsync("SendTo", ownerEmail, message, localDateParsed.ToString());
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
