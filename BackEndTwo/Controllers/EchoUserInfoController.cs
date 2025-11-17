using BackEndTwo.OpenAPIs.BackEndOne;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace BackEndTwo.Controllers;

[Route("api/[controller]")]
[ApiController]
[AllowAnonymous]
public class EchoUserInfoController(IBackendOneClient backendOne) : ControllerBase
{
    public record Claim(string Type, string Value, string Source);

    public record UserInfo(string UserName, params IEnumerable<Claim> Claims);

    [HttpGet]
    public async Task<UserInfo> Get() =>
        new
        (
            User.Identity?.IsAuthenticated == true
                ? User.Identity?.Name ?? "Anonymous"
                : "Anonymous",
            User.Claims.Select(c => new Claim(c.Type, c.Value, "BackEndTwo"))
                .Concat
                (
                    (await backendOne.EchoUserClaimsAsync(CancellationToken.None))
                    .Select(c => new Claim(c.Type, c.Value, c.Source))
                )
        );
}