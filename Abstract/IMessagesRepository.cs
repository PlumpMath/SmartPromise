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
        
        void AddMessage(string senderId, string recieverId, string content, DateTime userDatelLocal);
        Message FindLastMessage(string personOneId, string personTwoId);
        IEnumerable<Message> GetMessageHistory(string personOneId, string personTwoId, MESSAGES_AMOUNT amount);
    }
}
