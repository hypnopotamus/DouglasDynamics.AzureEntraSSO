using Azure;
using Azure.Identity;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authorization;
using Microsoft.Identity.Abstractions;
using Microsoft.Identity.Web;

var builder = WebApplication.CreateBuilder(args);

if (builder.Configuration.GetValue<string>("AzureAppConfiguration:Endpoint") is { } appConfigEndpoint)
{
    builder.Configuration.AddAzureAppConfiguration(config => config
        .Connect(new Uri(appConfigEndpoint), new DefaultAzureCredential())
        .ConfigureClientOptions(client => client.Retry.NetworkTimeout = TimeSpan.FromSeconds(30))
    );
}

builder.AddServiceDefaults();

builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    //this ignores Azure App config, even though it's added to the configuration provider chain well before this is invoked... so that's neat
    //  for now the values are entered into appSettings.json, even though they SHOULD be coming from terraform via Azure App Config
    //  AzureAd:ClientCredentials are, specifically, the problem
    .AddMicrosoftIdentityWebApi(builder.Configuration)
    .EnableTokenAcquisitionToCallDownstreamApi()
    .AddDownstreamApi("BackEndOne", be1 =>
    {
        be1.BaseUrl = builder.Configuration.GetValue<string>("services:backendone:https:0");
        be1.Scopes = (builder.Configuration.GetSection("AzureAd:BackEndOne:Scopes").Get<IEnumerable<string>>() ?? [])
            .Select(s =>
                s.Replace("{client id}", builder.Configuration.GetValue<string>("AzureAd:BackEndOne:ClientId")));
    })
    .AddDownstreamApi("BackEndTwo", be2 =>
    {
        be2.BaseUrl = builder.Configuration.GetValue<string>("services:backendtwo:https:0");
        be2.Scopes = (builder.Configuration.GetSection("AzureAd:BackEndTwo:Scopes").Get<IEnumerable<string>>() ?? [])
            .Select(s =>
                s.Replace("{client id}", builder.Configuration.GetValue<string>("AzureAd:BackEndTwo:ClientId")));
    })
    .AddDownstreamApi("BackEndThree", be3 =>
    {
        be3.BaseUrl = builder.Configuration.GetValue<string>("services:backendthree:https:0");
        be3.Scopes = (builder.Configuration.GetSection("AzureAd:BackEndThree:Scopes").Get<IEnumerable<string>>() ?? [])
            .Select(s =>
                s.Replace("{client id}", builder.Configuration.GetValue<string>("AzureAd:BackEndThree:ClientId")));
    })
    .AddInMemoryTokenCaches();
builder.Services.AddAuthorizationBuilder().AddDefaultPolicy("access", policy => policy.RequireAuthenticatedUser());

builder.Services.AddHttpLogging(log => log.CombineLogs = true);

var app = builder.Build();

app.UseHttpLogging();

app.MapDefaultEndpoints();

app.UseHttpsRedirection();

app.UseAuthentication().UseAuthorization();

app.MapGet
(
    "/user/api/EchoUserInfo",
    [Authorize] async (IDownstreamApi api) =>
    {
        var response = await api.CallApiAsync
        (
            "BackEndTwo",
            call => call.RelativePath = "api/EchoUserInfo"
        );
        response.EnsureSuccessStatusCode();

        return await response.Content.ReadAsStringAsync();
    });
app.MapGet
(
    "/user/api/EchoUserClaims",
    [Authorize] async (IDownstreamApi api) =>
    {
        var response = await api.CallApiAsync
        (
            "BackEndOne",
            call => call.RelativePath = "api/EchoUserClaims"
        );
        response.EnsureSuccessStatusCode();

        return await response.Content.ReadAsStringAsync();
    });
app.MapPost
(
    "/dice/{*path}",
    [Authorize] async (IDownstreamApi api, string path) =>
    {
        var response = await api.CallApiAsync
        (
            "BackEndThree",
            call =>
            {
                call.RelativePath = $"/Dice/{path}";
                call.HttpMethod = HttpMethod.Post.Method;
            }
        );
        response.EnsureSuccessStatusCode();

        return await response.Content.ReadAsStringAsync();
    });

app.Run();