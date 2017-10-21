using System.Threading.Tasks;
using Microsoft.AspNetCore.SignalR;
using Promises.Abstract;
using Promises.Models;
using System;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;

namespace Promises.Hubs
{
    [Authorize]
    public class Chat : HubWithPresence
    {
        IMessagesRepository _messagesRepository;

        public Chat(IUserTracker userTracker, IMessagesRepository messagesRepository)
            : base(userTracker)
        {
            _messagesRepository = messagesRepository;
            _messagesRepository.OnMessageAdded += OnMessageAdded;
        }

        public async void OnMessageAdded(Message message)
        {

        }
        
        public override async Task OnConnectedAsync()
        {
            //await Clients.Client(Context.ConnectionId).InvokeAsync("SetUsersOnline", await GetUsersOnline());
            await Clients.Client(Context.ConnectionId).InvokeAsync("OnConnected", "You've connected");

            await base.OnConnectedAsync();
        }

        public override async Task OnDisconnectedAsync(Exception exception)
        {
            await Clients.Client(Context.ConnectionId).InvokeAsync("OnDisconnected", "You've disconected");

            await base.OnDisconnectedAsync(exception);
        }

        public override Task OnUsersJoined(UserDetails[] users)
        {
            return Clients.Client(Context.ConnectionId).InvokeAsync("UsersJoined", users);
        }

        public override async Task OnUsersLeft(UserDetails[] users)
        {
            await Clients.Client(Context.ConnectionId).InvokeAsync("UsersLeft", users);
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
