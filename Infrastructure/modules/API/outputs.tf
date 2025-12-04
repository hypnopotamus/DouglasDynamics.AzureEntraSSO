output "registration_client_id" {
  description = "The Client ID of the backend application registration."
  value       = azuread_application_registration.registration.client_id
}