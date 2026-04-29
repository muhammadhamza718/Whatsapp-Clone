using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using ChatApp.Api.Models.Enums;

namespace ChatApp.Api.Models;

public class Conversation
{
    [Key]
    public Guid Id { get; set; } = Guid.NewGuid();

    public string? Name { get; set; }

    public string? Image { get; set; }

    [Required]
    public ConversationType Type { get; set; }

    [Required]
    public string CreatedById { get; set; } = string.Empty;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    // Navigation Properties
    public virtual ICollection<ConversationMember> Members { get; set; } = new List<ConversationMember>();
    public virtual ICollection<ChatMessage> Messages { get; set; } = new List<ChatMessage>();
}
