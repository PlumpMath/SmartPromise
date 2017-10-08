using Microsoft.AspNetCore.SignalR;
using Microsoft.AspNetCore.SignalR.Hubs;


namespace WebApplication1.Hubs
{
    [HubName("notification")]
    public class NotificationHub : Hub
    {
        public void Join()
        {
            Clients.All.join($"{Context.ConnectionId} has joned to room");
        }
    }
}

