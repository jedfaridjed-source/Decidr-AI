require('dotenv').config();

const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const News = require('./model/news');
const Crypto = require('./model/crypto');

const app = express();


// =========================
// 🔥 GLOBAL MIDDLEWARE (FIRST)
// =========================
app.use(cors({
  origin: 'http://localhost:4200',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true
}));

app.use(express.json());


const crypto = require('crypto');
global.crypto = crypto;
// =========================
// 🔥 ROUTES
// =========================
const decisionRoute = require('./routes/decision');
const { processOneNews } = require('./workers/llm.worker');

// 👉 TEST LLM ROUTE
// app.get('/api/test-llm', async (req, res) => {
//   try {
//     await processOneNews();
//     res.json({ message: 'LLM executed' });
//   } catch (err) {
//     console.error('❌ LLM TEST ERROR:', err);
//     res.status(500).json({ error: err.message });
//   }
// });

// 👉 DECISION ROUTES
app.use('/api/decision', decisionRoute);

// 👉 FEED
app.get('/api/decisions-feed', async (req, res) => {
  try {
    res.json({ status: 'ok' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// =========================
// 🔥 BACKGROUND JOBS (LOAD AFTER APP INIT)
// =========================
// require('./cron/news.cron');
require('./cron/crypto.cron');
require('./workers/news.worker');
// require('./workers/llm.worker');
require('./workers/crypto.worker');

// =========================
// 🔥 DATABASE
// =========================
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ MongoDB connected'))
  .catch(err => console.log('❌ MongoDB error:', err));

app.get('/api/crypto', async (req, res) => {
  try {
    const crypto = await Crypto.find().sort({ createdAt: -1 });
    res.json(crypto);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch crypto data' });
  }
});


app.get('/news', async (req, res) => {
  try {
    const news = await News.find().sort({ createdAt: -1 });
    res.json(news);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch news' });
  }
});

// =========================
// 🔥 SERVER START
// =========================
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});