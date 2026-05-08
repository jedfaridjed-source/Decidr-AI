const mongoose = require('mongoose');
const News = require('../model/news');
const { analyzeOne } = require('../services/llm.service');

// =========================
// 🔥 DB CONNECTION SAFE
// =========================
async function connectDB() {
  if (mongoose.connection.readyState === 1) return;

  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ MongoDB connected (LLM worker)');
  } catch (err) {
    console.error('❌ MongoDB error:', err);
  }
}

// =========================
// 🔒 GLOBAL LOCK
// =========================
let isRunning = false;

// =========================
// 🔥 CORE PROCESS (SAFE ATOMIC)
// =========================
async function processOneNews() {
  if (isRunning) {
    console.log('⛔ Already running, skip...');
    return;
  }

  isRunning = true;

  try {
    await connectDB();

    // 🔥 ATOMIC LOCK (SAFE + CORRECT)
    const item = await News.findOneAndUpdate(
      { analyzed: 'false' },
      { $set: { analyzed: 'true' } },
      {
        sort: { createdAt: 1 },
        returnDocument: 'after'
      }
    );

    if (!item) {
      console.log('⏳ No news to process');
      return;
    }

    console.log('🧠 Processing:', item.title);

    const result = await analyzeOne(item);

    if (!result) {
      console.log('⚠️ No result → marking failed');

      await News.updateOne(
        { _id: item._id },
        { analyzed: 'false' }
      );

      return;
    }

    // 🔥 SAFE SAVE (NORMALIZED)
    await News.updateOne(
      { _id: item._id },
      {
        llm_raw: result,
        sentiment: result.sentiment || 'neutral',
        decision: result.signal || 'WATCH',
        score: result.confidence || 0,
        impact: result.impact || '',
        analyzed: 'true'
      }
    );

    console.log('✅ DONE:', item.title);

  } catch (err) {
    console.error('❌ Worker error:', err.message);

    // 🔥 mark failure on crash
    if (err && err.item) {
      await News.updateOne(
        { _id: err.item._id },
        { analyzed: 'failed' }
      );
    }

  } finally {
    isRunning = false;
  }
}
// =========================
// 🔁 SAFE LOOP (NO OVERLAP)
// =========================
function startWorker(interval = 30000) {
  console.log('🚀 LLM worker started (safe mode)');

  setInterval(async () => {
    await processOneNews();
  }, interval);
}

// =========================
// EXPORT
// =========================
module.exports = {
  processOneNews,
  startWorker
};

// =========================
// AUTO RUN
// =========================
if (require.main === module) {
  startWorker();
}