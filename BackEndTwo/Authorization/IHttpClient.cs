namespace BackEndTwo.Authorization;

public interface IHttpClient : IDisposable
{
    Task<HttpResponseMessage> SendAsync(HttpRequestMessage request, HttpCompletionOption responseHeadersRead, CancellationToken cancellationToken);
}