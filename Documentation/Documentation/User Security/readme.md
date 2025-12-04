# User Security

Using Entra OpenID Connect (an extension of OAuth 2) each application is configured to expect an access token issued specifically for it, configured using Entra App Registrations.  This way the arrangement of the backend applications is not as connected to configuration / infrastructure management; each application trusts only Entra rather than needing to configure and maintain trust between applications (e.g. API keys) and calling applications don't need to be aware of the user information the downstream API requires, needing to both access user information for downstream calls and to _have_ access to that information.

![OBO flow](https://learn.microsoft.com/en-us/entra/identity-platform/media/v2-oauth2-on-behalf-of-flow/protocols-oauth-on-behalf-of-flow.png)

In this diagram the secret Web API A sends to Entra is an Azure Key Vault managed certificate, created with terraform.  Entra is configured by terraform to trust this certificate as proof of identity for Web API A.

Terraform configures AKV to allow the managed identity of Web API A to access and download this certificate so it can use it.  The developer group is given the same permission for local development.

Web API A will hold and cache the token(s) needed to access Web API B on behalf of the authenticated user in a similar way to how a frontend application would cache ID, access, and refresh tokens.

Both Web API A and Web API B trust entra and use the public half of it's signing certificate to verify the access token(s) they are given using the signature portion of the JWT, proving that they were issued by entra.  They also use the audience claim to verify that the token they've received was issued for them, not for some other recipient.

In these applications each one has separate app roles configured in their Entra Application Registration.  They each have RBAC policies on their API routes using these roles to enforce access to the API.  Terraform puts the developer group into each of these app roles and the developer group contains all the individual members specified in the input variable i.e. every developer has access to the APIs.  The membership is included as a claim.  Notably Web API A only receives claims for its own roles and Web API B only receives claims for _its_ roles, even though a user needs to be a member of both app roles for a successful call from browser => Web API A => Web API B

As far as Web API B is concerned it could have been called by Web API A, a new Web API C, or it could have been called directly by a browser application.

- `Microsoft.Identity.Web.DownstreamApi` takes care of the OBO flow magic for us for ASP.net applications.
- `@azure/msal-angular` + `@azure/msal-browser` does the SPA login work for the angular frontend (authorization code flow + PKCE)
- `@azure/msal-react` + `@azure/msal-browser` does the SPA login work for the react frontend (authorization code flow + PKCE)