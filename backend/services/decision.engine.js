function computeFinalScore(analysis) {
  const {
    impact = 0,
    urgency = 0,
    confidence = 0,
    sentiment = 'neutral'
  } = analysis;

  let score = 0;

  // base impact
  score += impact * 0.5;

  // urgency boosts
  score += urgency * 0.3;

  // confidence multiplier
  score *= (0.5 + confidence);

  // sentiment bias
  if (sentiment === 'positive') score += 10;
  if (sentiment === 'negative') score -= 10;

  return Math.max(0, Math.min(100, Math.round(score)));
}

function finalizeSignal(analysis) {
  const score = computeFinalScore(analysis);

  let finalSignal = 'IGNORE';

  if (score > 75) finalSignal = analysis.sentiment === 'positive' ? 'BUY' : 'SELL';
  else if (score > 50) finalSignal = 'WATCH';

  return {
    ...analysis,
    score,
    finalSignal
  };
}

module.exports = {
  finalizeSignal
};