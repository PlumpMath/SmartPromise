using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Promises.Models.CabinetViewModels
{
    public class ProfileViewModel
    {
        public string Address { get; set; }
        public string Email { get; set; } 
        public bool IsYourProfile { get; set; }
        public string Id { get; set; }
        public bool IsFriend { get; set; }
        public bool IsOnline { get; set; }
    }
}
