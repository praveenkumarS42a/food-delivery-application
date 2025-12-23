const express = require('express');
const axios = require('axios');
const app = express();
const PORT = process.env.PORT || 4000;

app.use(express.json());

app.get('/health', (req, res) => res.json({ status: 'ok', service: 'message-broker' }));

// In-memory subscription store: { topic: [url1, url2] }
const subscribers = {};

console.log(`[Message Broker] Starting...`);

// Subscribe Endpoint
app.post('/subscribe', (req, res) => {
    const { topic, url } = req.body;
    if (!subscribers[topic]) {
        subscribers[topic] = [];
    }
    if (!subscribers[topic].includes(url)) {
        subscribers[topic].push(url);
        console.log(`[Message Broker] New Subscriber for '${topic}': ${url}`);
    }
    res.json({ status: 'subscribed', topic, url });
});

// Publish Endpoint
app.post('/publish', async (req, res) => {
    const { topic, data } = req.body;
    console.log(`[Message Broker] Received event for '${topic}'`);

    const urls = subscribers[topic] || [];

    // Notify all subscribers (Async fire-and-forget for simulation)
    urls.forEach(async (url) => {
        try {
            console.log(`[Message Broker] Forwarding to ${url}...`);
            await axios.post(url, data);
        } catch (err) {
            console.error(`[Message Broker] Failed to push to ${url}: ${err.message}`);
        }
    });

    res.json({ status: 'published', recipients: urls.length });
});

app.listen(PORT, () => {
    console.log(`[Message Broker] Running on http://localhost:${PORT}`);
});
