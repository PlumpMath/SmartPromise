using Promises.Abstract;
using Promises.Data;
using Promises.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Promises.Concrete
{
    public class EFPromiseRepository : IPromiseRepository
    {

        private readonly ApplicationDbContext _applicationContext;

        public EFPromiseRepository(ApplicationDbContext applicationContext)
        {
            _applicationContext = applicationContext;
        }

        public Task<IEnumerable<Promise>> GetPromises(ApplicationUser user)
        {
            return Task.Run(() => _applicationContext.Promises.AsEnumerable());
        }

        public async Task<bool> Add(Promise promise, ApplicationUser user)
        {
            
            Promise result = await Get(promise.Id);
            if (result != null)
            {
                promise.Content = promise.Content;
            }
            else
            {
                _applicationContext.Promises.Add(promise);
            }
            _applicationContext.SaveChanges();
            return true;
        }

        public async Task<bool> Complete(int id)
        {
            var promises = await GetPromises(null);
            var promise = promises.FirstOrDefault(p => p.Id == id);
            promise.Status = PROMISE_STATUS.COMPLETED;

            _applicationContext.Attach(promise);
            _applicationContext.Entry(promise).Property(u => u.Status == PROMISE_STATUS.COMPLETED).IsModified = true;

            _applicationContext.SaveChanges();
            return true;
        }

        public async Task<Promise> Get(int id)
        {
            var promises = await GetPromises(null);
            return promises.FirstOrDefault(rec => rec.Id == id);
        }
    }
}
