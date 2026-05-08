const Parser = require('rss-parser');
const parser = new Parser({ timeout: 10000 });

const llmBatch = require('./llm.service');
const cache = require('./cache.service');
const engine = require('./decision.engine');

const feeds = [
  {
    url: 'https://feeds.bbci.co.uk/news/business/rss.xml',
    source: 'BBC'
  },
  {
    url: 'https://www.cnbc.com/id/100003114/device/rss/rss.html',
    source: 'CNBC'
  },
  {
    url: 'https://news.google.com/rss/search?q=finance&hl=en-US&gl=US&ceid=US:en',
    source: 'Google News'
  }
];

function normalize(text = '') {
  return text.toLowerCase().replace(/[^a-z0-9]/g, '');
}

function deduplicate(items) {
  const seen = new Set();

  return items.filter(item => {
    const key = normalize(item.title);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

exports.getNews = async () => {
  const results = await Promise.allSettled(
    feeds.map(feed => parser.parseURL(feed.url))
  );

  let items = results
    .filter(r => r.status === 'fulfilled')
    .flatMap(r => r.value.items.slice(0, 5))
    .map(item => ({
      title: item.title,
      url: item.link,
      timestamp: item.pubDate
    }));

  // 🔥 1. Deduplicate
  const uniqueItems = [];
  const seen = new Set();

  for (let item of items) {
    const key = normalize(item.title);
    if (!seen.has(key)) {
      seen.add(key);
      uniqueItems.push(item);
    }
  }

  // 🔥 2. Cache check
  const toAnalyze = [];
  const finalResults = [];

  for (let item of uniqueItems) {
    const key = normalize(item.title);
    const cached = cache.get(key);

    if (cached && cache.isValid(cached)) {
      finalResults.push({
        ...item,
        ...cached.value
      });
    } else {
      toAnalyze.push(item);
    }
  }

  // 🔥 3. Batch LLM
  // if (toAnalyze.length > 0) {
  //   const batchResults = await llmBatch.analyzeBatch(toAnalyze);

  //   batchResults.forEach((res, i) => {
  //     const item = toAnalyze[res.index];

  //     const final = engine.finalizeSignal(res);

  //     const key = normalize(item.title);

  //     cache.set(key, final);

  //     finalResults.push({
  //       ...item,
  //       ...final
  //     });
  //   });
  // }

  return finalResults.sort(
    (a, b) => new Date(b.timestamp) - new Date(a.timestamp)
  );
};