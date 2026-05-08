const mongoose = require('mongoose');

const CryptoSchema = new mongoose.Schema({
  symbol: {
    type: String,
    required: true,
    index: true, // 🔥 fast lookup
  },

  price_usd: {
    type: Number,
    required: true,
  },

  volume_24h: {
    type: Number,
    default: 0,
  },

  market_cap: {
    type: Number,
    default: 0,
  },

  change_24h: {
    type: Number, // % change
    default: 0,
  },

  // 🔥 useful for AI later
  sentiment_score: {
    type: Number,
    default: 0,
  },

  decision: {
    type: String, // BUY / SELL / HOLD
    default: 'HOLD',
  },

  source: {
    type: String,
    default: 'coinapi',
  },

  updatedAt: {
    type: Date,
    default: Date.now,
  },

  createdAt: {
    type: Date,
    default: Date.now,
  }
});



module.exports = mongoose.model('Crypto', CryptoSchema);