using Promises.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Promises.Abstract
{
    public interface IFriendsRepository
    {
        IEnumerable<string> GetFriends(string UserId);
        void AddFriend(string UserId, string UserFriendId);
        void RemoveFriend(string UserId, string UserFriendId);
        bool AreFriends(string UserId, string UserFriendId);
    }
}
