# Azure Container Apps

Azure Container Apps is my Azure hosting recommendation.  Knowing that the current hosting environment is Docker on-prem the transition should be easy (as far as the applications go).

Azure Container Apps is, under the hood, a heavily managed Kubernetes cluster.  "Heavily managed" means that if you didn't know it was Kubernetes you would probably never find out.  It brings with it a lot of the main selling points for Kubernetes without the learning curve or maintenance / management burden. In trade some of the higher power features of Kubernetes are not available e.g. operators.

Some of the Kubernetes features Azure Container Apps brings are
- autoscaling
   - even down to zero replicas (not recommended)
- healthchecks / self-healing
- resource usage quotas
- service discovery
- rolling / zero downtime deployments

and, in addition, Azure Container Apps are an Azure service, augmenting Kubernetes features with Azure features
- Managed Identity
- billing reporting / forecasting
- Azure Monitor / App Insights
- dapr built-in