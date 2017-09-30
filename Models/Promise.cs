using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Threading.Tasks;

namespace Promises.Models
{
    public class Promise
    {
        public Guid Id { get; set; }
        public string Content { get; set; }
    }
}
