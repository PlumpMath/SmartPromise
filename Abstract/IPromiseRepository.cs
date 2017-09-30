using Promises.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Promises.Abstract
{
    public interface IPromiseRepository
    {
        IEnumerable<Promise> Promises { get; }
        Promise Get(Guid id);
        void Add(Promise promise);
        Promise Remove(Guid id);
    }
}
