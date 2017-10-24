using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.SignalR;
using Microsoft.Extensions.DependencyInjection;
using Promises.Abstract;
using Promises.Hubs;
using Promises.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Promises.Concrete
{
    public class NotificatorChatMessages : DefaultNotificator<Chat, IMessagesRepository>
    {
        private readonly IUserTracker _userTracker;
        
        public NotificatorChatMessages(
            IUserTracker userTracker, 
            IServiceScopeFactory serviceScopeFactory,
            IServiceProvider serviceProvider
        ) : base(serviceScopeFactory, serviceProvider)
        {
            _userTracker = userTracker;
            //_messagesRepository.OnMessageHistoryRead += OnMessageHistoryRead;
        }
        
        public override void Subscribe(IMessagesRepository messagesRepository)
        {
            messagesRepository.OnMessageHistoryRead += OnMessageHistoryRead;
            messagesRepository.OnMessageAdded += OnMessageAdded;
        }

        public override void Unsubscribe(IMessagesRepository messagesRepository)
        {
            messagesRepository.OnMessageHistoryRead -= OnMessageHistoryRead;
            messagesRepository.OnMessageAdded -= OnMessageAdded;
        }

        public async void OnMessageAdded(Message message)
        {
            await Notify(hub => hub.Send(message));
        }

        public async void OnMessageHistoryRead()
        {
            await Notify(hub => hub.OnMessageHistoryRead());    
        }
    }
}
