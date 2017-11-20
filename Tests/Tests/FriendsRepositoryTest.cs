using Microsoft.VisualStudio.TestTools.UnitTesting;
using Promises.Abstract;
using Moq;
using Promises.Models;
using System.Collections.Generic;

namespace Tests
{
    [TestClass]
    public class FriendsRepositoryTest
    {
        [TestMethod]
        public void TestMethod1()
        {
            var moqRepo = new Mock<IFriendsRepository>();

            var mockFriends = new List<Friend>
            {
                new Friend { },
                new Friend { },
                new Friend { }
            };

            moqRepo.Setup(o => o.Friends).Returns(mockFriends);
            Assert.AreEqual(moqRepo.Object.Friends.Equals(mockFriends), true);
        }
    }
}
