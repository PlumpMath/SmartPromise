using Promises.Abstract;
using System;
using System.Collections.Generic;
using System.Linq;
using Promises.Data;
using Promises.Models;

namespace Promises.Concrete
{
    public class EFMessagesRepository : IMessagesRepository
    {
        public event Action<Message> OnMessageAdded;

        private readonly ApplicationDbContext _applicationContext;

        private IEnumerable<Message> Messages
        {
            get
            {
                return _applicationContext.Messages;
            }
        }

        public EFMessagesRepository(ApplicationDbContext applicationContext)
        {
            _applicationContext = applicationContext;
        }

        public void AddMessage(string senderId, string recieverId, string content, DateTime userDatelLocal)
        {
            try
            {
                var message = new Message
                {
                    SenderId = senderId,
                    ReceiverId = recieverId,
                    Content = content,
                    ServerDateUtc = DateTime.UtcNow,
                    UserDateLocal = userDatelLocal,
                    IsUnread = false
                };
                _applicationContext.Messages.Add(message);
                _applicationContext.SaveChanges();
                OnMessageAdded(message);
            }
            catch (Exception)
            {}
        }

        public Message FindLastMessage(string userOneId, string userTwoId)
        {
            return GetMessageHistory(userOneId, userTwoId).OrderBy(m => m.ServerDateUtc).FirstOrDefault();
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
    }
}
