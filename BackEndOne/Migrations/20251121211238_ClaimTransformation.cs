using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace BackEndOne.Migrations
{
    /// <inheritdoc />
    public partial class ClaimTransformation : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Transformations",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    ClaimType = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    ValuePrefix = table.Column<string>(type: "nvarchar(max)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Transformations", x => x.Id);
                });

            migrationBuilder.InsertData("Transformations", ["ClaimType", "ValuePrefix"], ["roles", "dinner"]);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Transformations");
        }
    }
}
