# Roadmap

## Dependencies
![Dependencies](./Dependency%20Graph.svg)

## Timeline
![timeline](./timeline.svg)

### Deliverables

each step will be demoed and reviewed along the way.
Specific additional or noteworthy demos or reviews called out explicitly.

#### reference project
starting point and commit history to work from unsecured APIs accessed by unsecured front ends to Entra secured and authorized with SSO between apps and Enterprise Applications

#### overall design
verification and signoff that the overall design and direction is as expected

#### reference secured with Entra

> IaC: Entra configurations for the above

code that shows:
- secured frontend
- secured frontend to backend communication
- backend policy-based authorization
   - at least one policy will be role-based

demos / tech sessions:
- terraform primer
- OAuth / OpenID Connect

#### reference deployed

> IaC: provision the deployment environment

- CI/CD pipeline
   - deploy applications to the provisioned environment

#### SSO to enterprise apps

> IaC: SSO configuration to Salesforce

Docebo if possible, SF has a terraform provider but Docebo seems likely to be a manual copy of the SAML configuration file from Entra to Docebo

questions:
- are both subscriptions at a level where SSO is enabled or enable-able

#### API Gateway

> IaC: gateway provisioned with policies

#### Entra Facade design

a document containing a recommendation for how to build a facade API around the MS Entra Graph API that can be consumed by upstream dealer portals (or other apps) to facilitate dealer portal admin users making user changes that affect users in Entra and/or Salesforce/Docebo