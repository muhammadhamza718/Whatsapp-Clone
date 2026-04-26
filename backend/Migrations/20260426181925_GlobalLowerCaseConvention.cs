using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ChatApp.Api.Migrations
{
    /// <inheritdoc />
    public partial class GlobalLowerCaseConvention : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {


            migrationBuilder.DropPrimaryKey(
                name: "PK_Messages",
                table: "Messages");

            migrationBuilder.RenameTable(
                name: "Messages",
                newName: "messages");

            migrationBuilder.RenameColumn(
                name: "lastSeenAt",
                table: "user",
                newName: "lastseenat");

            migrationBuilder.RenameColumn(
                name: "Name",
                table: "user",
                newName: "name");

            migrationBuilder.RenameColumn(
                name: "Image",
                table: "user",
                newName: "image");

            migrationBuilder.RenameColumn(
                name: "Email",
                table: "user",
                newName: "email");

            migrationBuilder.RenameColumn(
                name: "Timestamp",
                table: "messages",
                newName: "timestamp");

            migrationBuilder.RenameColumn(
                name: "Sender",
                table: "messages",
                newName: "sender");

            migrationBuilder.RenameColumn(
                name: "Content",
                table: "messages",
                newName: "content");

            migrationBuilder.RenameColumn(
                name: "Id",
                table: "messages",
                newName: "id");

            migrationBuilder.RenameIndex(
                name: "IX_Messages_Timestamp",
                table: "messages",
                newName: "ix_messages_timestamp");



            migrationBuilder.AddPrimaryKey(
                name: "pk_messages",
                table: "messages",
                column: "id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {


            migrationBuilder.DropPrimaryKey(
                name: "pk_messages",
                table: "messages");

            migrationBuilder.RenameTable(
                name: "messages",
                newName: "Messages");

            migrationBuilder.RenameColumn(
                name: "name",
                table: "user",
                newName: "Name");

            migrationBuilder.RenameColumn(
                name: "lastseenat",
                table: "user",
                newName: "lastSeenAt");

            migrationBuilder.RenameColumn(
                name: "image",
                table: "user",
                newName: "Image");

            migrationBuilder.RenameColumn(
                name: "email",
                table: "user",
                newName: "Email");

            migrationBuilder.RenameColumn(
                name: "timestamp",
                table: "Messages",
                newName: "Timestamp");

            migrationBuilder.RenameColumn(
                name: "sender",
                table: "Messages",
                newName: "Sender");

            migrationBuilder.RenameColumn(
                name: "content",
                table: "Messages",
                newName: "Content");

            migrationBuilder.RenameColumn(
                name: "id",
                table: "Messages",
                newName: "Id");

            migrationBuilder.RenameIndex(
                name: "ix_messages_timestamp",
                table: "Messages",
                newName: "IX_Messages_Timestamp");



            migrationBuilder.AddPrimaryKey(
                name: "PK_Messages",
                table: "Messages",
                column: "Id");
        }
    }
}
