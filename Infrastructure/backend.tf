terraform {
  backend "azurerm" {
    resource_group_name  = "tfstate"
    #storage_account_name = "tfstatedouglasdynamics"
    storage_account_name = "tfstatedouglasdynamicscd"
    container_name       = "tfstate"
    key                  = "terraform.tfstate"
  }
}
