using Microsoft.Identity.Abstractions;

namespace BackEndTwo.Authorization;

public class DownstreamAuthorizationHttpClient(IDownstreamApi api) : IHttpClient
{
    public async Task<HttpResponseMessage> SendAsync
    (
        HttpRequestMessage request,
        HttpCompletionOption responseHeadersRead,
        CancellationToken cancellationToken
    ) => await api.CallApiAsync
    (
        "BackEndOne",
        call =>
        {
            call.HttpMethod = request.Method.Method;
            call.RelativePath = request.RequestUri?.LocalPath ?? call.RelativePath;
            call.AcceptHeader = request.Headers.Accept.ToString();
        },
        content: request.Content,
        cancellationToken: cancellationToken
    );

    public void Dispose()
    {
    }
}