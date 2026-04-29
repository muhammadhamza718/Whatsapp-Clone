using Microsoft.EntityFrameworkCore;
using ChatApp.Api.Data;
using ChatApp.Api.Repositories;
using ChatApp.Api.Services;
using Npgsql;
using ChatApp.Api.Hubs;
using System.Text.Json.Serialization;

var builder = WebApplication.CreateBuilder(args);

// 1. Get Connection String (Parse DATABASE_URL if present, otherwise use appsettings)
var databaseUrl = Environment.GetEnvironmentVariable("DATABASE_URL");
string? connectionString;

if (string.IsNullOrEmpty(databaseUrl))
{
    connectionString = builder.Configuration.GetConnectionString("DefaultConnection");
}
else
{
    // Parse postgres://user:pass@host:port/db
    var databaseUri = new Uri(databaseUrl);
    var userInfo = databaseUri.UserInfo.Split(':');
    var npgsqlBuilder = new NpgsqlConnectionStringBuilder
    {
        Host = databaseUri.Host,
        Username = userInfo[0],
        Password = userInfo.Length > 1 ? userInfo[1] : "",
        Database = databaseUri.LocalPath.TrimStart('/'),
        SslMode = SslMode.Require,
        TrustServerCertificate = true // Often needed for Neon/Supabase
    };

    if (databaseUri.Port > 0)
    {
        npgsqlBuilder.Port = databaseUri.Port;
    }

    connectionString = npgsqlBuilder.ToString();


}

// Add services to the container.
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseNpgsql(connectionString)
           .UseLowerCaseNamingConvention());

builder.Services.AddControllers().AddJsonOptions(options =>
{
    options.JsonSerializerOptions.ReferenceHandler = ReferenceHandler.IgnoreCycles;
});
builder.Services.AddOpenApi();
builder.Services.AddSignalR(options =>
{
    Microsoft.AspNetCore.SignalR.HubOptionsExtensions.AddFilter<GroupAuthorizationFilter>(options);
})
.AddStackExchangeRedis(builder.Configuration.GetConnectionString("RedisConnection") ?? "localhost:6379");
builder.Services.AddScoped<IUnitOfWork, UnitOfWork>();
builder.Services.AddScoped<IConversationRepository, ConversationRepository>();
builder.Services.AddScoped<IConversationService, ConversationService>();

// 2. Add CORS Policy
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowVercel", policy =>
    {
        policy.WithOrigins("https://whatsapp-clone-relay.vercel.app", "http://localhost:3000")
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials();
    });
});

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.UseCors("AllowVercel");

app.UseAuthorization();

app.MapControllers();
app.MapHub<PresenceHub>("/hubs/presence");
app.MapHub<ChatHub>("/hubs/chat");

// 3. Dynamic Port Selection
var port = Environment.GetEnvironmentVariable("PORT") ?? "5100";
app.Run($"http://*:{port}");
