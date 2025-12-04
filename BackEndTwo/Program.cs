using Azure.Identity;
using BackEndTwo.Authorization;
using BackEndTwo.BackEndOne;
using BackEndTwo.OpenAPIs.BackEndOne;
using Microsoft.AspNetCore.Authentication.JwtBearer;
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

builder.Services.AddControllers();
builder.Services.AddOpenApi(spec => spec.AddDocumentTransformer<BearerSecuritySchemeTransformer>().AddOperationTransformer<BearerSecuritySchemeTransformer>());

builder.Services.AddHttpClient()
    .AddTransient<IHttpClient, DownstreamAuthorizationHttpClient>()
    .AddTransient<IBackendOneClient, v1Client>();

builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddMicrosoftIdentityWebApi(builder.Configuration)
    .EnableTokenAcquisitionToCallDownstreamApi()
    .AddDownstreamApi("BackEndOne", be1 =>
    {
        be1.BaseUrl = builder.Configuration.GetValue<string>("services:backendone:https:0");
        be1.Scopes = (builder.Configuration.GetSection("AzureAd:BackEndOne:Scopes").Get<IEnumerable<string>>() ?? [])
            .Select(s => s.Replace("{client id}", builder.Configuration.GetValue<string>("AzureAd:BackEndOne:ClientId")));
    })
    .AddInMemoryTokenCaches();
builder.Services.AddAuthorizationBuilder()
    .AddPolicy(Policy.Name, new Policy())
    .AddFallbackPolicy("authenticated user", policy => policy.RequireAuthenticatedUser());

builder.Services.AddHttpLogging(log => log.CombineLogs = true);

var app = builder.Build();

app.UseHttpLogging();

app.UseAuthentication().UseAuthorization();

app.MapDefaultEndpoints();

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi().AllowAnonymous();
}

app.UseHttpsRedirection();

app.MapControllers();

app.Run();