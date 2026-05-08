const mongoose = require('mongoose');

const AnonymousSchema = new mongoose.Schema({
  deviceId: {
    type: String,
    required: true,
    unique: true
  },
  usedAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Anonymous', AnonymousSchema);