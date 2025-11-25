variable "subscription_id" {
  description = "the ID of the azure subscription to deploy resources into"
  type        = string
}

variable "entra_tenant_id" {
  description = "the tenant ID used to connect to entra ID"
  type        = string
}