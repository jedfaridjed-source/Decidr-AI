const axios = require('axios');

exports.getMarketData = async () => {
  const alpha = await axios.get(
    `https://www.alphavantage.co/query?function=NEWS_SENTIMENT&apikey=${process.env.ALPHA_VANTAGE_KEY}`
  );

  const finnhub = await axios.get(
    `https://finnhub.io/api/v1/news?category=general&token=${process.env.FINNHUB_KEY}`
  );

  const alphaData = alpha.data.feed?.slice(0, 5).map(item => ({
    source: 'AlphaVantage',
    type: 'finance',
    title: item.title,
    url: item.url,
    timestamp: item.time_published,
    sentiment: item.overall_sentiment_label,
    score: item.overall_sentiment_score
  })) || [];

  const finnhubData = finnhub.data.slice(0, 5).map(item => ({
    source: 'Finnhub',
    type: 'finance',
    title: item.headline,
    url: item.url,
    timestamp: new Date(item.datetime * 1000),
    sentiment: 'neutral',
    score: 1
  }));

  return [...alphaData, ...finnhubData];
};