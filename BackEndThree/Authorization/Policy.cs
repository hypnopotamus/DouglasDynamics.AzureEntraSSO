using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authorization;

namespace BackEndThree.Authorization;

public class Policy()
    : AuthorizationPolicy(Requirements, [JwtBearerDefaults.AuthenticationScheme])
{
    public const string Name = nameof(Policy);

    private new static readonly IEnumerable<IAuthorizationRequirement> Requirements =
        new AuthorizationPolicyBuilder()
            .RequireAuthenticatedUser()
            .RequireRole("BackEndThree.Read")
            .Build()
            .Requirements;
}