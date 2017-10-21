using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Threading.Tasks;

namespace Promises.Models
{
    public enum FriendStatus { WAITING = 0, ACCEPTED = 1 };

    public class Friend
    {
        [Key, Column(Order = 0)]
        public string UserId { get; set; }
        [Key, Column(Order = 1)]
        public string FriendId { get; set; }
        [Required]
        public FriendStatus Status { get; set; }
    }
}
