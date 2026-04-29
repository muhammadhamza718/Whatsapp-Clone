using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using ChatApp.Api.Models;
using ChatApp.Api.Models.DTOs;

namespace ChatApp.Api.Services;

public interface IConversationService
{
    Task<Conversation> GetOrCreateDMAsync(string initiatorUserId, string targetUserId);
    Task<Conversation> CreateGroupAsync(string creatorUserId, string name, List<string> memberIds);
    Task<IEnumerable<ConversationDto>> GetUserConversationsAsync(string userId, int skip, int take);
    Task RenameGroupAsync(Guid conversationId, string userId, string newName);
    Task RemoveMemberAsync(Guid conversationId, string adminUserId, string targetUserId);
    Task<IEnumerable<ConversationMember>> GetMembersAsync(Guid conversationId, string userId);
}
