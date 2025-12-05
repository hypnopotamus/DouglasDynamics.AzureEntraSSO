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

#todo: logout url (i.e. frontchannel logout) needs entra to be on the same custom domain as the frontend app
#  otherwise browser default security policies will prevent the hidden iframe from interacting with cookies / localstorage
resource "azuread_application_registration" "registration" {
  display_name = var.name

  implicit_access_token_issuance_enabled = true
  implicit_id_token_issuance_enabled     = true
  logout_url                             = var.single_signout_uri
}

resource "azuread_application_identifier_uri" "identifier" {
  application_id = azuread_application_registration.registration.id
  identifier_uri = "api://${azuread_application_registration.registration.client_id}"
}

resource "random_uuid" "access_id" {}

resource "azuread_application_permission_scope" "access" {
  application_id = azuread_application_registration.registration.id
  scope_id       = random_uuid.access_id.id
  value          = "access"
  type           = "Admin"

  admin_consent_description  = "access the application"
  admin_consent_display_name = "access"
}

resource "azuread_application_redirect_uris" "spa_redirects" {
  count = length(var.oauth_redirect_uris) == 0 ? 0 : 1

  application_id = azuread_application_registration.registration.id
  type           = "SPA"

  redirect_uris = var.oauth_redirect_uris
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
  value                  = azuread_application_registration.registration.client_id

  depends_on = [azurerm_role_assignment.configuration_writer]
}
