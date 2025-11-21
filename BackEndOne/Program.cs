using Microsoft.EntityFrameworkCore;
using DbContext = BackEndOne.DbContext;

var builder = WebApplication.CreateBuilder(args);

builder.AddServiceDefaults();

builder.Services.AddControllers();
builder.Services.AddOpenApi();

builder.Services.AddDbContext<DbContext>
(
    db => db.UseSqlServer(builder.Configuration.GetConnectionString("DbConnection")).LogTo(Console.WriteLine, LogLevel.Information)
);

var app = builder.Build();

app.MapDefaultEndpoints();

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.UseHttpsRedirection();

app.MapControllers();

app.Run();