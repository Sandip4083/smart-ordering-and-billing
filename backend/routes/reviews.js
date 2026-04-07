const router = require('express').Router();
const Review = require('../models/Review');
const auth = require('../middleware/auth');

// GET all reviews for a specific food item
router.get('/:foodId', async (req, res) => {
  try {
    const reviews = await Review.find({ foodId: req.params.foodId }).sort({ createdAt: -1 });
    res.json(reviews);
  } catch (err) {
    res.status(500).json({ msg: 'Database error: ' + err.message });
  }
});

// POST a new review
router.post('/', auth, async (req, res) => {
  try {
    const { foodId, foodName, rating, comment } = req.body;
    const review = new Review({
      foodId,
      foodName,
      username: req.user.username,
      rating,
      comment
    });
    await review.save();
    res.json(review);
  } catch (err) {
    res.status(500).json({ msg: 'Failed to post review: ' + err.message });
  }
});

// GET average rating for a specific food item
router.get('/avg/:foodId', async (req, res) => {
  try {
    const stats = await Review.aggregate([
      { $match: { foodId: req.params.foodId } },
      { $group: { _id: '$foodId', avg: { $avg: '$rating' }, count: { $sum: 1 } } }
    ]);
    res.json(stats[0] || { avg: 0, count: 0 });
  } catch (err) {
    res.status(500).json({ msg: 'Aggregation error' });
  }
});

module.exports = router;
