Write-Host "`n🚀 STARTING AND VERIFYING PROJECT 🚀" -ForegroundColor Cyan
Write-Host "=================================="

# 1. Start everything using your existing cloud script
.\start-cloud.ps1

Write-Host "`n⏳ Waiting 10 seconds for services to initialize..." -ForegroundColor Gray
Start-Sleep -s 10

# 2. Run the health check
.\check-health.ps1

Write-Host "DONE! If all checks are green, your project is running perfectly.`n" -ForegroundColor Green
