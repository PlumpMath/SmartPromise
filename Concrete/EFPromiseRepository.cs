﻿using Promises.Abstract;
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

        public IEnumerable<Promise> Promises
        {
            get
            {
                return _applicationContext.Promises;
            }
        }

        public void Add(Promise promise)
        {
            
            Promise result = Get(promise.Id);
            if (result != null)
            {
                promise.Content = promise.Content;
            }
            else
            {
                _applicationContext.Promises.Add(promise);
            }
            _applicationContext.SaveChanges();
            
        }

        public Promise Get(Guid id)
        {
            return Promises.FirstOrDefault(rec => rec.Id == id);
        }

        public Promise Remove(Guid id)
        {
            Promise promise = Get(id);
            if (promise != null)
            {
                _applicationContext.Promises.Remove(promise);
                _applicationContext.SaveChanges();
            }
            return promise;
        }
    }
}