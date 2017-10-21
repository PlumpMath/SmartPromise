using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;
using System.Threading;
using System.Threading.Tasks;

namespace Promises.Hubs
{
    [Authorize]
    public class Notification : Hub
    {
        public async Task Notify()
        {
            await Clients.Client(Context.ConnectionId).InvokeAsync("Notify");
            //Clients.All.join($"{Context.ConnectionId} has joned to room");
        }
    }
}

