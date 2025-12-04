using BackEndOne.Authorization;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace BackEndOne.Controllers;

[Route("api/[controller]")]
[ApiController]
[Authorize(Policy = Policy.Name)]
public class EchoUserClaimsController(DbContext context) : ControllerBase
{
    public record Claim(string Type, string Value, string Source);

    [HttpGet]
    public IEnumerable<Claim> Get() => User.Claims
        .Select(c => new Claim(c.Type, c.Value, "BackEndOne"))
        .LeftJoin
        (
            context.Transformations,
            c => c.Type,
            c => c.ClaimType,
            (c, ct) => ct is not null ? c with { Value = $"{ct.ValuePrefix}{c.Value}" } : c
        );
}