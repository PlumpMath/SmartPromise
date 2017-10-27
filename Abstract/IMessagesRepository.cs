using Promises.Hubs;
using Promises.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Promises.Abstract
{
    public enum MESSAGES_AMOUNT { ALL = 0, TEN, TWENTY };

    public interface IMessagesRepository
    {
        event Action<Message> OnMessageAdded;
        //Todo: User and User as parameters
        event Action<string> OnMessageHistoryRead;
        event Action<User, User> OnHaveUnread;
        
        Message AddMessage(User sender, User reciever, string content, DateTime userDatelLocal, bool isUnread = true);
        Message FindLastMessage(string personOneId, string personTwoId);
        IEnumerable<Message> GetLastMessagesHistory(string userId);
        IEnumerable<Message> GetMessageHistory(string personOneId, string personTwoId, MESSAGES_AMOUNT amount);
        void MarkHistoryAsRead(string ownerId, string friendId);
    }
}
