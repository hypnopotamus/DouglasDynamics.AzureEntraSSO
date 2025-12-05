variable "subscription_id" {
  description = "the ID of the azure subscription to deploy resources into"
  type        = string
}

variable "entra_tenant_id" {
  description = "the tenant ID used to connect to entra ID"
  type        = string
}

variable "frontend_redirect_uris" {
  type        = list(string)
  description = "redirect URIs for the frontend SPA"
  default     = []
}

variable "frontend_logout_uri" {
  type        = string
  description = "frontchannel logout url for the frontend"
}

variable "dice_frontend_redirect_uris" {
  type        = list(string)
  description = "redirect URIs for the dice SPA"
  default     = []
}

variable "dice_frontend_logout_uri" {
  type        = string
  description = "frontchannel logout url for the dice frontend"
}

variable "dev_group_members" {
  type        = list(string)
  description = "members of the developer group"
  default     = []
}
