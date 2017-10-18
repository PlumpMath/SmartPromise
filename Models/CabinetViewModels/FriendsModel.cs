using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace Promises.Models.CabinetViewModels
{
    public class FriendsModel
    {
        public IEnumerable<User> Friends { get; set; }

        [Required]
        public IEnumerable<User> Users { get; set; } 
    }
}
