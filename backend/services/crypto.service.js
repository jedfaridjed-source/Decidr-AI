const Crypto = require('../model/crypto');

// 🔥 get all cryptos
async function getAllCryptos({ limit = 50, sortBy = 'price_usd', order = 'desc' } = {}) {
  try {
    const sortOrder = order === 'asc' ? 1 : -1;

    return await Crypto.find()
      .sort({ [sortBy]: sortOrder })
      .limit(limit)
      .lean();

  } catch (err) {
    console.error('❌ getAllCryptos error:', err.message);
    throw err;
  }
}

// 🔥 get one crypto by symbol
async function getCryptoBySymbol(symbol) {
  try {
    return await Crypto.findOne({ symbol: symbol.toUpperCase() }).lean();
  } catch (err) {
    console.error('❌ getCryptoBySymbol error:', err.message);
    throw err;
  }
}

// 🔥 get top movers (based on 24h change)
async function getTopMovers(limit = 10) {
  try {
    return await Crypto.find()
      .sort({ change_24h: -1 })
      .limit(limit)
      .lean();
  } catch (err) {
    console.error('❌ getTopMovers error:', err.message);
    throw err;
  }
}

// 🔥 get AI decisions (BUY/SELL/HOLD)
async function getByDecision(decision = 'BUY') {
  try {
    return await Crypto.find({ decision })
      .sort({ score: -1 })
      .lean();
  } catch (err) {
    console.error('❌ getByDecision error:', err.message);
    throw err;
  }
}

// 🔥 search crypto
async function searchCrypto(query) {
  try {
    return await Crypto.find({
      symbol: { $regex: query.toUpperCase(), $options: 'i' }
    })
      .limit(20)
      .lean();
  } catch (err) {
    console.error('❌ searchCrypto error:', err.message);
    throw err;
  }
}

module.exports = {
  getAllCryptos,
  getCryptoBySymbol,
  getTopMovers,
  getByDecision,
  searchCrypto
};