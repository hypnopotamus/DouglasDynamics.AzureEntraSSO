using BackEndTwo.Authorization;
using BackEndTwo.OpenAPIs.BackEndOne;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Identity.Abstractions;

namespace BackEndTwo.Controllers;

[Route("api/[controller]")]
[ApiController]
[Authorize(Policy = Policy.Name)]
public class EchoUserInfoController(IBackendOneClient backendOne, IDownstreamApi downstramApi) : ControllerBase
{
    public record Claim(string Type, string Value, string Source);

    public record UserInfo(string UserName, params IEnumerable<Claim> Claims);

    [HttpGet]
    public async Task<UserInfo> Get() =>
        new
        (
            User.Identity?.Name ?? "Anonymous",
            User.Claims.Select(c => new Claim(c.Type, c.Value, "BackEndTwo"))
                .Concat
                (
                    (await backendOne.EchoUserClaimsAsync(CancellationToken.None))
                    .Select(c => new Claim(c.Type, c.Value, c.Source))
                )
        );
}