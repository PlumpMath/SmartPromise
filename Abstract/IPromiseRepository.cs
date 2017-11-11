using Promises.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Promises.Abstract
{
    public interface IPromiseRepository
    {
        Task<IEnumerable<Promise>> GetPromises(ApplicationUser user);
        Task<Promise> Get(Guid id);
        Task<bool> Add(Promise promise, ApplicationUser user);
        Task<bool> Complete(Guid id);
    }
}
