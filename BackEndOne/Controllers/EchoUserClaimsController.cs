using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace BackEndOne.Controllers;

[Route("api/[controller]")]
[ApiController]
[AllowAnonymous]
public class EchoUserClaimsController : ControllerBase
{
    public record Claim(string Type, string Value, string Source);

    [HttpGet]
    public IEnumerable<Claim> Get() => User.Claims.Select(c => new Claim(c.Type, c.Value, "BackEndOne"));
}