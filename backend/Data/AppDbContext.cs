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
    public DbSet<User> Users => Set<User>();
    public DbSet<Conversation> Conversations => Set<Conversation>();
    public DbSet<ConversationMember> ConversationMembers => Set<ConversationMember>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);
        
        // ChatMessage configurations
        modelBuilder.Entity<ChatMessage>()
            .HasIndex(m => m.Timestamp);
        modelBuilder.Entity<ChatMessage>()
            .HasIndex(m => m.ConversationId);

        // ConversationMember configurations (Composite index for quick membership checks)
        modelBuilder.Entity<ConversationMember>()
            .HasIndex(cm => new { cm.ConversationId, cm.UserId })
            .IsUnique();
        
        modelBuilder.Entity<ConversationMember>()
            .HasIndex(cm => cm.UserId);

        // Conversation configurations
        modelBuilder.Entity<Conversation>()
            .HasIndex(c => c.UpdatedAt);
        
        // Relationships
        modelBuilder.Entity<ConversationMember>()
            .HasOne(cm => cm.Conversation)
            .WithMany(c => c.Members)
            .HasForeignKey(cm => cm.ConversationId);

        modelBuilder.Entity<ConversationMember>()
            .HasOne(cm => cm.User)
            .WithMany()
            .HasForeignKey(cm => cm.UserId);

        modelBuilder.Entity<ChatMessage>()
            .HasOne(m => m.Conversation)
            .WithMany(c => c.Messages)
            .HasForeignKey(m => m.ConversationId);

        modelBuilder.Entity<ChatMessage>()
            .HasOne(m => m.Sender)
            .WithMany()
            .HasForeignKey(m => m.SenderId);
    }
}
