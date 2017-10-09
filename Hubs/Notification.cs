using Microsoft.AspNetCore.SignalR;
using Microsoft.AspNetCore.SignalR.Hubs;
using System.Threading;

namespace Promises.Hubs
{
    [Authorize]
    [HubName("notification")]
    public class Notification : Hub
    {
        public void Notify()
        {
            Clients.Client(Context.ConnectionId).notify();
            //Clients.All.join($"{Context.ConnectionId} has joned to room");
        }
    }
}

