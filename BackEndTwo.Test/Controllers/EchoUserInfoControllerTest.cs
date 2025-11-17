using System.Net;
using AwesomeAssertions;
using BackEndTwo.Controllers;
using BackEndTwo.OpenAPIs.BackEndOne;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace BackEndTwo.Test.Controllers;

[TestClass]
public sealed class EchoUserInfoControllerTest
{
    private readonly EchoUserInfoController _controller;

    private readonly FakeBackendOneClient _backendOneClient = new();

    public EchoUserInfoControllerTest()
    {
        _controller = new EchoUserInfoController(_backendOneClient);
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
    public async Task Get_Anonymous_ReturnsAnonymousUserWithEmptyClaims()
    {
        SetUserPrincipal(new ClaimsPrincipal());

        var info = await _controller.Get();

        info.UserName.Should().Be("Anonymous");
        info.Claims.Should().BeEmpty();
    }

    [TestMethod]
    public async Task Get_LoggedIn_ReturnsUserNameAndClaims()
    {
        const string userName = "testuser";
        var principalClaims = new Claim[] { new(ClaimTypes.Name, userName), new("two", "2") };
        SetUserPrincipal(new ClaimsPrincipal(new ClaimsIdentity(principalClaims)));

        var info = await _controller.Get();

        info.UserName.Should().Be(userName);
        info.Claims
            .Where(c => c.Source == "BackEndTwo")
            .Select(c => (c.Type, c.Value))
            .Should().BeEquivalentTo(principalClaims.Select(c => (c.Type, c.Value)));
    }

    private static IEnumerable<object[]> Principals =>
    [
        [new ClaimsPrincipal()],
        [new ClaimsPrincipal(new ClaimsIdentity([new Claim("one", "1"), new Claim("two", "2")]))]
    ];

    [TestMethod]
    [DynamicData(nameof(Principals))]
    public async Task Get_AllCases_ReturnsDownstreamClaims(ClaimsPrincipal principal)
    {
        const string backendOneSource = "back end one";
        SetUserPrincipal(principal);
        var downstreamClaims = _backendOneClient.DownstreamClaims =
        [
            new BackEndOne.Claim
            {
                Source = backendOneSource,
                Type = "downstream",
                Value = "1"
            },
            new BackEndOne.Claim
            {
                Source = backendOneSource,
                Type = "downstream",
                Value = "2"
            }
        ];

        var info = await _controller.Get();

        info.Claims.Where(c => c.Source == backendOneSource).Should().BeEquivalentTo(downstreamClaims,
            except => except.Excluding(c => c.AdditionalProperties));
    }

    private class FakeBackendOneClient : IBackendOneClient
    {
        public ICollection<BackEndOne.Claim> DownstreamClaims { get; set; } = [];

        public Task<ICollection<BackEndOne.Claim>> EchoUserClaimsAsync(CancellationToken cancellationToken) =>
            Task.FromResult(DownstreamClaims);
    }
}