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

resource "azurerm_resource_group" "douglas_dynamics" {
  name     = "rg-douglas-dynamics"
  location = "Central US"
}

resource "azurerm_key_vault" "app_vault" {
  name                       = "kv-douglas-dynamics"
  location                   = azurerm_resource_group.douglas_dynamics.location
  resource_group_name        = azurerm_resource_group.douglas_dynamics.name
  tenant_id                  = data.azurerm_client_config.current.tenant_id
  soft_delete_retention_days = 7

  sku_name = "standard"

  access_policy {
    tenant_id = data.azurerm_client_config.current.tenant_id
    object_id = data.azurerm_client_config.current.object_id

    key_permissions = [
      "Get",
    ]

    secret_permissions = [
      "Get",
    ]

    storage_permissions = [
      "Get",
    ]
  }
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

resource "azurerm_role_assignment" "acr_pull" {
  principal_id                     = azurerm_container_app_environment.container_app_environment.identity[0].principal_id
  role_definition_name             = "AcrPull"
  scope                            = azurerm_container_registry.acr.id
  skip_service_principal_aad_check = true
}

module "backend_for_frontend" {
  source                       = "./modules/API"
  name                         = "app-dd-backend-for-frontend"
  resource_group_name          = azurerm_resource_group.douglas_dynamics.name
  container_app_environment_id = azurerm_container_app_environment.container_app_environment.id
  container_image              = local.placeholder_container
}

module "backendone" {
  source                       = "./modules/API"
  name                         = "app-dd-backendone"
  resource_group_name          = azurerm_resource_group.douglas_dynamics.name
  container_app_environment_id = azurerm_container_app_environment.container_app_environment.id
  container_image              = local.placeholder_container
}

module "backendtwo" {
  source                       = "./modules/API"
  name                         = "app-dd-backendtwo"
  resource_group_name          = azurerm_resource_group.douglas_dynamics.name
  container_app_environment_id = azurerm_container_app_environment.container_app_environment.id
  container_image              = local.placeholder_container

}

module "backendthree" {
  source                       = "./modules/API"
  name                         = "app-dd-backendthree"
  resource_group_name          = azurerm_resource_group.douglas_dynamics.name
  container_app_environment_id = azurerm_container_app_environment.container_app_environment.id
  container_image              = local.placeholder_container
}

module "frontend" {
  source              = "./modules/single-page-app"
  name                = "spa-dd-frontend"
  resource_group_name = azurerm_resource_group.douglas_dynamics.name
  location            = azurerm_resource_group.douglas_dynamics.location
}

module "dice_frontend" {
  source              = "./modules/single-page-app"
  name                = "spa-dd-dice-frontend"
  resource_group_name = azurerm_resource_group.douglas_dynamics.name
  location            = azurerm_resource_group.douglas_dynamics.location
}
