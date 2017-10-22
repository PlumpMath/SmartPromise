using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.AspNetCore.SignalR;
using Promises.Models;
using Promises.Abstract;
using System.Linq;

namespace Promises.Hubs
{
    public class HubWithPresence : Hub
    {
        private IUserTracker _userTracker;

        public HubWithPresence(IUserTracker userTracker)
        {
            _userTracker = userTracker;
        }

        public Task<IQueryable<UserDetails>> GetUsersOnline()
        {
            return _userTracker.UsersOnline();
        }

        public virtual Task OnUsersJoined(UserDetails[] user)
        {
            return Task.CompletedTask;
        }

        public virtual Task OnUsersLeft(UserDetails[] user)
        {
            return Task.CompletedTask;
        }
    }
}
