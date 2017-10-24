using Microsoft.AspNetCore.SignalR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Promises.Abstract
{
    public interface INotificator<out THub, TRepository>
    {
        void Subscribe(TRepository repository);
        void Unsubscribe(TRepository repository);
        void AddConnection(HubConnectionContext connection);
        void RemoveConnection(HubConnectionContext connection);
    }

    
}
