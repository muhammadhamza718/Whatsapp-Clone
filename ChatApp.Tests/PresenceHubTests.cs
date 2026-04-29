using Xunit;
using Moq;
using Microsoft.AspNetCore.SignalR;
using ChatApp.Api.Hubs;
using ChatApp.Api.Data;
using Microsoft.EntityFrameworkCore;
using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Http.Features;
using Microsoft.Extensions.Primitives;

namespace ChatApp.Tests;

public class PresenceHubTests
{
    [Fact]
    public async Task UpdateStatus_Should_Broadcast_Status_Change()
    {
        // Arrange
        var options = new DbContextOptionsBuilder<AppDbContext>()
            .UseInMemoryDatabase(databaseName: "StatusUpdateDb")
            .Options;

        using var context = new AppDbContext(options);
        var hub = new PresenceHub(context);

        // Mock SignalR Clients
        var mockClients = new Mock<IHubCallerClients>();
        var mockAll = new Mock<IClientProxy>();
        mockClients.Setup(c => c.All).Returns(mockAll.Object);
        hub.Clients = mockClients.Object;

        // Act
        await hub.UpdateStatus("test-user-1", "away");

        // Assert
        mockAll.Verify(
            a => a.SendCoreAsync("UserStatusChanged", It.Is<object[]>(o => o[0].ToString() == "test-user-1" && o[1].ToString() == "away"), default),
            Times.Once
        );
    }
}
