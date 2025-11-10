# ECONEURA - Smoke Tests
# Uso: .\scripts\smoke-test.ps1

$tests = @(
    @{ Name="Backend Health Simple"; Url="https://econeura-backend-prod.azurewebsites.net/api/health/simple"; Expected=200 },
    @{ Name="Backend Health Full"; Url="https://econeura-backend-prod.azurewebsites.net/api/health"; Expected=200 },
    @{ Name="Frontend Home"; Url="https://econeura.com"; Expected=200 },
    @{ Name="Microsoft OAuth Init"; Url="https://econeura-backend-prod.azurewebsites.net/api/auth/microsoft"; Expected=302 }
)

foreach ($test in $tests) {
    try {
        $response = Invoke-WebRequest $test.Url -Method GET -MaximumRedirection 0 -TimeoutSec 10 -ErrorAction SilentlyContinue
        $status = $response.StatusCode
    } catch {
        $status = $_.Exception.Response.StatusCode.value__
    }
    
    if ($status -eq $test.Expected) {
        "✅ $($test.Name): OK ($status)"
    } else {
        "❌ $($test.Name): FAIL (esperado $($test.Expected), recibido $status)"
    }
}

