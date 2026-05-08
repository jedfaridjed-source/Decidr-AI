const mongoose = require('mongoose');

const NewsSchema = new mongoose.Schema({
  createdAt: { type: Date, default: Date.now },

  category: String,
  source: String,
  timestamp: String,
  title: String,
  type: String,
  url: String,

  // 🔥 AI output
  llm_raw: mongoose.Schema.Types.Mixed,
  sentiment: String,
  decision: String,
  score: Number,
  impact: String,

  // 🔥 WORKFLOW STATE (IMPORTANT)
  analyzed: Boolean
});

module.exports = mongoose.model('News', NewsSchema);