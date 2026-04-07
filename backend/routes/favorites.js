const router = require('express').Router();
const Favorite = require('../models/Favorite');
const auth = require('../middleware/auth');

// GET all favorites for the logged-in user
router.get('/', auth, async (req, res) => {
  try {
    const favorites = await Favorite.find({ userId: req.user.id }).sort({ createdAt: -1 });
    res.json(favorites);
  } catch (err) {
    res.status(500).json({ msg: 'Database error: ' + err.message });
  }
});

// POST a new favorite
router.post('/', auth, async (req, res) => {
  try {
    const { foodId, foodName, imgUrl, price, cuisine } = req.body;
    
    // Check if already exist
    const exist = await Favorite.findOne({ userId: req.user.id, foodId });
    if (exist) return res.status(400).json({ msg: 'Item already in favorites' });

    const fav = new Favorite({
      userId: req.user.id,
      foodId, foodName, imgUrl, price, cuisine
    });
    await fav.save();
    res.json(fav);
  } catch (err) {
    res.status(500).json({ msg: 'Failed to add favorite' });
  }
});

// DELETE a favorite
router.delete('/:foodId', auth, async (req, res) => {
  try {
    await Favorite.findOneAndDelete({ userId: req.user.id, foodId: req.params.foodId });
    res.json({ msg: 'Removed from favorites' });
  } catch (err) {
    res.status(500).json({ msg: 'Delete failed' });
  }
});

module.exports = router;
