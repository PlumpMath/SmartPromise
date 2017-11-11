using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Threading.Tasks;

namespace Promises.Models
{
    public enum PromiseComplicity { ONE = 1, TWO, THREE, FOUR, FIFE }
    public class Promise
    {
        public Guid Id { get; set; }
        public string Title { get; set; }
        public string Content { get; set; }
        public DateTime Date { get; set; }
        public PromiseComplicity Complicity { get; set; }
    }
}
