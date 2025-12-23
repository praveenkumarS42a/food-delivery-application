$ports = @(3000, 4000, 8001, 8002, 8080, 5000, 5173)

Write-Host "Stopping Food Delivery App Services..." -ForegroundColor Yellow

foreach ($port in $ports) {
    $process = Get-NetTCPConnection -LocalPort $port -ErrorAction SilentlyContinue
    if ($process) {
        $pid_to_kill = $process.OwningProcess
        Stop-Process -Id $pid_to_kill -Force -ErrorAction SilentlyContinue
        Write-Host "Killed process on port $port (PID: $pid_to_kill)" -ForegroundColor Green
    } else {
        Write-Host "No process found on port $port" -ForegroundColor Gray
    }
}

Write-Host "All specified services stopped." -ForegroundColor Green
