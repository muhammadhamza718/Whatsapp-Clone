using System;
using System.Linq;
using System.Threading.Tasks;
using ChatApp.Api.Data;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;

namespace ChatApp.Api.Hubs;

public class GroupAuthorizationFilter : IHubFilter
{
    public async ValueTask<object?> InvokeMethodAsync(
        HubInvocationContext invocationContext, 
        Func<HubInvocationContext, ValueTask<object?>> next)
    {
        var conversationIdArg = invocationContext.HubMethodArguments.FirstOrDefault(a => a is Guid);
        
        if (conversationIdArg is Guid conversationId)
        {
            var httpContext = invocationContext.Context.GetHttpContext();
            var userId = httpContext?.Request?.Query["userId"].ToString();

            if (!string.IsNullOrEmpty(userId))
            {
                using var scope = invocationContext.ServiceProvider.CreateScope();
                var dbContext = scope.ServiceProvider.GetRequiredService<AppDbContext>();

                var isMember = await dbContext.ConversationMembers
                    .AnyAsync(cm => cm.ConversationId == conversationId && cm.UserId == userId);

                if (!isMember)
                {
                    throw new HubException("Unauthorized: You are not a member of this conversation.");
                }
            }
            else
            {
                throw new HubException("Unauthorized: User ID not provided.");
            }
        }

        return await next(invocationContext);
    }
}
