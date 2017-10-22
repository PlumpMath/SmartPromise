using System.ComponentModel.DataAnnotations;

namespace Promises.Models
{
    public class UserDetails
    {
        [Required]
        public string ConnectionId { get; set; }
        [Required]
        public User Owner { get; set; }
    }
}
