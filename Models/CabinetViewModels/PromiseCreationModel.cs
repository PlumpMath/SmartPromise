using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Threading.Tasks;

namespace Promises.Models.CabinetViewModels
{
    public class PromiseCreationModel
    {
        [Required]
        public string Content { get; set; }
    }
}
