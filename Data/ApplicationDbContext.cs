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
            modelBuilder.Entity<Friend>()
                .HasKey(f => new { f.FriendId, f.UserId });

            modelBuilder.Entity<Message>()
                .HasKey(m => new { m.SenderId , m.ReceiverId, m.ServerDateUtc });
        }

        public DbSet<Message> Messages { get; set; } 
        public DbSet<Promise> Promises { get; set; }
        public DbSet<Friend> Friends { get; set; }
    }
}
