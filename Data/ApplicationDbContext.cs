using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Promises.Models;

namespace Promises.Data
{
    public class ApplicationDbContext : DbContext
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
            : base(options)
        { }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<Friends>()
                .HasKey(c => new { c.FriendId, c.UserId });
        }

        public DbSet<Promise> Promises { get; set; }
        public DbSet<Friends> Friends { get; set; }
    }
}
