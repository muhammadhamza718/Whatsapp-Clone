using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ChatApp.Api.Data;
using ChatApp.Api.Models;
using ChatApp.Api.Models.Enums;
using ChatApp.Api.Models.DTOs;
using ChatApp.Api.Services;

namespace ChatApp.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ConversationsController : ControllerBase
{
    private readonly IConversationService _conversationService;
    private readonly AppDbContext _context;

    public ConversationsController(IConversationService conversationService, AppDbContext context)
    {
        _conversationService = conversationService;
        _context = context;
    }

    [HttpPost("dm")]
    public async Task<IActionResult> GetOrCreateDM([FromBody] CreateDmRequest request)
    {
        var initiatorUserId = Request.Headers["X-User-Id"].ToString();
        if (string.IsNullOrEmpty(initiatorUserId))
        {
            return Unauthorized("X-User-Id header is required.");
        }

        if (string.IsNullOrEmpty(request.TargetUserId))
        {
            return BadRequest("TargetUserId is required.");
        }

        try
        {
            var conversation = await _conversationService.GetOrCreateDMAsync(initiatorUserId, request.TargetUserId);
            return Ok(conversation);
        }
        catch (ArgumentException ex)
        {
            return BadRequest(ex.Message);
        }
        catch (Exception ex)
        {
            return StatusCode(500, $"Internal server error: {ex.Message}");
        }
    }

    [HttpGet]
    public async Task<IActionResult> GetUserConversations([FromQuery] int skip = 0, [FromQuery] int take = 20)
    {
        var userId = Request.Headers["X-User-Id"].ToString();
        if (string.IsNullOrEmpty(userId))
        {
            return Unauthorized("X-User-Id header is required.");
        }

        try
        {
            var conversations = await _conversationService.GetUserConversationsAsync(userId, skip, take);
            return Ok(conversations);
        }
        catch (Exception ex)
        {
            return StatusCode(500, $"Internal server error: {ex.Message}");
        }
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetConversation(Guid id)
    {
        var userId = Request.Headers["X-User-Id"].ToString();
        if (string.IsNullOrEmpty(userId))
        {
            return Unauthorized("X-User-Id header is required.");
        }

        try
        {
            var conversation = await _context.Conversations
                .Include(c => c.Members)
                    .ThenInclude(m => m.User)
                .FirstOrDefaultAsync(c => c.Id == id && c.Members.Any(m => m.UserId == userId));

            if (conversation == null)
                return NotFound();

            var dto = new ConversationDto
            {
                Id = conversation.Id,
                Type = conversation.Type,
                Name = conversation.Name,
                Image = conversation.Image
            };

            if (conversation.Type == ConversationType.DM)
            {
                var targetMember = conversation.Members.FirstOrDefault(m => m.UserId != userId);
                if (targetMember != null)
                {
                    dto.Name = targetMember.User.Name;
                    dto.Image = targetMember.User.Image;
                    dto.TargetUserId = targetMember.UserId;
                    dto.TargetUserStatus = targetMember.User.Status;
                }
            }

            return Ok(dto);
        }
        catch (Exception ex)
        {
            return StatusCode(500, $"Internal server error: {ex.Message}");
        }
    }

    [HttpPost("group")]
    public async Task<IActionResult> CreateGroup([FromBody] CreateGroupRequest request)
    {
        var userId = Request.Headers["X-User-Id"].ToString();
        if (string.IsNullOrEmpty(userId))
        {
            return Unauthorized("X-User-Id header is required.");
        }

        try
        {
            var conversation = await _conversationService.CreateGroupAsync(userId, request.Name, request.MemberIds);
            return Ok(conversation);
        }
        catch (ArgumentException ex)
        {
            return BadRequest(ex.Message);
        }
        catch (Exception ex)
        {
            return StatusCode(500, $"Internal server error: {ex.Message}");
        }
    }

    [HttpPatch("{id}/rename")]
    public async Task<IActionResult> RenameGroup(Guid id, [FromBody] RenameGroupRequest request)
    {
        var userId = Request.Headers["X-User-Id"].ToString();
        if (string.IsNullOrEmpty(userId))
        {
            return Unauthorized("X-User-Id header is required.");
        }

        try
        {
            await _conversationService.RenameGroupAsync(id, userId, request.NewName);
            return Ok(new { message = "Group renamed successfully" });
        }
        catch (UnauthorizedAccessException ex)
        {
            return Forbid(ex.Message);
        }
        catch (ArgumentException ex)
        {
            return BadRequest(ex.Message);
        }
        catch (Exception ex)
        {
            return StatusCode(500, $"Internal server error: {ex.Message}");
        }
    }

    [HttpDelete("{id}/members/{targetUserId}")]
    public async Task<IActionResult> RemoveMember(Guid id, string targetUserId)
    {
        var userId = Request.Headers["X-User-Id"].ToString();
        if (string.IsNullOrEmpty(userId))
        {
            return Unauthorized("X-User-Id header is required.");
        }

        try
        {
            await _conversationService.RemoveMemberAsync(id, userId, targetUserId);
            return Ok(new { message = "Member removed successfully" });
        }
        catch (UnauthorizedAccessException ex)
        {
            return Forbid(ex.Message);
        }
        catch (ArgumentException ex)
        {
            return BadRequest(ex.Message);
        }
        catch (Exception ex)
        {
            return StatusCode(500, $"Internal server error: {ex.Message}");
        }
    }

    [HttpGet("{id}/members")]
    public async Task<IActionResult> GetConversationMembers(Guid id)
    {
        var userId = Request.Headers["X-User-Id"].ToString();
        if (string.IsNullOrEmpty(userId))
        {
            return Unauthorized("X-User-Id header is required.");
        }

        try
        {
            var members = await _conversationService.GetMembersAsync(id, userId);
            var result = members.Select(m => new {
                m.UserId,
                m.Role,
                User = new {
                    m.User.Id,
                    m.User.Name,
                    m.User.Email,
                    m.User.Image,
                    m.User.Status
                }
            });
            return Ok(result);
        }
        catch (UnauthorizedAccessException ex)
        {
            return Forbid(ex.Message);
        }
        catch (Exception ex)
        {
            return StatusCode(500, $"Internal server error: {ex.Message}");
        }
    }

    [HttpPost("{id}/read")]
    public async Task<IActionResult> MarkAsRead(Guid id)
    {
        var userId = Request.Headers["X-User-Id"].ToString();
        if (string.IsNullOrEmpty(userId))
        {
            return Unauthorized("X-User-Id header is required.");
        }

        try
        {
            var member = await _context.ConversationMembers
                .FirstOrDefaultAsync(m => m.ConversationId == id && m.UserId == userId);
            
            if (member == null)
                return NotFound();

            member.LastReadAt = DateTime.UtcNow;
            await _context.SaveChangesAsync();

            return Ok(new { message = "Conversation marked as read" });
        }
        catch (Exception ex)
        {
            return StatusCode(500, $"Internal server error: {ex.Message}");
        }
    }
}

public class CreateDmRequest
{
    public string TargetUserId { get; set; } = string.Empty;
}

public class CreateGroupRequest
{
    public string Name { get; set; } = string.Empty;
    public List<string> MemberIds { get; set; } = new();
}

public class RenameGroupRequest
{
    public string NewName { get; set; } = string.Empty;
}
