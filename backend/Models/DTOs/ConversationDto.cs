using ChatApp.Api.Models.Enums;

namespace ChatApp.Api.Models.DTOs;

public class ConversationDto
{
    public Guid Id { get; set; }
    public ConversationType Type { get; set; }
    public string? Name { get; set; }
    public string? Image { get; set; }
    public string? LatestMessage { get; set; }
    public DateTime? LatestMessageTimestamp { get; set; }
    public int UnreadCount { get; set; }
    public string? TargetUserId { get; set; }
    public string? TargetUserStatus { get; set; }
}
