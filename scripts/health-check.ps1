# ECONEURA - Health Check Script
# Uso: .\scripts\health-check.ps1

$checks = @{
    BackendSimple = "https://econeura-backend-prod.azurewebsites.net/api/health/simple"
    BackendFull = "https://econeura-backend-prod.azurewebsites.net/api/health"
    Frontend = "https://econeura.com"
}

foreach ($check in $checks.GetEnumerator()) {
    try {
        $response = Invoke-RestMethod $check.Value -TimeoutSec 10 -ErrorAction Stop
        "✅ $($check.Key): OK"
        if ($check.Key -like "*Backend*") { $response | ConvertTo-Json -Compress }
    } catch {
        "❌ $($check.Key): FAIL - $($_.Exception.Message)"
    }
}

