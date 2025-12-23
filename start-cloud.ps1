
$ErrorActionPreference = "SilentlyContinue"
$CLOUD_URL = "mongodb+srv://food-delivery-app:Praveen%40123@cluster0.asjdf56.mongodb.net/food-delivery?retryWrites=true&w=majority"

Write-Host "--- CLOUD STARTUP SEQUENCE ---" -ForegroundColor Cyan
Write-Host "Target: MongoDB Atlas"

# 1. Start Message Broker
Start-Process powershell -ArgumentList "-NoExit", "-Command", "& { cd 'message-broker'; npm start }"

# 2. Start User Service (Wait 1s to stagger)
Start-Sleep -s 1
Start-Process powershell -ArgumentList "-NoExit", "-Command", "& { `$env:MONGO_URI='$CLOUD_URL'; cd 'user-service'; npm start }"

# 3. Start Restaurant Service
Start-Sleep -s 1
Start-Process powershell -ArgumentList "-NoExit", "-Command", "& { `$env:MONGO_URI='$CLOUD_URL'; cd 'restaurant-service'; npm start }"

# 4. Start Order Services
Start-Sleep -s 5
Start-Process powershell -ArgumentList "-NoExit", "-Command", "& { `$env:MONGO_URI='$CLOUD_URL'; cd 'order-service'; python main.py 8001 }"
Start-Sleep -s 1
Start-Process powershell -ArgumentList "-NoExit", "-Command", "& { `$env:MONGO_URI='$CLOUD_URL'; cd 'order-service'; python main.py 8002 }"

# 5. Start Gateway & Frontend
Start-Process powershell -ArgumentList "-NoExit", "-Command", "& { cd 'api-gateway'; npm start }"
Start-Process powershell -ArgumentList "-NoExit", "-Command", "& { cd 'frontend'; npm run dev }"

Write-Host "----------------------------" -ForegroundColor Green
Write-Host "ALL SERVICES STARTED!"
Write-Host "Check the 'User Service' window for '✅' message."
