const axios = require('axios');
const cheerio = require('cheerio');

exports.scrapeReuters = async () => {
  const { data } = await axios.get('https://www.reuters.com/business/');

  const $ = cheerio.load(data);
  const articles = [];

  $('a[data-testid="Heading"]').each((i, el) => {
    articles.push({
      source: 'Reuters',
      type: 'news',
      title: $(el).text(),
      url: 'https://reuters.com' + $(el).attr('href'),
      timestamp: new Date(),
      sentiment: 'neutral',
      score: 1
    });
  });

  return articles.slice(0, 5);
};