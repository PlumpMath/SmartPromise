using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Identity;
using System.ComponentModel.DataAnnotations.Schema;

namespace Promises.Models
{
    // Add profile data for application users by adding properties to the ApplicationUser class
    public class ApplicationUser : IdentityUser
    {
        //todo Make UserAvatarObject instead of this
        public byte[] Avatar { get; set; }
        public string AvatarContentType { get; set; }
        public string Wif { get; set; }
        public string Address { get; set; }
    }
}
