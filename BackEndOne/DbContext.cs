using Microsoft.EntityFrameworkCore;

namespace BackEndOne;

public class ClaimTransformation
{
    public int Id { get; set; }

    public required string ClaimType { get; init; }
    public required string ValuePrefix { get; set; }
}

public class DbContext(DbContextOptions<DbContext> options) : Microsoft.EntityFrameworkCore.DbContext(options)
{
    public DbSet<ClaimTransformation> Transformations { get; set; }
}