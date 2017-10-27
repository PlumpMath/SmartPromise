using Promises.Abstract;
using Promises.Hubs;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.Extensions.DependencyInjection;
using Promises.Models;

namespace Promises.Concrete
{
    public class NotificatorNotificationMessages : DefaultNotificator<Notification, IMessagesRepository>
    {
        private readonly IUserTracker<Notification> _userTracker;

        public NotificatorNotificationMessages(
            IServiceScopeFactory serviceScopeFactory, 
            IServiceProvider serviceProvider,
            IUserTracker<Notification> userTracker) : 
            base(serviceScopeFactory, serviceProvider)
        {
            _userTracker = userTracker;
        }

        public override void Subscribe(IMessagesRepository messagesRepository)
        {
            messagesRepository.OnHaveUnread += OnHaveUnread;
            messagesRepository.OnMessageHistoryRead += OnMessageHistoryRead;
            messagesRepository.OnMessageAdded += OnMessageAdded;
        }

        public override void Unsubscribe(IMessagesRepository messagesRepository)
        {
            messagesRepository.OnHaveUnread -= OnHaveUnread;
            messagesRepository.OnMessageHistoryRead -= OnMessageHistoryRead;
            messagesRepository.OnMessageAdded -= OnMessageAdded; 
        }
        
        public async void OnMessageAdded(Message mes)
        {
            var receiverConId = await GetConId(mes.ReceiverId);
            
            await NotifyOne(hub => hub.OnMessageAdded(mes), receiverConId);
        }

        private async Task<string> GetConId(string id)
        {
            var onlineUsers = await _userTracker.UsersOnline();
            return onlineUsers.FirstOrDefault(u => u.Owner.Id == id)?.ConnectionId;
        }

        public async void OnMessageHistoryRead(string friendId)
        {
            var friendConId = await GetConId(friendId);
            
            if (friendConId != null)
                await NotifyOne(hub => hub.OnMessageHistoryRead(), friendConId);
        }

        public async void OnHaveUnread(User receiver, User sender)
        {
            var onlineUsers = await _userTracker.UsersOnline();
            var receiverConId = onlineUsers.FirstOrDefault(u => u.Owner.Id == receiver.Id)?.ConnectionId;

            await NotifyOne(hub => hub.NotifyHaveUnread(sender), receiverConId);
        }
    }
}
