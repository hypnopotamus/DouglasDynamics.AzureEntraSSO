using BackEndTwo.BackEndOne;
using BackEndTwo.OpenAPIs.BackEndOne;

var builder = WebApplication.CreateBuilder(args);

builder.AddServiceDefaults();

builder.Services.AddControllers();
builder.Services.AddOpenApi();

builder.Services.AddHttpClient()
    .AddTransient<v1Client>()
    .AddTransient<IBackendOneClient, v1Client>(s =>
    {
        var client = s.GetRequiredService<v1Client>();
        client.BaseUrl = builder.Configuration.GetSection("services:backendone:https:0").Get<string>();

        return client;
    });

var app = builder.Build();

app.MapDefaultEndpoints();

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.UseHttpsRedirection();

app.MapControllers();

app.Run();
