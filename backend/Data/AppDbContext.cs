using Microsoft.EntityFrameworkCore;
using ChatApp.Api.Models;

namespace ChatApp.Api.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options)
        : base(options)
    {
    }

    public DbSet<ChatMessage> Messages => Set<ChatMessage>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);
        
        modelBuilder.Entity<ChatMessage>()
            .HasIndex(m => m.Timestamp);
    }
}
