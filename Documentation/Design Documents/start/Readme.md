# Entra App Security and Enterprise Application SSO

## Elevator Pitch

Early next year there will be an effort to make use of Azure Entra ID for application security and to enable SSO from Douglas Dynamics applications to enterprise applications such as Salesforce and Docebo.  This project will serve as recommendations and a working reference for those recommendatiosn during that effort, developed separately and beforehand to disentangle the concepts from the implementations.

[[_TOC_]]

## Assumptions

- SSO from a custom-built application to an OTS enterprise application is the #1 deliverable
- OAuth / OpenID Connect: the team would benefit from a conceptual overview of how the technology and algorithms work and how they keep sensitive informationhidden away safely
- the external ID test tenant is safe to use as a sandbox, specifically Entra
   - confirmed
- the external ID test tenant's Entra has users that can be tested with or they can be created
   - confirmed
- SalesForce and Docebo subscriptions have SSO enabled (or enable-able)
- human approvals on automated infrastructure changes can be put in place in the reference project deployment structure but the real decision on when/how to apply human intervention for the dealer portals (and related) can be delayed

## Roadmap

[roadmap](./timeline/)

## technologies / frameworks

- dotnet 10
   - `Microsoft.Identity.Web`
   - `Microsoft.AspNetCore.OpenApi`
   - NSwag (`OpenApiReference`)
   - C#
   - ASP.net
   - Aspire 13
- angular 21
   - typescript
   - node.js
   - `@openapitools/openapi-generator-cli`
   - `@testing-library/angular`
- react 19
   - typescript
   - node.js
   - vite
   - vitest
   - `@openapitools/openapi-generator-cli`
   - `@testing-library/react`
- playwright
   - typescript
   - node.js
- Docker
- Azure
   - Azure Container Apps
   - Entra
      - External ID
      - SAML
      - Open ID Connect (OIDC)
         - OAuth
         - JWT
      - App Registration
   - API Management
      - API Gateway
   - Container Registry
- terraform
- Azure DevOps
   - CI/CD pipelines
   - Deployment Environments
   - git

### Azure Container Apps

[Azure Container Apps](./AzureContainerApps/)

### API Gateway

[API Gateway](./API%20Gateway/)

## Deployment Strategy

TL;DR: Trunk based gitops

Using Azure DevOps pipelines
- commits to feature branches (non-master) with an active pull request will trigger a CI pipeline run
- commits to master (from completed pull requests) will trigger CI first then a CD pipeline

One orchestrator pipeline configuration ensure the below slices of the overall process run in the right order and wait when they're supposed to wait and avoids a complex web of pipeline triggers.

### Terraform:

if terraform file changes are detected

#### CI

1. `terraform validate`
1. `terraform plan`
   - CLI human readable output of the plan
   - `-out` to save the plan as a file to the pipeline artifacts

#### CD

if the target branch is master
1. `terraform show` to reprint the plan file
1. human approval
   - inspect the plan's proposed changes
   - approve or deny changes
1. `terraform apply` to make the changes

### Application

if application changes are detected

#### CI

1. build the Docker container
1. run unit tests
1. run integration tests (if there are any)

#### CD

if the target branch is master, after the infrastructure pipeline has completed or been skipped
1. run end to end tests (if there are any)
1. push the docker container to the container registry
1. trigger the deployment to ACA of the new container version

## Risks

- not enough time to get to every detail before EoY
   - mitigation:
      - not everything has to be perfect
         - this is a reference with documentation, not the production applications
         - the point of the project is to enable the **real** apps to SSO with the enterprise applications
- too big a leap all at once
   - mitigation:
      - step-by-step demos and progress reports
         - record demos
      - supplementary documentation along the way
      - runnable reference project
      - nvisia resource(s) available in the new year if needed
         - help apply the concepts in the reference to the real apps
         - give refreshers on what's in the reference solution and documentation as needed