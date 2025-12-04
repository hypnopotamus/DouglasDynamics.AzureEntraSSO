using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authorization;

namespace BackEndOne.Authorization;

public class Policy()
    : AuthorizationPolicy(Requirements, [JwtBearerDefaults.AuthenticationScheme])
{
    public const string Name = nameof(Policy);

    private new static readonly IEnumerable<IAuthorizationRequirement> Requirements =
        new AuthorizationPolicyBuilder()
            .RequireAuthenticatedUser()
            .RequireRole("BackEndOne.Read")
            .Build()
            .Requirements;
}