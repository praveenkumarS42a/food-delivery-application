Write-Host "`n🔍 SERVICE HEALTH CHECK SEQUENCE 🔍" -ForegroundColor Cyan
Write-Host "-------------------------------"

$services = @(
    @{ Name = "API Gateway       "; URL = "http://localhost:3000/menu"; Port = 3000 },
    @{ Name = "User Service      "; URL = "http://localhost:5000/health"; Port = 5000 },
    @{ Name = "Restaurant Service"; URL = "http://localhost:8080/health"; Port = 8080 },
    @{ Name = "Order Service (1) "; URL = "http://localhost:8001/health"; Port = 8001 },
    @{ Name = "Order Service (2) "; URL = "http://localhost:8002/health"; Port = 8002 },
    @{ Name = "Message Broker    "; URL = "http://localhost:4000/health"; Port = 4000 },
    @{ Name = "Frontend (React)  "; URL = "http://localhost:5173"; Port = 5173 }
)

foreach ($service in $services) {
    try {
        $response = Invoke-WebRequest -Uri $service.URL -Method Get -TimeoutSec 2 -ErrorAction Stop
        if ($response.StatusCode -eq 200) {
            Write-Host "[✅] $($service.Name) is UP" -ForegroundColor Green
        } else {
            Write-Host "[⚠️] $($service.Name) responded with status $($response.StatusCode)" -ForegroundColor Yellow
        }
    } catch {
        Write-Host "[❌] $($service.Name) is DOWN (Port $($service.Port))" -ForegroundColor Red
    }
}

Write-Host "-------------------------------"
Write-Host "If any service is DOWN, wait 5 seconds and retry."
Write-Host "Check terminal windows for specific error logs.`n"
