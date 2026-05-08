require('dotenv').config({
  path: require('path').resolve(__dirname, '../.env')
});

const mongoose = require('mongoose');
const axios = require('axios');
const { Worker } = require('bullmq');

const Crypto = require('../model/crypto');

// =========================
// 🔥 ENV VALIDATION
// =========================
if (!process.env.MONGO_URI) {
  console.error('❌ MONGO_URI missing');
  process.exit(1);
}

if (!process.env.COIN_API_KEY) {
  console.error('❌ COIN_API_KEY missing');
  process.exit(1);
}

// =========================
// 🔥 DB CONNECT (ONCE)
// =========================
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ MongoDB connected'))
  .catch(err => {
    console.error('❌ Mongo error:', err.message);
    process.exit(1);
  });

// =========================
// 🔥 AXIOS INSTANCE (clean)
// =========================
const api = axios.create({
  baseURL: 'https://rest.coinapi.io/v1',
  timeout: 10000
});

// =========================
// 🔥 FETCH FROM COINAPI (FIXED)
// =========================
async function fetchCryptoPrices() {
  try {
    const apiKey = process.env.COIN_API_KEY.trim();

    const res = await axios.get(
      'https://rest.coinapi.io/v1/exchangerate/USD',
      {
        headers: {
          'X-CoinAPI-Key': apiKey
        },
        params: {
          filter_asset_id: 'BTC,ETH,USDT,BNB'
        }
      }
    );

    return res.data?.rates || [];

  } catch (err) {
    console.error(
      '❌ CoinAPI ERROR:',
      err.response?.data || err.message
    );
    return [];
  }
}

// =========================
// 🔥 WORKER
// =========================
const worker = new Worker(
  'cryptoQueue',
  async (job) => {

    if (job.name !== 'update-crypto') return;

    console.log('⚡ Running crypto update...');

    const rates = await fetchCryptoPrices();

    if (!rates.length) {
      console.log('⚠️ No data received');
      return;
    }

    // =========================
    // 🔥 TRANSFORM + BULK
    // =========================
    const bulkOps = [];

    for (const r of rates) {
      if (!r.asset_id_quote || !r.rate) continue;

      bulkOps.push({
        updateOne: {
          filter: { symbol: r.asset_id_quote },
          update: {
            $set: {
              symbol: r.asset_id_quote,
              price_usd: r.rate,
              updatedAt: new Date()
            }
          },
          upsert: true
        }
      });
    }

    if (!bulkOps.length) {
      console.log('⚠️ No valid assets');
      return;
    }

    try {
      await Crypto.bulkWrite(bulkOps);
      console.log(`✅ SAVED: ${bulkOps.length} assets`);
    } catch (err) {
      console.error('❌ Mongo bulk error:', err.message);
    }
  },
  {
    connection: {
      host: '127.0.0.1',
      port: 6379
    },
    concurrency: 1
  }
);

// =========================
// 🔥 WORKER EVENTS (IMPORTANT)
// =========================
worker.on('completed', () => {
  console.log('✅ Job completed');
});

worker.on('failed', (job, err) => {
  console.error(`❌ Job failed: ${err.message}`);
});

console.log('🚀 Crypto Worker running...');

module.exports = worker;