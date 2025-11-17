using BackEndForFrontend.BackEndTwo;

namespace BackEndForFrontend.OpenAPIs.BackEndTwo;

public interface IBackendTwoClient
{
    public Task<UserInfo> EchoUserInfoAsync(CancellationToken cancellationToken);
}