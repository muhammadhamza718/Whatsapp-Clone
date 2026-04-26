using System.ComponentModel.DataAnnotations.Schema;

namespace ChatApp.Api.Models;

[Table("user")]
public class User
{
    public required string Id { get; set; }
    public string? Name { get; set; }
    public string? Email { get; set; }
    public string? Image { get; set; }
    
    public string Status { get; set; } = "offline";
    
    public DateTime LastSeenAt { get; set; } = DateTime.UtcNow;
}
