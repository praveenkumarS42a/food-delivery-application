const express = require('express');
const axios = require('axios');
const mongoose = require('mongoose');
const app = express();
const PORT = process.env.PORT || 8080;

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/food-delivery';
const BROKER_URL = process.env.BROKER_URL || 'http://localhost:4000/subscribe';
const SELF_URL = process.env.SELF_URL || `http://localhost:${PORT}/events`;

app.use(express.json());

app.get('/health', (req, res) => res.json({ status: 'ok', service: 'restaurant-service' }));

// MongoDB Connection
const connectDB = async () => {
  try {
    console.log('⏳ Restaurant Service connecting to MongoDB...');
    await mongoose.connect(MONGO_URI, {
      serverSelectionTimeoutMS: 30000 // Increased to 30s
    });
    console.log('✅ Restaurant Service connected to MongoDB Atlas!');
    await seedMenu();
  } catch (err) {
    console.error('❌ Restaurant Service MongoDB CONNECTION ERROR:');
    console.error(err.message);
    console.log('💡 TIP: Check if your IP is whitelisted in MongoDB Atlas (Network Access).');
  }
};

// Menu Schema
const MenuSchema = new mongoose.Schema({
  name: String,
  price: Number
});
const MenuItem = mongoose.model('MenuItem', MenuSchema);

// Seed Menu
async function seedMenu() {
  console.log('🌱 Refreshing Menu with INR prices...');
  await MenuItem.deleteMany({}); // Clear old USD prices
  await MenuItem.insertMany([
    { name: "Margherita Pizza", price: 399 },
    { name: "Paneer Tikka Burger", price: 189 },
    { name: "Butter Chicken Pasta", price: 449 },
    { name: "Masala Dosa", price: 120 },
    { name: "Chole Bhature", price: 150 },
    { name: "Gulab Jamun", price: 80 },
    { name: "Mango Lassi", price: 60 },
    { name: "Cold Coffee", price: 110 }
  ]);
  console.log('✅ Menu seeded successfully');
}

// 1. Subscribe to Message Broker
async function subscribe(attempts = 0) {
  try {
    console.log(`📡 Attempting to subscribe to: ${BROKER_URL}... (Attempt ${attempts + 1})`);
    await axios.post(BROKER_URL, { topic: 'ORDER_CREATED', url: SELF_URL });
    console.log('✅ Subscribed to ORDER_CREATED events');
  } catch (err) {
    const status = err.response ? err.response.status : 'NETWORK_ERROR';
    console.log(`❌ Subscription failed [${status}]: ${err.message}`);

    if (status === 429) {
      console.log('💡 Rate Limited! Waiting longer before retry...');
    }

    // Exponential backoff: 5s, 10s, 20s, up to 1 minute
    const delay = Math.min(Math.pow(2, attempts) * 5000, 60000);
    console.log(`⏳ Retrying in ${delay / 1000} seconds...`);
    setTimeout(() => subscribe(attempts + 1), delay);
  }
}

// 2. Event Handler
app.post('/events', (req, res) => {
  console.log(`\n🔔[Restaurant Service] RECEIVED EVENT: `, req.body);
  console.log(`   -> Preparing food...`);
  res.sendStatus(200);
});

// 3. Menu Endpoint (Fetch from DB)
app.get('/menu', async (req, res) => {
  try {
    const items = await MenuItem.find({}, { _id: 0, name: 1, price: 1 });
    // Convert to previous format { "Pizza": 12.99 } for compatibility
    const menuObj = {};
    items.forEach(i => menuObj[i.name] = i.price);
    res.json(menuObj);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const startServer = () => {
  app.listen(PORT, () => {
    console.log(`[Restaurant Service - Node] Starting on port ${PORT} `);
    subscribe();
    connectDB();
  });
};

startServer();
