using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using ChatApp.Api.Data;
using ChatApp.Api.Hubs;
using ChatApp.Api.Models;
using ChatApp.Api.Models.DTOs;
using ChatApp.Api.Models.Enums;
using ChatApp.Api.Repositories;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;

namespace ChatApp.Api.Services;

public class ConversationService : IConversationService
{
    private readonly IConversationRepository _conversationRepository;
    private readonly IUnitOfWork _unitOfWork;
    private readonly AppDbContext _context;
    private readonly IHubContext<PresenceHub> _presenceHubContext;

    public ConversationService(
        IConversationRepository conversationRepository,
        IUnitOfWork unitOfWork,
        AppDbContext context,
        IHubContext<PresenceHub> presenceHubContext)
    {
        _conversationRepository = conversationRepository;
        _unitOfWork = unitOfWork;
        _context = context;
        _presenceHubContext = presenceHubContext;
    }

    public async Task<Conversation> GetOrCreateDMAsync(string initiatorUserId, string targetUserId)
    {
        if (initiatorUserId == targetUserId)
            throw new ArgumentException("Cannot create a DM with yourself.");

        var existingDm = await _conversationRepository.GetDmConversationAsync(initiatorUserId, targetUserId);
        if (existingDm != null)
        {
            return existingDm;
        }

        var usersExist = await _context.Users.CountAsync(u => u.Id == initiatorUserId || u.Id == targetUserId) == 2;
        if (!usersExist)
        {
            throw new ArgumentException("One or both users do not exist.");
        }

        using var transaction = await _unitOfWork.BeginTransactionAsync();
        try
        {
            existingDm = await _conversationRepository.GetDmConversationAsync(initiatorUserId, targetUserId);
            if (existingDm != null)
            {
                return existingDm;
            }

            var conversation = new Conversation
            {
                Type = ConversationType.DM,
                CreatedById = initiatorUserId,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            await _conversationRepository.AddAsync(conversation);
            
            var member1 = new ConversationMember
            {
                ConversationId = conversation.Id,
                UserId = initiatorUserId,
                Role = ConversationRole.Member,
                JoinedAt = DateTime.UtcNow,
                LastReadAt = DateTime.UtcNow
            };

            var member2 = new ConversationMember
            {
                ConversationId = conversation.Id,
                UserId = targetUserId,
                Role = ConversationRole.Member,
                JoinedAt = DateTime.UtcNow,
                LastReadAt = DateTime.UtcNow
            };

            await _conversationRepository.AddMemberAsync(member1);
            await _conversationRepository.AddMemberAsync(member2);

            await _unitOfWork.SaveChangesAsync();
            await transaction.CommitAsync();

            // Notify users via PresenceHub
            await NotifyConversationCreated(conversation.Id, new[] { initiatorUserId, targetUserId });

            return conversation;
        }
        catch
        {
            await transaction.RollbackAsync();
            throw;
        }
    }

    public async Task<IEnumerable<ConversationDto>> GetUserConversationsAsync(string userId, int skip, int take)
    {
        var conversations = await _context.Conversations
            .Include(c => c.Members)
                .ThenInclude(m => m.User)
            .Include(c => c.Messages.OrderByDescending(m => m.Timestamp).Take(1))
            .Where(c => c.Members.Any(m => m.UserId == userId))
            .OrderByDescending(c => c.UpdatedAt)
            .Skip(skip)
            .Take(take)
            .ToListAsync();

        var result = new List<ConversationDto>();

        foreach (var conv in conversations)
        {
            var myMember = conv.Members.First(m => m.UserId == userId);
            var latestMsg = conv.Messages.OrderByDescending(m => m.Timestamp).FirstOrDefault();
            
            var dto = new ConversationDto
            {
                Id = conv.Id,
                Type = conv.Type,
                LatestMessage = latestMsg?.Content,
                LatestMessageTimestamp = latestMsg?.Timestamp,
                UnreadCount = await _context.Messages
                    .CountAsync(m => m.ConversationId == conv.Id && m.Timestamp > myMember.LastReadAt)
            };

            if (conv.Type == ConversationType.DM)
            {
                var targetMember = conv.Members.FirstOrDefault(m => m.UserId != userId);
                if (targetMember != null)
                {
                    dto.Name = targetMember.User.Name;
                    dto.Image = targetMember.User.Image;
                    dto.TargetUserId = targetMember.UserId;
                    dto.TargetUserStatus = targetMember.User.Status;
                }
            }
            else
            {
                dto.Name = conv.Name;
            }

            result.Add(dto);
        }

        return result;
    }

    public async Task<Conversation> CreateGroupAsync(string creatorUserId, string name, List<string> memberIds)
    {
        if (string.IsNullOrWhiteSpace(name))
            throw new ArgumentException("Group name is required.");

        if (memberIds == null || !memberIds.Any())
            throw new ArgumentException("Group must have at least one member besides the creator.");

        using var transaction = await _unitOfWork.BeginTransactionAsync();
        try
        {
            var conversation = new Conversation
            {
                Type = ConversationType.Group,
                Name = name,
                CreatedById = creatorUserId,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            await _conversationRepository.AddAsync(conversation);

            var allMemberIds = memberIds.Distinct().ToList();
            if (!allMemberIds.Contains(creatorUserId)) allMemberIds.Add(creatorUserId);

            foreach (var memberId in allMemberIds)
            {
                var member = new ConversationMember
                {
                    ConversationId = conversation.Id,
                    UserId = memberId,
                    Role = memberId == creatorUserId ? ConversationRole.Admin : ConversationRole.Member,
                    JoinedAt = DateTime.UtcNow,
                    LastReadAt = DateTime.UtcNow
                };
                await _conversationRepository.AddMemberAsync(member);
            }

            await _unitOfWork.SaveChangesAsync();
            await transaction.CommitAsync();

            await NotifyConversationCreated(conversation.Id, allMemberIds);

            return conversation;
        }
        catch
        {
            await transaction.RollbackAsync();
            throw;
        }
    }

    private async Task NotifyConversationCreated(Guid conversationId, IEnumerable<string> userIds)
    {
        foreach (var userId in userIds)
        {
            await _presenceHubContext.Clients.Group(userId).SendAsync("ConversationCreated", conversationId);
        }
    }

    public async Task RenameGroupAsync(Guid conversationId, string userId, string newName)
    {
        var member = await _conversationRepository.GetMemberAsync(conversationId, userId);
        if (member == null || member.Role != ConversationRole.Admin)
            throw new UnauthorizedAccessException("Only admins can rename groups.");

        var conversation = await _conversationRepository.GetByIdAsync(conversationId);
        if (conversation == null || conversation.Type != ConversationType.Group)
            throw new ArgumentException("Invalid group.");

        conversation.Name = newName;
        conversation.UpdatedAt = DateTime.UtcNow;
        _conversationRepository.Update(conversation);
        await _unitOfWork.SaveChangesAsync();
    }

    public async Task RemoveMemberAsync(Guid conversationId, string adminUserId, string targetUserId)
    {
        var adminMember = await _conversationRepository.GetMemberAsync(conversationId, adminUserId);
        if (adminMember == null || adminMember.Role != ConversationRole.Admin)
            throw new UnauthorizedAccessException("Only admins can remove members.");

        var targetMember = await _conversationRepository.GetMemberAsync(conversationId, targetUserId);
        if (targetMember == null)
            throw new ArgumentException("Member not found in group.");

        if (adminUserId == targetUserId)
            throw new ArgumentException("Admins cannot remove themselves.");

        _conversationRepository.RemoveMember(targetMember);
        
        var conversation = await _conversationRepository.GetByIdAsync(conversationId);
        if (conversation != null)
        {
            conversation.UpdatedAt = DateTime.UtcNow;
            _conversationRepository.Update(conversation);
        }

        await _unitOfWork.SaveChangesAsync();
    }

    public async Task<IEnumerable<ConversationMember>> GetMembersAsync(Guid conversationId, string userId)
    {
        var isMember = await _context.ConversationMembers
            .AnyAsync(m => m.ConversationId == conversationId && m.UserId == userId);
        
        if (!isMember)
            throw new UnauthorizedAccessException("You are not a member of this conversation.");

        return await _context.ConversationMembers
            .Include(m => m.User)
            .Where(m => m.ConversationId == conversationId)
            .ToListAsync();
    }
}
