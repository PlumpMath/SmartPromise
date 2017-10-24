using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.SignalR;
using Newtonsoft.Json;
using Promises.Abstract;
using Promises.Models;
using System;
using System.Threading;
using System.Threading.Tasks;

namespace Promises.Hubs
{
    [Authorize]
    public class Notification : Hub
    {
        private readonly IMessagesRepository _messagesRepository;
        private readonly IUserTracker<Notification> _userTracker;
        private readonly UserManager<ApplicationUser> _userManager;
        private readonly INotificator<Notification, IMessagesRepository> _notificator;

        public Notification(IUserTracker<Notification> userTracker,
            IMessagesRepository messagesRepository,
            UserManager<ApplicationUser> userManager,
            INotificator<Notification, IMessagesRepository> notificator)
        {
            _userTracker = userTracker;
            _messagesRepository = messagesRepository;
            _userManager = userManager;
            _notificator = notificator;
        }
        
        //TODO it would be great to make them private and notificator to be a friend of this class
        public async Task NotifyHaveUnread(User from)
        {
            await Clients.Client(Context.ConnectionId)
                .InvokeAsync("OnNewUnreadMessage", JsonConvert.SerializeObject(from));
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

            //await Clients.Client(Context.ConnectionId).InvokeAsync("OnConnected", "You've connected");

            await _userTracker.AddUser(Context.Connection, userDetails);

            await base.OnConnectedAsync();
        }

        public override async Task OnDisconnectedAsync(Exception exception)
        {
            _notificator.RemoveConnection(Context.Connection);

            //await Clients.Client(Context.ConnectionId).InvokeAsync("OnDisconnected", "You've disconected");

            await base.OnDisconnectedAsync(exception);

            await _userTracker.RemoveUser(Context.Connection);
        }
    }
}

