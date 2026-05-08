const express = require('express');
const router = express.Router();
const Anonymous = require('../model/anonymous');
const { getDecision } = require('../services/ai.service');


router.post('/check-access', async (req, res) => {
  const { deviceId } = req.body;

  if (!deviceId) {
    return res.status(400).json({ allowed: false, error: 'NO_DEVICE_ID' });
  }

  const existing = await Anonymous.findOne({ deviceId });

  // ❌ Already used free shot
  if (existing) {
    return res.json({
      allowed: false,
      reason: 'FREE_SHOT_USED'
    });
  }

  // ✅ First time → create record and allow
  await Anonymous.create({
    deviceId,
    usedAt: new Date()
  });

  return res.json({
    allowed: true
  });
});




router.post('/', async (req, res) => {
  try {
    const { question } = req.body;

    if (!question) {
      return res.status(400).json({ error: 'Question is required' });
    }

    const result = await getDecision(question);
    res.json(result);

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router; // ✅ VERY IMPORTANT