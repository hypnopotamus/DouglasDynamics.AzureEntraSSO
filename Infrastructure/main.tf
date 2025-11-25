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
  features {}
}

provider "azuread" {
  tenant_id = var.entra_tenant_id
}
