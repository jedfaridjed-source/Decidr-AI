const express = require('express');
const router = express.Router();
const News = require('./model/news');

// GET ONLY (frontend safe)
router.get('/', async (req, res) => {
  const news = await News.find()
    .sort({ createdAt: -1 })
    .limit(50);

  res.json(news);
});

module.exports = router;