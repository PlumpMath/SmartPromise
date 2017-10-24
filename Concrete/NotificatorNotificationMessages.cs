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
        }

        public override void Unsubscribe(IMessagesRepository messagesRepository)
        {
            messagesRepository.OnHaveUnread -= OnHaveUnread;
            messagesRepository.OnMessageHistoryRead -= OnMessageHistoryRead;
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

        public async void OnHaveUnread(User receiver, User sender)
        {
            var onlineUsers = await _userTracker.UsersOnline();
            var receiverConId = onlineUsers.FirstOrDefault(u => u.Owner.Id == receiver.Id)?.ConnectionId;

            await NotifyOne(hub => hub.NotifyHaveUnread(sender), receiverConId);
        }
    }
}
