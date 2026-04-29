using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ChatApp.Api.Models;

public class ChatMessage
{
    [Key]
    public int Id { get; set; }

    [Required]
    public Guid ConversationId { get; set; }

    [ForeignKey("ConversationId")]
    public virtual Conversation Conversation { get; set; } = null!;

    [Required]
    public string SenderId { get; set; } = string.Empty;

    [ForeignKey("SenderId")]
    public virtual User Sender { get; set; } = null!;

    [Required]
    public string Content { get; set; } = string.Empty;

    public DateTime Timestamp { get; set; } = DateTime.UtcNow;
}
