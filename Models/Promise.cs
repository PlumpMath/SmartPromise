using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Threading.Tasks;

namespace Promises.Models
{
    public enum PromiseComplicity { ONE = 1, TWO, THREE, FOUR, FIFE }
    public enum PROMISE_STATUS { COMPLETED = 1, NOT_COMPLTED = 0, ERROR = -1}
    public class Promise
    {
        public int Id { get; set; }
        public string Title { get; set; }
        public string Content { get; set; }
        public DateTime Date { get; set; }
        public PromiseComplicity Complicity { get; set; }
        public PROMISE_STATUS Status { get; set; }
        public string Proof { get; set; }
    }
}
