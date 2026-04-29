using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using ChatApp.Api.Data;
using ChatApp.Api.Models;
using ChatApp.Api.Models.Enums;

namespace ChatApp.Api.Repositories;

public class ConversationRepository : IConversationRepository
{
    private readonly AppDbContext _context;

    public ConversationRepository(AppDbContext context)
    {
        _context = context ?? throw new ArgumentNullException(nameof(context));
    }

    public async Task<Conversation?> GetByIdAsync(Guid id)
    {
        return await _context.Conversations
            .Include(c => c.Members)
            .FirstOrDefaultAsync(c => c.Id == id);
    }

    public async Task<Conversation?> GetDmConversationAsync(string userId1, string userId2)
    {
        // A DM is a conversation of type DM where both users are members.
        return await _context.Conversations
            .Include(c => c.Members)
            .Where(c => c.Type == ConversationType.DM)
            .Where(c => c.Members.Any(m => m.UserId == userId1) && c.Members.Any(m => m.UserId == userId2))
            .FirstOrDefaultAsync();
    }

    public async Task<IEnumerable<Conversation>> GetUserConversationsAsync(string userId, int skip, int take)
    {
        return await _context.Conversations
            .Include(c => c.Members)
            .Where(c => c.Members.Any(m => m.UserId == userId))
            .OrderByDescending(c => c.UpdatedAt)
            .Skip(skip)
            .Take(take)
            .ToListAsync();
    }

    public async Task AddAsync(Conversation conversation)
    {
        await _context.Conversations.AddAsync(conversation);
    }

    public void Update(Conversation conversation)
    {
        _context.Conversations.Update(conversation);
    }

    public async Task<ConversationMember?> GetMemberAsync(Guid conversationId, string userId)
    {
        return await _context.ConversationMembers
            .FirstOrDefaultAsync(m => m.ConversationId == conversationId && m.UserId == userId);
    }

    public async Task AddMemberAsync(ConversationMember member)
    {
        await _context.ConversationMembers.AddAsync(member);
    }

    public void RemoveMember(ConversationMember member)
    {
        _context.ConversationMembers.Remove(member);
    }

    public async Task<bool> IsUserInConversationAsync(Guid conversationId, string userId)
    {
        return await _context.ConversationMembers
            .AnyAsync(m => m.ConversationId == conversationId && m.UserId == userId);
    }
}
