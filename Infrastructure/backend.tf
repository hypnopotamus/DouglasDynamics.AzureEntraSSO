terraform {
  backend "azurerm" {
    resource_group_name  = "tfstate"
    storage_account_name = "tfstatedouglasdynamics"
    container_name       = "tfstate"
    key                  = "terraform.tfstate"
  }
}
