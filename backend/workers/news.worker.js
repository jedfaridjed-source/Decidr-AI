const { Worker } = require('bullmq');
const mongoose = require('mongoose');
const Parser = require('rss-parser');

const News = require('../model/news');

// 🔥 improved parser (important)
const parser = new Parser({
  timeout: 10000,
  headers: {
    'User-Agent': 'Mozilla/5.0 (compatible; DecidrBot/1.0)'
  }
});

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected in worker'))
  .catch(err => console.log(err));

const feeds = [
  { url: 'https://feeds.bbci.co.uk/news/business/rss.xml', source: 'BBC Business' },
  { url: 'https://www.cnbc.com/id/100003114/device/rss/rss.html', source: 'CNBC Markets' },
  { url: 'https://cointelegraph.com/rss', source: 'CoinTelegraph' },
  { url: 'https://decrypt.co/feed', source: 'Decrypt' },

  { url: 'https://feeds.bbci.co.uk/news/world/rss.xml', source: 'BBC World' },
  { url: 'https://www.aljazeera.com/xml/rss/all.xml', source: 'AlJazeera World' },

  { url: 'https://techcrunch.com/feed/', source: 'TechCrunch' },
  { url: 'https://www.theverge.com/rss/index.xml', source: 'The Verge' },

  // { url: 'https://www.medicalnewstoday.com/rss', source: 'Medical News Today' },
  { url: 'https://www.sciencedaily.com/rss/all.xml', source: 'Science Daily' },
  {url : `https://www.alphavantage.co/query?function=NEWS_SENTIMENT&apikey=${process.env.ALPHA_VANTAGE_KEY}` , source : 'Alpha_vantage'},
{url : `https://finnhub.io/api/v1/news?category=general&token=${process.env.FINNHUB_KEY}` , source : 'FinnHub'}
  // { url: 'https://www.psychologytoday.com/intl/rss', source: 'Psychology Today' }
];

function normalize(text = '') {
  return text.toLowerCase().replace(/[^a-z0-9]/g, '');
}

function detectCategories(text = '') {
  const t = text.toLowerCase();
  const tags = [];

  if (/\b(stock|market|nasdaq|dow|inflation|fed|rate|bitcoin|crypto|ethereum)\b/.test(t)) {
    tags.push('finance');
  }

  if (/\b(crypto|bitcoin|ethereum|blockchain)\b/.test(t)) {
    tags.push('crypto');
  }

  if (/\b(economy|gdp|trade|business|company|startup)\b/.test(t)) {
    tags.push('economy');
  }

  if (/\b(ai|artificial intelligence|tech|software|robot|openai)\b/.test(t)) {
    tags.push('technology');
  }

  if (/\b(war|government|election|country|policy|politics)\b/.test(t)) {
    tags.push('world', 'politics');
  }

  if (/\b(health|diet|sleep|fitness|doctor|disease|mental)\b/.test(t)) {
    tags.push('health');
  }

  if (/\b(stress|happiness|mind|emotion|relationship|therapy|behavior)\b/.test(t)) {
    tags.push('lifestyle', 'psychology');
  }

  if (/\b(learn|study|productivity|skill|education)\b/.test(t)) {
    tags.push('education', 'productivity');
  }

  return tags.length ? tags : ['general'];
}

const worker = new Worker(
  'newsQueue',
  async (job) => {

    console.log('⚡ WORKER JOB:', job.name);

    if (job.name !== 'ingest-news') return;

    try {

      const existing = await News.find({}, { title: 1 }).lean();
      const existingSet = new Set(existing.map(n => normalize(n.title)));

      let inserted = 0;

      for (const feed of feeds) {

        console.log('📡 FEED:', feed.source);

        try {
          const data = await parser.parseURL(feed.url);

          if (!data || !data.items) {
            console.log(`⚠️ EMPTY FEED: ${feed.source}`);
            continue;
          }

          for (const item of data.items.slice(0, 15)) {

            if (!item.title) continue;

            const key = normalize(item.title);
            if (existingSet.has(key)) continue;

            const text = `${item.title} ${item.contentSnippet || ''}`;

            await News.create({
              title: item.title,
              url: item.link,
              source: feed.source,
              timestamp: item.pubDate || new Date(),

              categories: detectCategories(text),

              sentiment: '',
              score: 0,
              analyzed: false,
              createdAt: Date.now()
            });

            existingSet.add(key);
            inserted++;
          }

        } catch (err) {
          console.error(`❌ FEED ERROR (${feed.source}):`, err.message);
          continue; // 🔥 skip broken feed
        }
      }

      console.log(`✅ INSERTED: ${inserted}`);

    } catch (err) {
      console.error('❌ WORKER ERROR:', err.message);
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

console.log('🚀 Worker running...');

module.exports = worker;