using System.Threading.Tasks;
using Microsoft.AspNetCore.SignalR;
using Promises.Abstract;
using Promises.Models;
using Microsoft.AspNetCore.SignalR.Hubs;
using System;

namespace Promises.Hubs
{
    [Authorize]
    [HubName("chat")]
    public class Chat : HubWithPresence
    {
        public Chat(IUserTracker<Chat> userTracker)
            : base(userTracker)
        {
            int i = 0;
        }

        public override Task OnConnected()
        {
            //await Clients.Client(Context.ConnectionId).InvokeAsync("SetUsersOnline", await GetUsersOnline());
            Clients.Client(Context.ConnectionId).Invoke("OnConnected", "You've connected");
            base.OnConnected();
            return Task.CompletedTask;
        }

        public override Task OnDisconnected(bool stopCalled)
        {
            Clients.Client(Context.ConnectionId).Invoke("OnDisconnected", "You've disconected");
            base.OnDisconnected(stopCalled);
            return Task.CompletedTask;
        }
        /*
        public override async Task OnDisconnected(bool stopCalled)
        {
            await Clients.Client(Context.ConnectionId).InvokeAsync("OnDisconnected", "You've disconected");
            await base.OnDisconnected(stopCalled);
        }
        */

        public override Task OnUsersJoined(UserDetails[] users)
        {
            return Clients.Client(Context.ConnectionId).InvokeAsync("UsersJoined", users);
        }

        public override Task OnUsersLeft(UserDetails[] users)
        {
            return Clients.Client(Context.ConnectionId).InvokeAsync("UsersLeft", users);
        }

        public void Send(string message)
        {
            Clients.All.Invoke("Send", 
                message,
                Context.User.Identity.Name,
                DateTime.Now.ToString("MM/dd/yyyy h:mm tt")
            );
        }
    }
}
