const mongoose = require('mongoose');

const MONGO_URI = "mongodb+srv://food-delivery-app:Praveen%40123@cluster0.asjdf56.mongodb.net/food-delivery?retryWrites=true&w=majority";

const MenuSchema = new mongoose.Schema({
    name: String,
    price: Number
});

const MenuItem = mongoose.model('MenuItem', MenuSchema);

const menuData = [
    { name: "Margherita Pizza", price: 399 },
    { name: "Paneer Tikka Burger", price: 189 },
    { name: "Butter Chicken Pasta", price: 449 },
    { name: "Masala Dosa", price: 120 },
    { name: "Chole Bhature", price: 150 },
    { name: "Gulab Jamun", price: 80 },
    { name: "Mango Lassi", price: 60 },
    { name: "Cold Coffee", price: 110 }
];

async function seed() {
    try {
        console.log("📡 Connecting to MongoDB Atlas for seeding...");
        await mongoose.connect(MONGO_URI, { serverSelectionTimeoutMS: 30000 });
        console.log("✅ Connected!");

        console.log("🗑️ Clearing existing items...");
        await MenuItem.deleteMany({});

        console.log("🌱 Inserting menu items...");
        await MenuItem.insertMany(menuData);

        console.log("✨ Seeding completed successfully!");
        process.exit(0);
    } catch (err) {
        console.error("❌ Seeding failed:");
        console.error(err.message);
        console.log("💡 Ensure your IP is whitelisted in MongoDB Atlas Network Access.");
        process.exit(1);
    }
}

seed();
