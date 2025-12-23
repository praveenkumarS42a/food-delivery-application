$ErrorActionPreference = "SilentlyContinue"

$CLOUD_URL = "mongodb+srv://food-delivery-app:Praveen%40123@cluster0.asjdf56.mongodb.net/food-delivery?retryWrites=true&w=majority"

Write-Host "Starting Food Delivery App Services (Cloud DB)..." -ForegroundColor Green
# 0. Seed Database
Write-Host "🌱 Seeding Menu Data to Atlas..." -ForegroundColor Green
cd restaurant-service; node seed-db.js; cd ..

# 1. Start Message Broker (Port 4000)
Start-Process powershell -ArgumentList "-NoExit", "-Command", "& {cd 'message-broker'; npm start}"
Write-Host "Started Message Broker (Port 4000)"

# 1.5 Start User Service (Port 5000 - Node.js/Mongo)
Start-Process powershell -ArgumentList "-NoExit", "-Command", "& { `$env:MONGO_URI='$CLOUD_URL'; cd 'user-service'; npm start }"
Write-Host "Started User Service (Port 5000)"

# 2. Start Restaurant Service (Port 8080 - Node.js)
Start-Process powershell -ArgumentList "-NoExit", "-Command", "& { `$env:MONGO_URI='$CLOUD_URL'; cd 'restaurant-service'; npm start }"
Write-Host "Started Restaurant Service (Node.js - Port 8080)"

# 3. Start Order Service Instance 1 (Port 8001 - Python)
Start-Process powershell -ArgumentList "-NoExit", "-Command", "& { `$env:MONGO_URI='$CLOUD_URL'; cd 'order-service'; python main.py 8001 }"
Write-Host "Started Order Service Instance 1 (Python - Port 8001)"

# 4. Start Order Service Instance 2 (Port 8002 - Python)
Start-Process powershell -ArgumentList "-NoExit", "-Command", "& { `$env:MONGO_URI='$CLOUD_URL'; cd 'order-service'; python main.py 8002 }"
Write-Host "Started Order Service Instance 2 (Python - Port 8002)"

# 5. Start API Gateway (Port 3000)
Start-Process powershell -ArgumentList "-NoExit", "-Command", "& {cd 'api-gateway'; npm start}"
Write-Host "Started API Gateway (Node.js - Port 3000)"

# 6. Start Frontend (Port 5173 - Vite)
Start-Process powershell -ArgumentList "-NoExit", "-Command", "& {cd 'frontend'; npm run dev}"
Write-Host "Started Frontend (React - Port 5173)"

Write-Host "All services launching... check the new windows." -ForegroundColor Yellow
Write-Host "OPEN THIS URL: http://localhost:5173"

