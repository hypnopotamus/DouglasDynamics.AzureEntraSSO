output "registration_client_id" {
  description = "The Client ID of the frontend application registration."
  value       = azuread_application_registration.registration.client_id
}
