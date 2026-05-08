const axios = require('axios');

exports.getSignals = async () => {
  const res = await axios.get('https://www.reddit.com/r/investing/top.json?limit=10');

  return res.data.data.children.map(post => ({
    source: 'Reddit',
    type: 'social',
    title: post.data.title,
    url: `https://reddit.com${post.data.permalink}`,
    timestamp: new Date(post.data.created_utc * 1000),
    sentiment: 'neutral',
    score: post.data.score
  }));
};