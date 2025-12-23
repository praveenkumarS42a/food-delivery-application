const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const app = express();
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/food-delivery';
const JWT_SECRET = 'supersecretkey123';

app.use(express.json());

app.get('/health', (req, res) => res.json({ status: 'ok', service: 'user-service' }));

// Database Connection Middleware
app.use((req, res, next) => {
    const status = mongoose.connection.readyState;
    if (status !== 1) {
        let msg = "Database is connecting...";
        if (status === 0) msg = "Database is disconnected. Please check your internet or Atlas IP whitelist.";
        if (status === 2) msg = "Database is still connecting. If this takes more than 30 seconds, your IP might not be whitelisted in MongoDB Atlas.";

        return res.status(503).json({
            error: msg,
            hint: "Check the 'User Service' terminal window for specific ❌ errors.",
            your_ip: "103.194.242.178"
        });
    }
    next();
});

// MongoDB Connection Configuration
mongoose.set('bufferCommands', false); // Disable buffering to see errors immediately

const connectDB = async () => {
    try {
        console.log(`📡 Attempting to connect to Cloud DB...`);
        // Redacted logging to verify URI existence without exposing password
        if (!MONGO_URI || MONGO_URI.includes('localhost')) {
            console.log('⚠️ Warning: Using Localhost or Empty URI instead of Cloud Atlas!');
        }

        await mongoose.connect(MONGO_URI, {
            serverSelectionTimeoutMS: 30000, // Increased to 30s for Atlas free tier
            socketTimeoutMS: 45000,
        });
        console.log('✅ User Service connected to MongoDB Atlas!');
        return true;
    } catch (err) {
        console.error('❌ User Service CONNECTION ERROR:');
        console.error(`   Message: ${err.message}`);
        console.log('💡 TROUBLESHOOTING:');
        console.log('   1. Ensure you added "0.0.0.0/0" in MongoDB Atlas -> Network Access.');
        console.log('   2. Restart the app using ".\stop-all.ps1" and ".\start-cloud.ps1".');
        return false;
    }
};

// Start Server immediately and connect to DB in background
const startServer = () => {
    app.listen(PORT, () => {
        console.log(`[User Service] Running on http://localhost:${PORT}`);
        connectDB();
    });
};

startServer();

// User Schema
const UserSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    name: String
});
const User = mongoose.model('User', UserSchema);

// Signup Endpoint
app.post('/signup', async (req, res) => {
    try {
        const { email, password, name } = req.body;
        const existingUser = await User.findOne({ email });
        if (existingUser) return res.status(400).json({ error: 'User already exists' });

        const hashedPassword = await bcrypt.hash(password, 10);
        const user = new User({ email, password: hashedPassword, name });
        await user.save();

        res.status(201).json({ message: 'User created successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Login Endpoint
app.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        if (!user) return res.status(400).json({ error: 'User not found' });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ error: 'Invalid credentials' });

        const token = jwt.sign({ id: user._id, email: user.email }, JWT_SECRET, { expiresIn: '1h' });
        res.json({ token, user: { id: user._id, name: user.name, email: user.email } });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

