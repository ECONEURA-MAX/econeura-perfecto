# ECONEURA - Create Config Snapshot
# Uso: .\scripts\create-snapshot.ps1

param(
    [string]$AppName = "econeura-backend-prod",
    [string]$ResourceGroup = "appsvc_linux_northeurope_basic"
)

$timestamp = Get-Date -Format "yyyyMMdd_HHmmss"

$snapshot = @{
    timestamp = $timestamp
    app_name = $AppName
    settings = (az webapp config appsettings list --name $AppName --resource-group $ResourceGroup --output json | ConvertFrom-Json)
} | ConvertTo-Json -Depth 10

New-Item -ItemType Directory -Path ".private-docs/snapshots" -Force | Out-Null
$snapshot | Out-File ".private-docs/snapshots/${timestamp}_${AppName}_appsettings.json" -Encoding utf8

"✅ Snapshot guardado: .private-docs/snapshots/${timestamp}_${AppName}_appsettings.json"

