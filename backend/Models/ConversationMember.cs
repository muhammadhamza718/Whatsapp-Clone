using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using ChatApp.Api.Models.Enums;

namespace ChatApp.Api.Models;

public class ConversationMember
{
    [Key]
    public Guid Id { get; set; } = Guid.NewGuid();

    [Required]
    public Guid ConversationId { get; set; }
    
    [ForeignKey("ConversationId")]
    public virtual Conversation Conversation { get; set; } = null!;

    [Required]
    public string UserId { get; set; } = string.Empty;
    
    [ForeignKey("UserId")]
    public virtual User User { get; set; } = null!;

    [Required]
    public ConversationRole Role { get; set; } = ConversationRole.Member;

    public DateTime JoinedAt { get; set; } = DateTime.UtcNow;

    public DateTime LastReadAt { get; set; } = DateTime.UtcNow;
}
