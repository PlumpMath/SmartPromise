using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Promises.Models.CabinetViewModels
{
    public class PrivateChatViewModel
    {
        public User OwnerUser { get; set; }
        public User User { get; set; }
    }
}
