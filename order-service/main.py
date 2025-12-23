from fastapi import FastAPI
import uvicorn
import httpx
import sys
import motor.motor_asyncio

import os

PORT = int(sys.argv[1]) if len(sys.argv) > 1 else int(os.environ.get("PORT", 8001))
BROKER_URL = os.environ.get("BROKER_URL", "http://localhost:4000/publish")
MONGO_URI = os.environ.get("MONGO_URI", "mongodb://localhost:27017")

app = FastAPI()

# MongoDB Connection
client = motor.motor_asyncio.AsyncIOMotorClient(MONGO_URI)
db = client['food-delivery']
orders_collection = db['orders']

@app.on_event("startup")
async def startup_event():
    print(f"📡 [Order Service - Python] Starting on port {PORT}...")
    print(f"📡 Attempting to connect to MongoDB Atlas...")
    try:
        # Check connection on startup
        await client.admin.command('ping')
        print(f"✅ [Order Service] Successfully connected to MongoDB")
    except Exception as e:
        print(f"❌ [Order Service] MongoDB Connection Error: {e}")
        print(f"💡 TIP: Check if your IP is whitelisted in MongoDB Atlas.")

@app.post("/orders")
async def create_order(order: dict):
    print(f"[Order Service : {PORT}] Received Order Request")
    
    # 1. Save to MongoDB
    new_order = {
        "items": order.get("items"),
        "status": "Pending",
        "handledBy": f"OrderService-{PORT}",
        "user_id": order.get("user_id"),
        "payment_method": order.get("payment", {}).get("method"),
        "subtotal": order.get("payment", {}).get("subtotal"),
        "total": order.get("payment", {}).get("total"),
        "gst": order.get("payment", {}).get("gst"),
        "service_fee": order.get("payment", {}).get("serviceFee", 25),
        "timestamp": order.get("timestamp")
    }
    result = await orders_collection.insert_one(new_order)
    order_id = str(result.inserted_id)
    print(f"   -> Saved to DB with ID: {order_id}")

    # 2. Publish Event to Broker
    try:
        async with httpx.AsyncClient() as httpx_client:
            payload = {
                "topic": "ORDER_CREATED",
                "data": {"orderId": order_id, "items": order.get("items"), "origin": f"OrderService-{PORT}"}
            }
            await httpx_client.post(BROKER_URL, json=payload)
            print(f"   -> Published ORDER_CREATED event via Broker")
    except Exception as e:
        print(f"   -> Failed to publish event: {e}")

    return {"status": "created", "orderId": order_id, "handledBy": f"OrderService-{PORT}"}

@app.get("/orders/user/{user_id}")
async def get_user_orders(user_id: str):
    print(f"[Order Service : {PORT}] Fetching orders for user: {user_id}")
    orders = []
    cursor = orders_collection.find({"user_id": user_id}).sort("_id", -1)
    async for document in cursor:
        document["_id"] = str(document["_id"])
        orders.append(document)
    return orders

@app.get("/health")
def health():
    return {"status": "ok", "service": f"OrderService-{PORT}"}

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=PORT)
