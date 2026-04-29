using System;
using System.Threading.Tasks;
using Microsoft.AspNetCore.SignalR;
using ChatApp.Api.Models;
using ChatApp.Api.Data;
using ChatApp.Api.Repositories;
using ChatApp.Api.Models.Enums;
using Microsoft.EntityFrameworkCore;
using System.Linq;

namespace ChatApp.Api.Hubs;

public class ChatHub : Hub
{
    private readonly AppDbContext _context;
    private readonly IUnitOfWork _unitOfWork;
    private readonly IHubContext<PresenceHub> _presenceHubContext;

    public ChatHub(AppDbContext context, IUnitOfWork unitOfWork, IHubContext<PresenceHub> presenceHubContext)
    {
        _context = context;
        _unitOfWork = unitOfWork;
        _presenceHubContext = presenceHubContext;
    }

    public async Task JoinConversation(Guid conversationId)
    {
        await Groups.AddToGroupAsync(Context.ConnectionId, conversationId.ToString());
    }

    public async Task LeaveConversation(Guid conversationId)
    {
        await Groups.RemoveFromGroupAsync(Context.ConnectionId, conversationId.ToString());
    }

    [HubMethodName("SendMessage")]
    public async Task SendMessage(Guid conversationId, string senderId, string content)
    {
        var message = new ChatMessage
        {
            ConversationId = conversationId,
            SenderId = senderId,
            Content = content,
            Timestamp = DateTime.UtcNow
        };

        _context.Messages.Add(message);

        var conversation = await _context.Conversations
            .Include(c => c.Members)
            .FirstOrDefaultAsync(c => c.Id == conversationId);

        if (conversation != null)
        {
            conversation.UpdatedAt = DateTime.UtcNow;
        }

        await _unitOfWork.SaveChangesAsync();

        var broadcastMsg = new {
            message.Id,
            message.ConversationId,
            message.SenderId,
            message.Content,
            message.Timestamp
        };

        // 1. Broadcast to the active chat window
        await Clients.Group(conversationId.ToString()).SendAsync("ReceiveMessage", broadcastMsg);

        // 2. Broadcast to all members' sidebars via PresenceHub
        if (conversation != null)
        {
            foreach (var member in conversation.Members)
            {
                await _presenceHubContext.Clients.Group(member.UserId).SendAsync("MessageReceived", broadcastMsg);
            }
        }
    }
}
