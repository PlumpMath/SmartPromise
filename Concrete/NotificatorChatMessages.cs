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
        
        public NotificatorChatMessages(
            IServiceScopeFactory serviceScopeFactory,
            IServiceProvider serviceProvider
        ) : base(serviceScopeFactory, serviceProvider)
        {}
        
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

        public async void OnMessageHistoryRead(string personOneId, string personTwoId)
        {
            await Notify(hub => hub.OnMessageHistoryRead(personOneId, personTwoId));    
        }
    }
}
