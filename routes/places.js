// server/routes/places.js
const express = require('express');
const router = express.Router();
const Place = require('../models/place');

// GET /api/places?category=swim&limit=20&page=1
router.get('/', async (req, res, next) => {
  try {
    const { category, q, limit = 20, page = 1 } = req.query;
    const skip = (Math.max(1, page) - 1) * limit;
    const criteria = {};
    if (category) criteria.category = category.toLowerCase();
    if (q) criteria.name = { $regex: q, $options: 'i' };

    const results = await Place.find(criteria)
      .sort({ createdAt: -1 })
      .limit(Number(limit))
      .skip(Number(skip))
      .lean()
      .exec();

    res.json(results);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
