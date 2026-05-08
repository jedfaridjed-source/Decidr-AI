const cache = new Map();

exports.get = (key) => cache.get(key);

exports.set = (key, value) => {
  cache.set(key, {
    value,
    timestamp: Date.now()
  });
};

// optional TTL (5 min)
exports.isValid = (entry) => {
  return entry && (Date.now() - entry.timestamp < 300000);
};