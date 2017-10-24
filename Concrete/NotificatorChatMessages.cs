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
        private readonly IUserTracker<Chat> _userTracker;

        public NotificatorChatMessages(
            IUserTracker<Chat> userTracker, 
            IServiceScopeFactory serviceScopeFactory,
            IServiceProvider serviceProvider
        ) : base(serviceScopeFactory, serviceProvider)
        {
            _userTracker = userTracker;
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
            var onlineUsers = await _userTracker.UsersOnline();

            //Check they are even online
            var excepts = onlineUsers
                .Where(u => u.Owner.Id != message.SenderId && u.Owner.Id != message.ReceiverId)
                .Select(u => u.ConnectionId);
            
            await Notify(hub => hub.Send(message), excepts);
        }

        public async void OnMessageHistoryRead(string personOneId, string personTwoId)
        {
            var onlineUsers = await _userTracker.UsersOnline();
            var personOneConId = onlineUsers.FirstOrDefault(u => u.Owner.Id == personOneId)?.ConnectionId;
            var personTwoConId = onlineUsers.FirstOrDefault(u => u.Owner.Id == personTwoId)?.ConnectionId;

            if (personOneConId != null)
                await NotifyOne(hub => hub.OnMessageHistoryRead(), personOneConId);
            if (personTwoConId != null)
                await NotifyOne(hub => hub.OnMessageHistoryRead(), personTwoConId);
        }
    }
}
