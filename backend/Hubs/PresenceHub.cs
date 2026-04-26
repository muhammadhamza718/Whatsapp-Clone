using Microsoft.AspNetCore.SignalR;
using ChatApp.Api.Data;
using Microsoft.EntityFrameworkCore;
using System.Collections.Concurrent;

namespace ChatApp.Api.Hubs;

public class PresenceHub : Hub
{
    private readonly AppDbContext _context;
    
    // Expert Tracker: Tracks which UserIDs are connected from which ConnectionIDs
    // HashSet is used to count unique active connections per user
    private static readonly ConcurrentDictionary<string, HashSet<string>> UserConnections = new();

    public PresenceHub(AppDbContext context)
    {
        _context = context;
    }

    public override async Task OnConnectedAsync()
    {
        // Bulletproof null-check for HttpContext and Query string
        var httpContext = Context.GetHttpContext();
        if (httpContext?.Request?.Query == null || !httpContext.Request.Query.TryGetValue("userId", out var userIdValues))
        {
            await base.OnConnectedAsync();
            return;
        }

        var userId = userIdValues.ToString();
        
        if (!string.IsNullOrEmpty(userId))
        {
            var connections = UserConnections.GetOrAdd(userId, _ => new HashSet<string>());
            
            lock (connections)
            {
                connections.Add(Context.ConnectionId);
            }

            await Groups.AddToGroupAsync(Context.ConnectionId, userId);
            
            if (connections.Count == 1)
            {
                await UpdateUserStatusInDb(userId, "online");
                await Clients.All.SendAsync("UserStatusChanged", userId, "online");
            }
        }

        await base.OnConnectedAsync();
    }

    public override async Task OnDisconnectedAsync(Exception? exception)
    {
        var userId = Context.GetHttpContext()?.Request.Query["userId"].ToString();
        
        if (!string.IsNullOrEmpty(userId))
        {
            if (UserConnections.TryGetValue(userId, out var connections))
            {
                bool isLastConnection = false;
                lock (connections)
                {
                    connections.Remove(Context.ConnectionId);
                    if (connections.Count == 0)
                    {
                        isLastConnection = true;
                        UserConnections.TryRemove(userId, out _);
                    }
                }

                // Only go offline if no other tabs/devices are connected
                if (isLastConnection)
                {
                    await UpdateUserStatusInDb(userId, "offline");
                    await Clients.All.SendAsync("UserStatusChanged", userId, "offline");
                }
            }
        }

        await base.OnDisconnectedAsync(exception);
    }

    public async Task UpdateStatus(string userId, string status)
    {
        // Manual status update (e.g. from Profile Modal)
        await UpdateUserStatusInDb(userId, status);
        await Clients.All.SendAsync("UserStatusChanged", userId, status);
    }

    private async Task UpdateUserStatusInDb(string userId, string status)
    {
        try 
        {
            var user = await _context.Users.FindAsync(userId);
            if (user != null)
            {
                user.Status = status;
                if (status == "offline")
                {
                    user.LastSeenAt = DateTime.UtcNow;
                }
                await _context.SaveChangesAsync();
            }
        }
        catch (Exception ex)
        {
            // Fail silently to keep Hub responsive, but log it
            Console.WriteLine($"[PresenceHub] Error updating DB for {userId}: {ex.Message}");
        }
    }
}
