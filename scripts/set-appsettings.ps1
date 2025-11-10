# ECONEURA - Set App Settings (REST API)
# Uso: .\scripts\set-appsettings.ps1

param(
    [string]$AppName = "econeura-backend-prod",
    [string]$ResourceGroup = "appsvc_linux_northeurope_basic",
    [string]$SubscriptionId = "fc22ced4-6dc1-4f52-aac1-170a62f98c57"
)

$token = (az account get-access-token --resource https://management.azure.com --query accessToken -o tsv)
$uri = "https://management.azure.com/subscriptions/$SubscriptionId/resourceGroups/$ResourceGroup/providers/Microsoft.Web/sites/$AppName/config/appsettings?api-version=2021-02-01"

$current = Invoke-RestMethod -Uri $uri -Headers @{Authorization="Bearer $token"} -ErrorAction SilentlyContinue
$settings = if ($current) { $current.properties } else { @{} }

# Añadir settings aquí
# $settings.KEY = "value"

$body = @{ properties = $settings } | ConvertTo-Json -Depth 10
Invoke-RestMethod -Uri $uri -Method PUT -Headers @{Authorization="Bearer $token"; "Content-Type"="application/json"} -Body $body

"✅ Settings actualizados en $AppName"

