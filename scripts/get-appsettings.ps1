# ECONEURA - Get App Settings
# Uso: .\scripts\get-appsettings.ps1

param(
    [string]$AppName = "econeura-backend-prod",
    [string]$ResourceGroup = "appsvc_linux_northeurope_basic"
)

$required = @("JWT_ACCESS_SECRET","JWT_REFRESH_SECRET","NODE_ENV","PORT","FRONTEND_URL","MICROSOFT_CLIENT_ID","MICROSOFT_CLIENT_SECRET","DATABASE_URL","REDIS_URL","OPENAI_API_KEY","SESSION_SECRET","CORS_ORIGIN")

az webapp config appsettings list --name $AppName --resource-group $ResourceGroup --output json | 
    ConvertFrom-Json | 
    Where-Object { $_.name -in $required } | 
    Select-Object name, @{Name='Configured';Expression={$_.value -ne $null -and $_.value -ne '' -and $_.value -notlike '*placeholder*' -and $_.value -notlike '*PENDIENTE*'}} | 
    Format-Table -AutoSize

