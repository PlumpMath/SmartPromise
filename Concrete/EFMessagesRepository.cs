using Promises.Abstract;
using System;
using System.Collections.Generic;
using System.Linq;
using Promises.Data;
using Promises.Models;
using Microsoft.AspNetCore.Identity;
using Promises.Hubs;

namespace Promises.Concrete
{
    public class EFMessagesRepository : IMessagesRepository, IDisposable
    {
        public event Action<Message> OnMessageAdded;
        public event Action<string> OnMessageHistoryRead;
        public event Action<User, User> OnHaveUnread;

        private readonly INotificator<Chat, IMessagesRepository> _notificatorChat;
        private readonly INotificator<Notification, IMessagesRepository> _notificatorNotification;
        private readonly ApplicationDbContext _applicationContext;
        private readonly UserManager<ApplicationUser> _userManager;

        private IEnumerable<Message> Messages
        {
            get
            {
                return _applicationContext.Messages;
            }
        }

        public IEnumerable<Message> GetLastMessagesHistory(string userId)
        {
            return _userManager.Users
                .Select(u => FindLastMessage(userId, u.Id))
                .Where(u => u != default(Message));
        }

        public EFMessagesRepository(
            ApplicationDbContext applicationContext, 
            UserManager<ApplicationUser> userManager,
            INotificator<Chat, IMessagesRepository> notificatorChat,
            INotificator<Notification, IMessagesRepository> notificatorNotification)
        {
            _userManager = userManager;
            _applicationContext = applicationContext;
            _notificatorChat = notificatorChat;
            _notificatorNotification = notificatorNotification;

            _notificatorChat.Subscribe(this);
            _notificatorNotification.Subscribe(this);
        }
        
        public Message AddMessage(
            User sender, User reciever, 
            string content, DateTime userDatelLocal, 
            bool isUnread = true)
        {
            try
            {
                var message = new Message
                {
                    SenderId = sender.Id,
                    ReceiverId = reciever.Id,
                    SenderEmail = sender.Email,
                    ReceiverEmail = reciever.Email,
                    Content = content,
                    ServerDateUtc = DateTime.UtcNow,
                    UserDateLocal = userDatelLocal,
                    IsUnread = isUnread
                };
                _applicationContext.Messages.Add(message);
                _applicationContext.SaveChanges();
                OnMessageAdded?.Invoke(message);
                if (isUnread)
                {
                    OnHaveUnread?.Invoke(reciever, sender);
                }
                return message;
            }
            catch (Exception)
            {
                return null;
            }
            
        }

        public Message FindLastMessage(string userOneId, string userTwoId)
        {
            return GetMessageHistory(userOneId, userTwoId)
                .OrderByDescending(m => m.ServerDateUtc)
                .FirstOrDefault();
        }

        private Int32 GetAmount(MESSAGES_AMOUNT amount)
        {
            switch (amount)
            {
                case MESSAGES_AMOUNT.ALL:
                    return Int32.MaxValue;
                case MESSAGES_AMOUNT.TEN:
                    return 10;
                case MESSAGES_AMOUNT.TWENTY:
                    return 20;
                default:
                    return 0;
            }
        }
        public IEnumerable<Message> GetMessageHistory(
            string userOneId,
            string userTwoId,
            MESSAGES_AMOUNT amount = MESSAGES_AMOUNT.ALL)
        {
            return Messages.Where(m =>
                (m.SenderId == userOneId && m.ReceiverId == userTwoId) ||
                (m.SenderId == userTwoId && m.ReceiverId == userOneId)).Take(GetAmount(amount));
        }

        public int GetUnreadAmount(string userId)
        {
            return Messages.Where(u => u.ReceiverId == userId && u.IsUnread == true).Count();
        }

        public void MarkHistoryAsRead(string ownerId, string friendId)
        {
            var messageHistory = GetMessageHistory(ownerId, friendId);

            //check if there are unread messages
            if (messageHistory.FirstOrDefault(u => u.SenderId == friendId && u.IsUnread == true) == null)
                return;

            GetMessageHistory(ownerId, friendId).ToList().ForEach(m => {
                m.IsUnread = false;
                _applicationContext.Attach(m);
                _applicationContext.Entry(m).Property(u => u.IsUnread).IsModified = true;
            });

            _applicationContext.SaveChanges();

            OnMessageHistoryRead?.Invoke(friendId);
        }

        public void Dispose()
        {
            _notificatorChat.Unsubscribe(this);
            _notificatorNotification.Unsubscribe(this);
        }
    }
}
