const axios = require('axios');

async function getDecision(question) {
  const prompt = `
You are a decision expert.

User question: "${question}"

Return in JSON format:
{
  "decision": "YES/NO/WAIT",
  "confidence": number,
  "reasons": ["reason1", "reason2", "reason3"]
}
`;

  const response = await axios.post(
    'https://api.openai.com/v1/chat/completions',
    {
      model: "gpt-4.1-mini",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7
    },
    {
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`
      }
    }
  );

  const text = response.data.choices[0].message.content;

  try {
    return JSON.parse(text);
  } catch {
    return {
      decision: "WAIT",
      confidence: 50,
      reasons: ["Parsing error, try again"]
    };
  }
}

module.exports = { getDecision };