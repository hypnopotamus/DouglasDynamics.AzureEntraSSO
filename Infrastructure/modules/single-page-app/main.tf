terraform {
  required_providers {
    azurerm = {
      source  = "hashicorp/azurerm"
      version = "~> 4.54.0"
    }
  }

  required_version = ">= 1.14.0"
}

data "azurerm_client_config" "current" {}

resource "azurerm_static_web_app" "app" {
  name                = var.name
  resource_group_name = var.resource_group_name
  location            = var.location

  sku_tier = "Free"
  sku_size = "Free"
}

resource "azurerm_role_assignment" "dev_configuration_reader" {
  scope                = azurerm_app_configuration.configuration.id
  role_definition_name = "App Configuration Data Reader"
  principal_id         = var.dev_group_id
}

resource "azurerm_role_assignment" "configuration_writer" {
  scope                = azurerm_app_configuration.configuration.id
  role_definition_name = "App Configuration Data Owner"
  principal_id         = data.azurerm_client_config.current.object_id
}

resource "azurerm_app_configuration" "configuration" {
  name                = "ac-${var.name}"
  resource_group_name = var.resource_group_name
  location            = var.location
  sku                 = "developer"

  data_plane_proxy_authentication_mode = "Pass-through"
  local_auth_enabled                   = false
}

resource "azurerm_app_configuration_key" "authority" {
  configuration_store_id = azurerm_app_configuration.configuration.id
  key                    = "VITE_AUTH_AUTHORITY"
  value                  = "https://login.microsoftonline.com/${data.azurerm_client_config.current.tenant_id}"

  depends_on = [azurerm_role_assignment.configuration_writer]
}

resource "azurerm_app_configuration_key" "client_id" {
  configuration_store_id = azurerm_app_configuration.configuration.id
  key                    = "VITE_AUTH_CLIENT_ID"
  value                  = var.entra_client_id

  depends_on = [azurerm_role_assignment.configuration_writer]
}

#todo: needs the API gateway so that I can give the redirect URI from that here to give to CI for .env
#  and the gateway itself can supply it to itself as it replaces the BFF.
#  trying to use the static web app URL will create a cycle between BFF and the SPA modules
# resource "azurerm_app_configuration_key" "redirect_uri" {
#   configuration_store_id = azurerm_app_configuration.configuration.id
#   key                    = "VITE_AUTH_REDIRECT_URI"
#   value                  = 

#   depends_on = [azurerm_role_assignment.configuration_writer]
# }