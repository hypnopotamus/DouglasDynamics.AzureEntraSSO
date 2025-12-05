variable "name" {
  type = string
}

variable "resource_group_name" {
  type = string
}

variable "location" {
  type = string
}

variable "dev_group_id" {
  type = string
}

variable "single_signout_uri" {
  type = string
}

variable "oauth_redirect_uris" {
  type = list(string)
}
