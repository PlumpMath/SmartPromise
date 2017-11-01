using Promises.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Promises.Abstract
{
    public interface IFriendsRepository
    {
        event Action<User> OnFriendshipAccepted;
        event Action<User> OnFriendshipRejected;
        event Action<User> OnFriendshipRequested;
        
        IEnumerable<string> GetFriends(string UserId);
        void AddFriend(string UserId, string UserFriendId);
        void RemoveFriend(string UserId, string UserFriendId);
        bool AreFriends(string UserId, string UserFriendId);
        bool ArePendingFriends(string UserId, string UserFriendId);
        void RequestFriendship(string UserId, string UserFriendId);
        void RejectFriendship(string UserId, string UserFriendId);
        void AcceptFriendship(string UserId, string UserFriendId);
    }
}
