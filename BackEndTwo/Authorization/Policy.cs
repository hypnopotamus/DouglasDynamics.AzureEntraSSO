using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authorization;

namespace BackEndTwo.Authorization;

public class Policy()
    : AuthorizationPolicy(Requirements, [JwtBearerDefaults.AuthenticationScheme])
{
    public const string Name = nameof(Policy);

    private new static readonly IEnumerable<IAuthorizationRequirement> Requirements =
        new AuthorizationPolicyBuilder()
            .RequireAuthenticatedUser()
            .RequireRole("BackEndTwo.Read")
            .Build()
            .Requirements;
}