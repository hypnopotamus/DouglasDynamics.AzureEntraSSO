using System.Security.Claims;
using AwesomeAssertions;
using BackEndOne.Controllers;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace BackEndOne.Test.Controllers;

[TestClass]
public class EchoUserClaimsControllerTest
{
    private readonly EchoUserClaimsController _controller = new();

    private void SetUserPrincipal(ClaimsPrincipal user)
    {
        _controller.ControllerContext = new ControllerContext
        {
            HttpContext = new DefaultHttpContext
            {
                User = user
            }
        };
    }

    [TestMethod]
    public void Get_Anonymous_ReturnsEmpty()
    {
        SetUserPrincipal(new ClaimsPrincipal());

        var claims = _controller.Get();

        claims.Should().BeEmpty();
    }

    [TestMethod]
    public void Get_LoggedIn_ReturnsClaims()
    {
        var principalClaims = new Claim[] { new("one", "1"), new("two", "2") };
        SetUserPrincipal(new ClaimsPrincipal(new ClaimsIdentity(principalClaims)));

        var claims = _controller.Get().ToArray();

        claims.Should().AllSatisfy(c => c.Source.Should().Be("BackEndOne"));
        claims.Select(c => (c.Type, c.Value)).Should().BeEquivalentTo(principalClaims.Select(c => (c.Type, c.Value)));
    }
}