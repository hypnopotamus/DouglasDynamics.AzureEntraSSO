using BackEndForFrontend.BackEndOne;

namespace BackEndForFrontend.OpenAPIs.BackEndOne;

public interface IBackendOneClient
{
    public Task<ICollection<Claim>> EchoUserClaimsAsync(CancellationToken cancellationToken);
}