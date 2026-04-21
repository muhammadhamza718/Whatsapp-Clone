using Microsoft.EntityFrameworkCore;
using ChatApp.Api.Data;
using Npgsql;

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
    options.UseNpgsql(connectionString));

builder.Services.AddControllers();
builder.Services.AddOpenApi();

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

// 3. Dynamic Port Selection
var port = Environment.GetEnvironmentVariable("PORT") ?? "8080";
app.Run($"http://0.0.0.0:{port}");
