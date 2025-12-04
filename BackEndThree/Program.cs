using Azure.Identity;
using BackEndThree.Authorization;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.Identity.Web;
using Microsoft.IdentityModel.Logging;
using System.Text.Json.Serialization;

IdentityModelEventSource.LogCompleteSecurityArtifact = true;

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
builder.Services.ConfigureHttpJsonOptions(json => json.SerializerOptions.NumberHandling = JsonNumberHandling.Strict);
builder.Services.AddOpenApi(spec => spec.AddDocumentTransformer<BearerSecuritySchemeTransformer>().AddOperationTransformer<BearerSecuritySchemeTransformer>());

builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddMicrosoftIdentityWebApi(builder.Configuration);
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