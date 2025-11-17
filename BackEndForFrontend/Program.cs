using BackEndForFrontend.BackEndOne;
using BackEndForFrontend.BackEndTwo;
using BackEndForFrontend.OpenAPIs.BackEndOne;
using BackEndForFrontend.OpenAPIs.BackEndTwo;

var builder = WebApplication.CreateBuilder(args);

builder.AddServiceDefaults();

builder.Services.AddOpenApi();

builder.Services.AddHttpClient()
    .AddTransient<BackEndOneV1Client>()
    .AddTransient<BackEndTwoV1Client>()
    .AddTransient<IBackendOneClient, BackEndOneV1Client>(s =>
    {
        var client = s.GetRequiredService<BackEndOneV1Client>();
        client.BaseUrl = builder.Configuration.GetSection("services:backendone:https:0").Get<string>();

        return client;
    })
    .AddTransient<IBackendTwoClient, BackEndTwoV1Client>(s =>
    {
        var client = s.GetRequiredService<BackEndTwoV1Client>();
        client.BaseUrl = builder.Configuration.GetSection("services:backendtwo:https:0").Get<string>();

        return client;
    });

var app = builder.Build();

app.MapDefaultEndpoints();

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.UseHttpsRedirection();

app.MapGet("/user/info", async (IBackendTwoClient client) => await client.EchoUserInfoAsync(CancellationToken.None));
app.MapGet("/user/backendone/claims", async (IBackendOneClient client) => await client.EchoUserClaimsAsync(CancellationToken.None));

app.Run();
