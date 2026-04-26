using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ChatApp.Api.Migrations
{
    /// <inheritdoc />
    public partial class RenameLastSeenAtToLowercase : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // Rename camelCase column created by previous migration to all-lowercase
            // to align with UseLowerCaseNamingConvention() global EF Core setting.
            migrationBuilder.RenameColumn(
                name: "lastSeenAt",
                table: "user",
                newName: "lastseenat");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "lastseenat",
                table: "user",
                newName: "lastSeenAt");
        }
    }
}
