const express = require('express');
const axios = require('axios');
const cors = require('cors');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Environment Configuration
const ORDER_SERVICES = (process.env.ORDER_SERVICE_URLS || 'http://localhost:8001,http://localhost:8002').split(',');
const RESTAURANT_SERVICE = process.env.RESTAURANT_SERVICE || 'http://localhost:8080';
const USER_SERVICE = process.env.USER_SERVICE || 'http://localhost:5000';

let currentOrderServiceIndex = 0;

// Helper: Round Robin Selection
function getNextOrderService() {
    const url = ORDER_SERVICES[currentOrderServiceIndex];
    currentOrderServiceIndex = (currentOrderServiceIndex + 1) % ORDER_SERVICES.length;
    return url;
}

console.log(`[API Gateway] Starting on port ${PORT}...`);

// 0. Proxy Auth Requests to User Service
app.post('/auth*', async (req, res) => {
    // Forward /auth/login -> /login, /auth/signup -> /signup
    // OR keep strict path mapping. Let's assume gateway /auth/login -> user-service /login
    const path = req.path.replace('/auth', '');
    console.log(`[API Gateway] Routing Auth to: ${USER_SERVICE}${path}`);

    try {
        const response = await axios.post(`${USER_SERVICE}${path}`, req.body);
        res.json(response.data);
    } catch (err) {
        console.error(`[API Gateway] Auth Failed: ${err.message}`);
        res.status(err.response?.status || 500).json(err.response?.data || { error: 'Auth Service Unavailable' });
    }
});

// 1. Proxy to Order Service (with Load Balancing)
app.post('/orders', async (req, res) => {
    const targetService = getNextOrderService();
    console.log(`[API Gateway] Routing Order to: ${targetService}`);

    try {
        const response = await axios.post(`${targetService}/orders`, req.body);
        res.json(response.data);
    } catch (err) {
        console.error(`[API Gateway] Order Service Failed: ${err.message}`);
        res.status(502).json({ error: 'Order Service Unavailable' });
    }
});

app.get('/orders/user/:id', async (req, res) => {
    const targetService = getNextOrderService();
    console.log(`[API Gateway] Routing Order History to: ${targetService}`);

    try {
        const response = await axios.get(`${targetService}/orders/user/${req.params.id}`);
        res.json(response.data);
    } catch (err) {
        console.error(`[API Gateway] Order Service Failed: ${err.message}`);
        res.status(502).json({ error: 'Order Service Unavailable' });
    }
});

// 2. Proxy to Restaurant Service (Direct)
app.get('/menu', async (req, res) => {
    try {
        const response = await axios.get(`${RESTAURANT_SERVICE}/menu`);
        res.json(response.data);
    } catch (err) {
        console.error(`[API Gateway] Restaurant Service Failed: ${err.message}`);
        res.status(502).json({ error: 'Restaurant Service Unavailable' });
    }
});

app.listen(PORT, () => {
    console.log(`[API Gateway] Running on http://localhost:${PORT}`);
});
