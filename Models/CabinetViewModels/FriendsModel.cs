using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace Promises.Models.CabinetViewModels
{
    public class User
    {
        [Required]
        public string Email { get; set; }        
    }
    
    public class FriendsModel
    {
        [Required]
        public IEnumerable<User> Users { get; set; } 
    }
}
