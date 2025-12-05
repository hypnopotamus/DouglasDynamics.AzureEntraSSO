terraform {
  required_providers {
    azurerm = {
      source  = "hashicorp/azurerm"
      version = "~> 4.54.0"
    }
    azuread = {
      source  = "hashicorp/azuread"
      version = "~> 3.7.0"
    }
  }

  required_version = ">= 1.14.0"
}

locals {
  role_members = flatten([for _, role_value in var.app_roles : [for member in role_value.members : { id = role_value.id, member = member }]])
}

data "azurerm_client_config" "current" {}

resource "azurerm_container_app" "app" {
  name                         = var.name
  container_app_environment_id = var.container_app_environment_id
  resource_group_name          = var.resource_group_name
  revision_mode                = "Single"

  template {
    container {
      name   = var.name
      image  = var.container_image
      cpu    = 0.25
      memory = "0.5Gi"
    }
    min_replicas = 1
    max_replicas = 1
  }

  lifecycle {
    ignore_changes = [
      template[0].container[0].image,
      registry
    ]
  }

  identity {
    type = "SystemAssigned"
  }
}

resource "azurerm_role_assignment" "app_cert_read" {
  count = length(var.downstream_apis) == 0 ? 0 : 1

  scope                            = "${var.key_vault_id}/certificates/${azurerm_key_vault_certificate.cert[count.index].name}"
  role_definition_name             = "Key Vault Certificate User"
  principal_id                     = azurerm_container_app.app.identity[0].principal_id
  skip_service_principal_aad_check = true
}

resource "azurerm_role_assignment" "app_cert_secret_read" {
  count = length(var.downstream_apis) == 0 ? 0 : 1

  scope                            = "${var.key_vault_id}/certificates/${azurerm_key_vault_certificate.cert[count.index].name}"
  role_definition_name             = "Key Vault Secrets User"
  principal_id                     = azurerm_container_app.app.identity[0].principal_id
  skip_service_principal_aad_check = true
}

resource "azurerm_role_assignment" "configuration_reader" {
  scope                            = azurerm_app_configuration.configuration.id
  role_definition_name             = "App Configuration Data Reader"
  principal_id                     = azurerm_container_app.app.identity[0].principal_id
  skip_service_principal_aad_check = true
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

resource "azuread_application_registration" "registration" {
  display_name = var.name

  implicit_access_token_issuance_enabled = false
  implicit_id_token_issuance_enabled     = true
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

resource "azuread_application_pre_authorized" "authorization" {
  count = length(var.authorized_clients)

  application_id       = azuread_application_registration.registration.id
  authorized_client_id = var.authorized_clients[count.index]
  permission_ids       = [azuread_application_permission_scope.access.scope_id]
}

resource "azuread_application_app_role" "app_roles" {
  for_each = var.app_roles

  application_id = azuread_application_registration.registration.id
  role_id        = each.value.id

  allowed_member_types = ["User"]
  description          = each.value.description
  display_name         = each.value.display_name
  value                = each.key
}

resource "azuread_service_principal" "registration_principal" {
  client_id = azuread_application_registration.registration.client_id
}

resource "azuread_app_role_assignment" "app_role_assignments" {
  count = length(local.role_members)

  app_role_id         = local.role_members[count.index].id
  principal_object_id = local.role_members[count.index].member
  resource_object_id  = azuread_service_principal.registration_principal.object_id
}

resource "azurerm_key_vault_certificate" "cert" {
  count = length(var.downstream_apis) == 0 ? 0 : 1

  name         = "cert-entra-${var.name}"
  key_vault_id = var.key_vault_id

  certificate_policy {
    issuer_parameters {
      #todo: use a real CA
      name = "Self"
    }

    key_properties {
      exportable = true
      key_size   = 2048
      key_type   = "RSA"
      reuse_key  = true
    }

    lifetime_action {
      action {
        action_type = "AutoRenew"
      }

      trigger {
        days_before_expiry = 30
      }
    }

    secret_properties {
      content_type = "application/x-pkcs12"
    }

    x509_certificate_properties {
      key_usage = [
        "dataEncipherment",
        "digitalSignature",
        "keyCertSign",
        "keyEncipherment",
      ]
      extended_key_usage = ["1.3.6.1.5.5.7.3.2"]

      subject            = "CN=${var.name}-entra-certificate"
      validity_in_months = 12
    }
  }
}

resource "azuread_application_certificate" "entra-cert" {
  count = length(var.downstream_apis) == 0 ? 0 : 1

  application_id = azuread_application_registration.registration.id
  type           = "AsymmetricX509Cert"
  encoding       = "hex"
  value          = azurerm_key_vault_certificate.cert[count.index].certificate_data
  end_date       = azurerm_key_vault_certificate.cert[count.index].certificate_attribute[0].expires
  start_date     = azurerm_key_vault_certificate.cert[count.index].certificate_attribute[0].not_before
}

resource "azurerm_app_configuration" "configuration" {
  name                = "ac-${var.name}"
  resource_group_name = var.resource_group_name
  location            = var.location
  sku                 = "developer"

  data_plane_proxy_authentication_mode = "Pass-through"
  local_auth_enabled                   = false
}

resource "azurerm_app_configuration_key" "tenant_id" {
  configuration_store_id = azurerm_app_configuration.configuration.id
  key                    = "AzureAd:TenantId"
  value                  = data.azurerm_client_config.current.tenant_id

  depends_on = [azurerm_role_assignment.configuration_writer]
}

resource "azurerm_app_configuration_key" "client_id" {
  configuration_store_id = azurerm_app_configuration.configuration.id
  key                    = "AzureAd:ClientId"
  value                  = azuread_application_registration.registration.client_id

  depends_on = [azurerm_role_assignment.configuration_writer]
}

resource "azurerm_app_configuration_key" "downstream_client_id" {
  for_each = var.downstream_apis

  configuration_store_id = azurerm_app_configuration.configuration.id
  key                    = "AzureAd:${each.key}:ClientId"
  value                  = each.value

  depends_on = [azurerm_role_assignment.configuration_writer]
}

resource "azurerm_app_configuration_key" "vault_url" {
  count = length(var.downstream_apis) == 0 ? 0 : 1

  configuration_store_id = azurerm_app_configuration.configuration.id
  key                    = "AzureAd:ClientCredentials:KeyVaultUrl"
  value                  = var.key_vault_url

  depends_on = [azurerm_role_assignment.configuration_writer]
}

resource "azurerm_app_configuration_key" "cert_name" {
  count = length(var.downstream_apis) == 0 ? 0 : 1

  configuration_store_id = azurerm_app_configuration.configuration.id
  key                    = "AzureAd:ClientCredentials:KeyVaultCertificateName"
  value                  = azurerm_key_vault_certificate.cert[count.index].name

  depends_on = [azurerm_role_assignment.configuration_writer]
}

resource "azurerm_app_configuration_key" "cert_thumbprint" {
  count = length(var.downstream_apis) == 0 ? 0 : 1

  configuration_store_id = azurerm_app_configuration.configuration.id
  key                    = "AzureAd:ClientCredentials:ThumbPrint"
  value                  = azurerm_key_vault_certificate.cert[count.index].thumbprint

  depends_on = [azurerm_role_assignment.configuration_writer]
}
