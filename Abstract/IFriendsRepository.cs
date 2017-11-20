using Promises.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Promises.Abstract
{
    public interface IFriendsRepository
    {
        //the first one is to be notified the second one who's the initiator
        event Action<User, User> OnFriendshipAccepted;
        event Action<User, User> OnFriendshipRejected;
        event Action<User, User> OnFriendshipRequested;

        IEnumerable<Friend> Friends { get; }
        IEnumerable<string> GetFriends(string UserId);
        IEnumerable<string> GetPendingFriends(string UserId);
        void RemoveFriend(string UserId, string UserFriendId);
        bool AreFriends(string UserId, string UserFriendId);
        bool ArePendingFriends(string UserId, string UserFriendId);
        void RequestFriendship(string UserId, string UserFriendId);
        void RejectFriendship(string UserId, string UserFriendId);
        void AcceptFriendship(string UserId, string UserFriendId);
    }
}
