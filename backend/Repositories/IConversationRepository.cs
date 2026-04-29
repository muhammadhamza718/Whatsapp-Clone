using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using ChatApp.Api.Models;

namespace ChatApp.Api.Repositories;

public interface IConversationRepository
{
    Task<Conversation?> GetByIdAsync(Guid id);
    Task<Conversation?> GetDmConversationAsync(string userId1, string userId2);
    Task<IEnumerable<Conversation>> GetUserConversationsAsync(string userId, int skip, int take);
    Task AddAsync(Conversation conversation);
    void Update(Conversation conversation);
    Task<ConversationMember?> GetMemberAsync(Guid conversationId, string userId);
    Task AddMemberAsync(ConversationMember member);
    void RemoveMember(ConversationMember member);
    Task<bool> IsUserInConversationAsync(Guid conversationId, string userId);
}
