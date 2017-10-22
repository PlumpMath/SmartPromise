using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Threading.Tasks;

namespace Promises.Models
{
    public class Message
    {
        [Required]
        [Key, Column(Order = 0)]
        public string SenderId { get; set; }
        [Required]
        [Key, Column(Order = 1)]
        public string ReceiverId { get; set; }
        [Required]
        [Key, Column(Order = 2)]
        public DateTime ServerDateUtc { get; set; }

        [Required]
        public string SenderEmail { get; set; }
        [Required]
        public string ReceiverEmail { get; set; }
        [Required]
        public DateTime UserDateLocal { get; set; }
        [Required]
        public string Content { get; set; }
        [Required]
        public bool IsUnread { get; set; } 
    }
}
