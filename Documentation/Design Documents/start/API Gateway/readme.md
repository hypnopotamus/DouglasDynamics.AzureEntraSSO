# API Gateway

Using an API gateway allows the frontend to only need to prompt users to acquire access tokens to one source, regardless of which downstream API it will actually access.  The API gateway is configured as a reverse-proxy; it routes incoming requests to the appropriate backend on behalf of the frontend based on configurations (likely route based).

The API gateway can be a centralized place for coarse-grained policies to be enforced (e.g. *any* authenticated user with a valid access token) before any backend receives a request. Back end APIs to maintain the ability to enforce fine-grained authentication and authorization policies based on user claims.  Different APIs retain the ability to specify which user information (claims) they need for their fine-grained policies **separately** because the API gateway receives the general-purpose OpenID Connect access token, validates it, then obtains a **new** access token for the downstream API using the Entra Application Registration for that API.

Centralized, configuration based, coarse grained access control ensures that all backends meet a minimum level of application security that can be governed in one place while they each maintain the ability to implement fine-grained application specific / application aware authorization policies of their own.

![OpenID Connect with API Gateway](./OIDC%20with%20APIM%20API%20Gateway.svg)
- first section: standard oauth flow for a SPA frontend login
- second section: secured access to a SPA frontend through to a secured backend
- third section: API gateway in place between frontend and backend
   - as far as either the frontend or the backend are concerned the oauth/oidc *flow* is identical to the second section
   - frontend and backend are no longer directly connected
      - e.g. the `aud` claim in the token the frontend forwards on behalf of the user is now for the API gateway, regardless of which backend audience will eventually be reached

key points:
- each piece trusts only Entra, they don't trust each other
- each piece is configured separately with Entra to get the user information they need and only that information
- the frontend never sees a password or user credentials, only a JWT containing user claims
   - the JWT is not, itself, secure and can be easily read.
- OIDC puts user *claims* in the token which can be verified to have been from the expected source, for the expected recipient, and not tampered with

## policies

- inbound: [`validate-azure-ad-token`](https://learn.microsoft.com/en-us/azure/api-management/validate-azure-ad-token-policy)
   - ensures the token was issued by the expected entra identity provider
- outbound: [`get-authorization-context`](https://learn.microsoft.com/en-us/azure/api-management/get-authorization-context-policy)
   - gets an access token from an identity provider.  In this case that provider is the same Entra as the original access token issuer.