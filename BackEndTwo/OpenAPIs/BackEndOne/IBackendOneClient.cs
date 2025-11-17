using BackEndTwo.BackEndOne;

namespace BackEndTwo.OpenAPIs.BackEndOne;

public interface IBackendOneClient
{
    public Task<ICollection<Claim>> EchoUserClaimsAsync(CancellationToken cancellationToken);
}