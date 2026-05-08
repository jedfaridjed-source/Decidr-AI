const { Ollama } = require('ollama');
const axios = require('axios');
const cheerio = require('cheerio');

// =========================
// 🔥 CONFIG
// =========================
const MODEL = process.env.OLLAMA_MODEL || 'phi3';

const ollama = new Ollama({
  host: 'http://127.0.0.1:11434',
});

// =========================
// ✅ SAFE JSON PARSER
// =========================
function safeJSONParse(text) {
  try {
    return JSON.parse(text);
  } catch {
    const match = text.match(/\{[\s\S]*\}/);
    if (match) {
      try {
        return JSON.parse(match[0]);
      } catch {
        return null;
      }
    }
    return null;
  }
}

// =========================
// 🔁 LLM CALL WITH RETRY
// =========================
async function callLLM(messages, retries = 2) {
  try {
    const res = await ollama.chat({
      model: MODEL,
      messages,
      stream: false,
      options: {
        num_predict: 120,
        temperature: 0.1,
      },
    });

    return res.message.content;

  } catch (err) {
    if (retries > 0) {
      console.log('🔁 Retry LLM...');
      return callLLM(messages, retries - 1);
    }
    throw err;
  }
}

// =========================
// 🧹 CLEAN TEXT
// =========================
function cleanText(text) {
  return text
    .replace(/\s+/g, ' ')
    .replace(/\n/g, ' ')
    .trim()
    .slice(0, 6000); // safer token limit
}

// =========================
// 🌐 EXTRACT ARTICLE
// =========================
async function extractArticleText(url) {
  if (!url) return null;

  try {
    const { data } = await axios.get(url, {
      timeout: 10000,
      headers: {
        'User-Agent': 'Mozilla/5.0',
      },
    });

    const $ = cheerio.load(data);

    // remove noise
    $('script, style, nav, footer, iframe, header, ads, aside').remove();

    let text = '';

    // better filtering: ignore very short paragraphs
    $('p').each((_, el) => {
      const p = $(el).text().trim();
      if (p.length > 40) {
        text += p + ' ';
      }
    });

    const cleaned = cleanText(text);

    if (!cleaned || cleaned.length < 200) {
      return null; // too weak content
    }

    return cleaned;

  } catch (err) {
    console.log('⚠️ Failed to extract article:', err.message);
    return null;
  }
}

// =========================
// 🔥 BATCH ANALYSIS (FAST)
// =========================
exports.analyzeBatch = async (items) => {
  if (!items?.length) return null;

  const item = items[0];

  const prompt = `
Return ONLY valid JSON:

{
  "sentiment": "positive | negative | neutral",
  "signal": "BUY | SELL | WATCH",
  "confidence": number
}

News: ${item.title}
`;

  try {
    const content = await callLLM([
      { role: 'user', content: prompt }
    ]);

    return safeJSONParse(content);

  } catch (err) {
    console.error('❌ LLM error:', err.message);
    return null;
  }
};

// =========================
// 🔥 SINGLE ANALYSIS (FULL ARTICLE)
// =========================
exports.analyzeOne = async (item) => {
  if (!item) return null;

  try {
    console.log('🧠 Processing:', item.title);

    const articleText = await extractArticleText(item.url);

    console.log('articleText',articleText)

    const contentToAnalyze =
      articleText && articleText.length > 200
        ? articleText
        : item.title;

    const prompt = `
You are a financial AI analyzing news.

Return ONLY valid JSON:

{
  "impact": "short explanation (max 50 words)",
  "sentiment": "positive | negative | neutral",
  "signal": "BUY | SELL | WATCH",
  "confidence": number
}

News:
${contentToAnalyze}
`;

    const content = await callLLM([
      { role: 'user', content: prompt }
    ]);

    const parsed = safeJSONParse(content);

    console.log('✅ LLM RESULT:', parsed);

    return parsed;

  } catch (err) {
    console.error('❌ LLM ERROR:', err.message);
    return null;
  }
};