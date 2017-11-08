using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Promises.Models
{
    public class Account
    {
        public string privateKey { get; set; }
        public string publicKeyEncoded { get; set; }
        public string publicKeyHash { get; set; }
        public string programHash { get; set; }
        public string address { get; set; }
    }
}
