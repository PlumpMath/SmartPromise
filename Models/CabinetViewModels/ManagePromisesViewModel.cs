using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Threading.Tasks;

namespace Promises.Models.CabinetViewModels
{
    public class ManagePromisesViewModel
    {
        [Required]
        public IEnumerable<Promise> Promises { get; set; }

        //public string StatusMessage { get; set; }
    }
}
