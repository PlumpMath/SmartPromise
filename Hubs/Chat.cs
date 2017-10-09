using System.Threading.Tasks;
using Microsoft.AspNetCore.SignalR;
using Promises.Abstract;
using Promises.Models;
using Microsoft.AspNetCore.SignalR.Hubs;

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

        public override async Task OnConnected()
        {
            //await Clients.Client(Context.ConnectionId).InvokeAsync("SetUsersOnline", await GetUsersOnline());
            await Clients.Client(Context.ConnectionId).InvokeAsync("OnConnected", "You've connected");
            await base.OnConnected();
        }

        public override async Task OnDisconnected(bool stopCalled)
        {
            await Clients.Client(Context.ConnectionId).InvokeAsync("OnDisconnected", "You've disconected");
            await base.OnDisconnected(stopCalled);
        }

        public override Task OnUsersJoined(UserDetails[] users)
        {
            return Clients.Client(Context.ConnectionId).InvokeAsync("UsersJoined", users);
        }

        public override Task OnUsersLeft(UserDetails[] users)
        {
            return Clients.Client(Context.ConnectionId).InvokeAsync("UsersLeft", users);
        }

        public async Task Send(string message)
        {
            await Clients.All.InvokeAsync("Send", Context.User.Identity.Name, message);
        }
    }
}
