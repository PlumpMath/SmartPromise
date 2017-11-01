using Promises.Abstract;
using Promises.Data;
using Promises.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Promises.Concrete
{
    public class EFFriendsRepository : IFriendsRepository
    {
        private readonly ApplicationDbContext _applicationContext;

        public event Action<User> OnFriendshipAccepted;
        public event Action<User> OnFriendshipRejected;
        public event Action<User> OnFriendshipRequested;

        private IEnumerable<Friend> Friends
        {
            get
            {
                return _applicationContext.Friends;
            }
        }

        private Friend Find(string UserId, string UserFriendId)
        {
            //it's guaranteed to return only one result, because the both parameters are used as a combined primary key
            return Friends.FirstOrDefault(u => u.UserId == UserId && u.FriendId == UserFriendId);
        }

        public EFFriendsRepository(ApplicationDbContext applicationContext)
        {
            _applicationContext = applicationContext;
        }

        public void AddFriend(string UserId, string UserFriendId)
        {
            var res = Find(UserId, UserFriendId);
            if (res == null)
            {
                _applicationContext.Friends.Add(new Friend
                {
                    UserId = UserId,
                    FriendId = UserFriendId,
                    Status = FriendStatus.ACCEPTED
                });
                _applicationContext.SaveChanges();
            }
            else return;

            //TODO : USE TRIGGER INSTEAD OF THIS
            AddFriend(UserFriendId, UserId);
        }

        public IEnumerable<string> GetFriends(string UserId)
        {
            return Friends.Where(u => u.FriendId == UserId).Select(u => u.UserId);
        }

        public void RemoveFriend(string UserId, string UserFriendId)
        {
            var res = Find(UserId, UserFriendId);
            
            if (res != null)
            {
                _applicationContext.Friends.Remove(res);
                _applicationContext.SaveChanges();
            }
            else return;

            //TODO : USE TRIGGER INSTEAD OF THIS
            RemoveFriend(UserFriendId, UserId);
        }

        public bool AreFriends(string UserId, string UserFriendId)
        {
            var one = Find(UserId, UserFriendId);
            var two = Find(UserFriendId, UserId);
            return (null != one && one.Status == FriendStatus.ACCEPTED) 
                && (null != two && two.Status == FriendStatus.ACCEPTED);
        }

        public bool ArePendingFriends(string UserId, string UserFriendId)
        {

            var one = Find(UserId, UserFriendId);
            var two = Find(UserFriendId, UserId);
            return (null != one && one.Status == FriendStatus.WAITING) && 
                (null != two && two.Status == FriendStatus.WAITING);
        }

        public void AcceptFriendship(string UserId, string UserFriendId)
        {
            var one = Find(UserId, UserFriendId);
            var two = Find(UserFriendId, UserId);

            one.Status = FriendStatus.ACCEPTED;
            two.Status = FriendStatus.ACCEPTED;

            _applicationContext.Attach(one);
            _applicationContext.Entry(one).Property(u => u.Status).IsModified = true;
            _applicationContext.Attach(two);
            _applicationContext.Entry(two).Property(u => u.Status).IsModified = true;

            _applicationContext.SaveChanges();

        }

        public void RejectFriendship(string UserId, string UserFriendId)
        {
            var res = Find(UserId, UserFriendId);

            if (res != null)
            {
                _applicationContext.Friends.Remove(res);
                _applicationContext.SaveChanges();
            }
            else return;

            //TODO : USE TRIGGER INSTEAD OF THIS
            RemoveFriend(UserFriendId, UserId);
        }

        public void RequestFriendship(string UserId, string UserFriendId)
        {
            var res = Find(UserId, UserFriendId);
            if (res == null)
            {
                _applicationContext.Friends.Add(new Friend
                {
                    UserId = UserId,
                    FriendId = UserFriendId,
                    Status = FriendStatus.WAITING
                });
                _applicationContext.SaveChanges();
            }
            else return;

            //TODO : USE TRIGGER INSTEAD OF THIS
            RequestFriendship(UserFriendId, UserId);
        }
    }
}
