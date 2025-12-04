variable "name" {
  type = string

  validation {
    condition     = length(var.name) <= 32 && can(regex("^[a-z](?:[a-z0-9-]*[a-z])?$", var.name))
    error_message = "The 'name' must be 32 characters or less, only lowercase letters, digits and '-', start and end with a letter, and must not contain consecutive hyphens ('--')."
  }
}

variable "resource_group_name" {
  type = string
}

variable "location" {
  type = string
}

variable "container_app_environment_id" {
  type = string
}

variable "container_image" {
  type = string
}

variable "authorized_clients" {
  description = "list of client IDs that will be preathorized for access to the app registration"
  type        = list(string)
  default     = []
}

variable "downstream_apis" {
  description = "map of downstream `{name: client id}` app registrations"
  type        = map(string)
  default     = {}
}

variable "oauth_redirect_uris" {
  type    = list(string)
  default = []
}

variable "key_vault_id" {
  type = string
}

variable "key_vault_url" {
  type = string
}

variable "dev_group_id" {
  type    = string
}

variable "app_roles" {
  type = map(object({
    id : string
    description : string
    display_name : string
    members : list(string)
  }))
  default = {}
}
