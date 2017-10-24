using Microsoft.AspNetCore.SignalR;
using Microsoft.Extensions.DependencyInjection;
using Promises.Abstract;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Promises.Concrete
{
    public class DefaultNotificator<THub, TRepository> : INotificator<THub, TRepository> 
        where THub : Hub
    {
        private readonly HubConnectionList _connections = new HubConnectionList();
        private readonly IServiceScopeFactory _serviceScopeFactory;
        private readonly IServiceProvider _serviceProvider;
        private IHubContext<THub> _hubContext;

        public DefaultNotificator(
            IServiceScopeFactory serviceScopeFactory,
            IServiceProvider serviceProvider
        )
        {
            _serviceScopeFactory = serviceScopeFactory;
            _serviceProvider = serviceProvider;

            //_messagesRepository.OnMessageHistoryRead += OnMessageHistoryRead;
        }

        public virtual void AddConnection(HubConnectionContext connection)
        {
            _connections.Add(connection);
            //await _userTracker.AddUser(connection, User);
        }

        public virtual void RemoveConnection(HubConnectionContext connection)
        {
            _connections.Remove(connection);
            //await _userTracker.RemoveUser(connection);
        }

        public virtual void Subscribe(TRepository repository)
        {
            throw new NotImplementedException();
        }

        public virtual void Unsubscribe(TRepository repository)
        {
            throw new NotImplementedException();
        }

        protected async Task Notify(Func<THub, Task> invocation)
        {
            foreach (var connection in _connections)
            {
                using (var scope = _serviceScopeFactory.CreateScope())
                {
                    var hubActivator = scope.ServiceProvider.GetRequiredService<IHubActivator<THub>>();
                    var hub = hubActivator.Create();

                    if (_hubContext == null)
                    {
                        // Cannot be injected due to circular dependency
                        _hubContext = _serviceProvider.GetRequiredService<IHubContext<THub>>();
                    }

                    hub.Clients = _hubContext.Clients;
                    hub.Context = new HubCallerContext(connection);
                    hub.Groups = _hubContext.Groups;

                    try
                    {
                        await invocation(hub);
                    }
                    catch (Exception ex)
                    {
                        //_logger.LogWarning(ex, "Presence notification failed.");
                    }
                    finally
                    {
                        hubActivator.Release(hub);
                    }
                }
            }
        }
    }
}
