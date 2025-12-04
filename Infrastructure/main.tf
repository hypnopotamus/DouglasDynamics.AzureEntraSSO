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

provider "azurerm" {
  subscription_id = var.subscription_id
  features {}
}

provider "azuread" {
  tenant_id = var.entra_tenant_id
}

locals {
  placeholder_container = "mcr.microsoft.com/k8se/quickstart:latest"
}

data "azurerm_client_config" "current" {}

data "azuread_user" "users" {
  count = length(var.dev_group_members)

  mail = var.dev_group_members[count.index]
}

resource "azuread_group" "dev" {
  display_name     = "developers"
  description      = "developers - allows local development access"
  security_enabled = true
  members          = []
}

resource "azuread_group_member" "dev_group_members" {
  count = length(var.dev_group_members)

  group_object_id  = azuread_group.dev.object_id
  member_object_id = data.azuread_user.users[count.index].object_id
}

resource "azurerm_role_assignment" "app_cert_write" {
  principal_id         = data.azurerm_client_config.current.object_id
  role_definition_name = "Key Vault Certificates Officer"
  scope                = azurerm_key_vault.app_vault.id
}

resource "azurerm_role_assignment" "dev_cert_read" {
  count = length(var.dev_group_members) == 1 ? 1 : 0

  principal_id         = azuread_group.dev.object_id
  role_definition_name = "Key Vault Certificate User"
  scope                = azurerm_key_vault.app_vault.id
}

resource "azurerm_role_assignment" "dev_app_cert_secret_read" {
  count = length(var.dev_group_members) == 1 ? 1 : 0

  principal_id         = azuread_group.dev.object_id
  role_definition_name = "Key Vault Secrets User"
  scope                = azurerm_key_vault.app_vault.id
}

resource "azurerm_role_assignment" "acr_pull" {
  principal_id                     = azurerm_container_app_environment.container_app_environment.identity[0].principal_id
  role_definition_name             = "AcrPull"
  scope                            = azurerm_container_registry.acr.id
  skip_service_principal_aad_check = true
}

resource "azurerm_resource_group" "douglas_dynamics" {
  name     = "rg-douglas-dynamics"
  location = "Central US"
}

resource "azurerm_key_vault" "app_vault" {
  name                = "kv-douglas-dynamics"
  location            = azurerm_resource_group.douglas_dynamics.location
  resource_group_name = azurerm_resource_group.douglas_dynamics.name
  tenant_id           = data.azurerm_client_config.current.tenant_id
  sku_name            = "standard"

  rbac_authorization_enabled = true
  soft_delete_retention_days = 7
}

resource "azurerm_container_registry" "acr" {
  name                = "acrdouglasdynamics"
  resource_group_name = azurerm_resource_group.douglas_dynamics.name
  location            = azurerm_resource_group.douglas_dynamics.location
  sku                 = "Basic"
  admin_enabled       = true
}

resource "azurerm_log_analytics_workspace" "log_analytics" {
  name                = "law-douglas-dynamics"
  location            = azurerm_resource_group.douglas_dynamics.location
  resource_group_name = azurerm_resource_group.douglas_dynamics.name
  sku                 = "PerGB2018"
  retention_in_days   = 30
}

resource "azurerm_container_app_environment" "container_app_environment" {
  name                       = "cae-douglas-dynamics"
  location                   = azurerm_resource_group.douglas_dynamics.location
  resource_group_name        = azurerm_resource_group.douglas_dynamics.name
  logs_destination           = "log-analytics"
  log_analytics_workspace_id = azurerm_log_analytics_workspace.log_analytics.id

  identity {
    type = "SystemAssigned"
  }
}

#todo: replace with API gateway
# - local: use the self hosted container?
module "backend_for_frontend" {
  source                       = "./modules/API"
  name                         = "app-dd-backend-for-frontend"
  resource_group_name          = azurerm_resource_group.douglas_dynamics.name
  location                     = azurerm_resource_group.douglas_dynamics.location
  container_app_environment_id = azurerm_container_app_environment.container_app_environment.id
  container_image              = local.placeholder_container

  key_vault_id  = azurerm_key_vault.app_vault.id
  key_vault_url = azurerm_key_vault.app_vault.vault_uri

  dev_group_id = azuread_group.dev.object_id

  #todo: and also the redirect URIs based on the front end modules creating resources below
  oauth_redirect_uris = concat(var.frontend_redirect_uris, var.dice_frontend_redirect_uris)
  downstream_apis = {
    backendone   = module.backendone.registration_client_id
    backendtwo   = module.backendtwo.registration_client_id
    backendthree = module.backendthree.registration_client_id
  }

  depends_on = [azurerm_role_assignment.app_cert_write]
}

resource "random_uuid" "backendone_read_id" {}

module "backendone" {
  source                       = "./modules/API"
  name                         = "app-dd-backendone"
  resource_group_name          = azurerm_resource_group.douglas_dynamics.name
  location                     = azurerm_resource_group.douglas_dynamics.location
  container_app_environment_id = azurerm_container_app_environment.container_app_environment.id
  container_image              = local.placeholder_container

  key_vault_id  = azurerm_key_vault.app_vault.id
  key_vault_url = azurerm_key_vault.app_vault.vault_uri

  dev_group_id = azuread_group.dev.object_id
  app_roles = {
    "BackEndOne.Read" = {
      id           = random_uuid.backendone_read_id.id
      description  = "read access to backend one"
      display_name = "BackEndOne.Read"
      members      = [azuread_group.dev.object_id]
    }
  }

  authorized_clients = [module.backend_for_frontend.registration_client_id, module.backendtwo.registration_client_id]

  depends_on = [azurerm_role_assignment.app_cert_write]
}

resource "random_uuid" "backendtwo_read_id" {}

module "backendtwo" {
  source                       = "./modules/API"
  name                         = "app-dd-backendtwo"
  resource_group_name          = azurerm_resource_group.douglas_dynamics.name
  location                     = azurerm_resource_group.douglas_dynamics.location
  container_app_environment_id = azurerm_container_app_environment.container_app_environment.id
  container_image              = local.placeholder_container

  key_vault_id  = azurerm_key_vault.app_vault.id
  key_vault_url = azurerm_key_vault.app_vault.vault_uri

  dev_group_id = azuread_group.dev.object_id
  app_roles = {
    "BackEndTwo.Read" = {
      id           = random_uuid.backendtwo_read_id.id
      description  = "read access to backend two"
      display_name = "BackEndTwo.Read"
      members      = [azuread_group.dev.object_id]
    }
  }

  authorized_clients = [module.backend_for_frontend.registration_client_id]
  downstream_apis = {
    backendone = module.backendone.registration_client_id
  }

  depends_on = [azurerm_role_assignment.app_cert_write]
}

resource "random_uuid" "backendthree_read_id" {}

module "backendthree" {
  source                       = "./modules/API"
  name                         = "app-dd-backendthree"
  resource_group_name          = azurerm_resource_group.douglas_dynamics.name
  location                     = azurerm_resource_group.douglas_dynamics.location
  container_app_environment_id = azurerm_container_app_environment.container_app_environment.id
  container_image              = local.placeholder_container

  key_vault_id  = azurerm_key_vault.app_vault.id
  key_vault_url = azurerm_key_vault.app_vault.vault_uri

  dev_group_id = azuread_group.dev.object_id
  app_roles = {
    "BackEndThree.Read" = {
      id           = random_uuid.backendthree_read_id.id
      description  = "read access to backend three"
      display_name = "BackEndThree.Read"
      members      = [azuread_group.dev.object_id]
    }
  }

  authorized_clients = [module.backend_for_frontend.registration_client_id]

  depends_on = [azurerm_role_assignment.app_cert_write]
}

module "frontend" {
  source              = "./modules/single-page-app"
  name                = "spa-dd-frontend"
  resource_group_name = azurerm_resource_group.douglas_dynamics.name
  location            = azurerm_resource_group.douglas_dynamics.location
  entra_client_id     = module.backend_for_frontend.registration_client_id
  dev_group_id        = azuread_group.dev.object_id
}

module "dice_frontend" {
  source              = "./modules/single-page-app"
  name                = "spa-dd-dice-frontend"
  resource_group_name = azurerm_resource_group.douglas_dynamics.name
  location            = azurerm_resource_group.douglas_dynamics.location
  entra_client_id     = module.backend_for_frontend.registration_client_id
  dev_group_id        = azuread_group.dev.object_id
}
