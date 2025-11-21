# DouglasDynamics.AzureEntraSSO

This is a reference project meant to imitate the real Douglas Dynamics applications (e.g. dealer portals).
The reference projects will show how to secure an application using Azure Entra for SPA frontend(s) and ASP.net backend(s).
They will also show how to log in to one front end and not need to log into the second and the same for SSO applications, notably SalesForce and Docebo.

## Prerequisites

### Required Tools

- .net 10 SDK
- Node.js [20|24].x LTS
- Docker
- angular CLI
- Java 17 JDK

#### recommended tools

- Visual Studio
- Visual Studio Code

## Running the App

```
cd DouglasDynamics.AzureEntraSSO.AppHost
dotnet run
```

or, from an IDE with the solution file open:
1. set `DouglasDynamics.AzureEntraSSO.AppHost` as the startup project
1. start (F5 / ctrl + F5)

either option will
- install packages (npm and nuget)
- build projects
- start the aspire dashboard
- orchestrate the applications and inject environment variables for references

click the link on the dashboard for either front end application to open it in a browser.

## Testing

back end tests can be run from an IDE or with `dotnet test`
front end tests can be run with `npm test` from the front end project folders

### End to End testing

end to end tests use Playwright in the `endtoend` project.
They can be executed with `npm t` or with the playwright vscode plugin.
Use `npm run test:ui` to open the playwright UI in order to see the test snapshots of browser state

if the aspire project is not started these tests will attempt to start it.  If it is already running they will test against the already running instance.

## Documentation

documentation and designs can be found in the [Documentation](./Documentation) folder.