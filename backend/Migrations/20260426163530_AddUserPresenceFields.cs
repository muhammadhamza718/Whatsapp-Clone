using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ChatApp.Api.Migrations
{
    /// <inheritdoc />
    public partial class AddUserPresenceFields : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "status",
                table: "user",
                type: "text",
                nullable: false,
                defaultValue: "offline");

            migrationBuilder.AddColumn<DateTime>(
                name: "lastSeenAt",
                table: "user",
                type: "timestamp with time zone",
                nullable: false,
                defaultValueSql: "CURRENT_TIMESTAMP");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "status",
                table: "user");

            migrationBuilder.DropColumn(
                name: "lastSeenAt",
                table: "user");
        }
    }
}
