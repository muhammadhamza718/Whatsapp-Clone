using System;
using System.ComponentModel.DataAnnotations;

namespace ChatApp.Api.Models;

public class ChatMessage
{
    [Key]
    public int Id { get; set; }

    [Required]
    public string Sender { get; set; } = string.Empty;

    [Required]
    public string Content { get; set; } = string.Empty;

    public DateTime Timestamp { get; set; } = DateTime.UtcNow;
}
