using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace Promises.Models.CabinetViewModels
{
    public class FriendsModel
    {
        [Required]
        public IEnumerable<User> Friends { get; set; }
        [Required]
        public IEnumerable<User> Others { get; set; }
        [Required]
        public IEnumerable<User> Pending { get; set; }
    }
}
