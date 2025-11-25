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

variable "container_app_environment_id" {
  type = string
}

variable "container_image" {
  type = string
}
