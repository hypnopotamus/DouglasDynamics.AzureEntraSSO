using System.Security.Claims;
using AwesomeAssertions;
using BackEndOne.Controllers;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace BackEndOne.Test.Controllers;

[TestClass]
[TestCategory("integration")]
public class EchoUserClaimsControllerTest : IDisposable
{
    private readonly EchoUserClaimsController _controller;

    private readonly DbContext _db = new
    (
        new DbContextOptionsBuilder<DbContext>()
            .UseSqlite($"Data Source={nameof(EchoUserClaimsControllerTest)}.db")
            .Options
    );

    public EchoUserClaimsControllerTest()
    {
        _controller = new EchoUserClaimsController(_db);
    }

    [ClassInitialize]
    public static void ClassInitialize(TestContext testContext)
    {
        using var db = new DbContext
        (
            new DbContextOptionsBuilder<DbContext>()
                .UseSqlite($"Data Source={nameof(EchoUserClaimsControllerTest)}.db")
                .Options
        );
        db.Database.EnsureDeleted();
        db.Database.EnsureCreated();
    }

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

    [TestMethod]
    public void Get_LoggedInAndClaimHasTransform_ReturnsTransformedClaim()
    {
        var principalClaims = new Claim[] { new("three", "1"), new("four", "2") };
        SetUserPrincipal(new ClaimsPrincipal(new ClaimsIdentity(principalClaims)));
        var claimTransformation = principalClaims
            .Select
            (c => new ClaimTransformation
                {
                    ClaimType = c.Type,
                    ValuePrefix = "prefix"
                }
            )
            .Last();
        _db.Transformations.Add(claimTransformation);
        _db.SaveChanges();

        var claims = _controller.Get().ToArray();

        var transformedClaims = principalClaims.Select(c => (c.Type, c.Value)).ToDictionary(c => c.Type);
        transformedClaims[claimTransformation.ClaimType] = transformedClaims[claimTransformation.ClaimType] with
        {
            Value = claimTransformation.ValuePrefix + transformedClaims[claimTransformation.ClaimType].Value
        };
        claims.Select(c => (c.Type, c.Value)).Should().BeEquivalentTo(transformedClaims.Values);
    }

    public void Dispose()
    {
        _db.Dispose();
    }
}