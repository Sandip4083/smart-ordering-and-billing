const router = require('express').Router();
const Feedback = require('../models/Feedback');
const Notification = require('../models/Notification');
const auth = require('../middleware/auth');

router.post('/', auth, async (req, res) => {
  try {
    const feedback = new Feedback({
      name: req.user.username,
      message: req.body.message,
      rating: req.body.rating || 5,
      type: req.user.role === 'employee' ? 'employee' : 'customer',
    });
    await feedback.save();
    await Notification.create({
      type: 'feedback',
      title: 'New Feedback 💬',
      message: `${req.user.username} left ${req.body.rating || 5}★ feedback: "${req.body.message.slice(0, 60)}..."`,
      customer: req.user.id,
      refId: feedback._id,
    });
    res.json({ msg: 'Feedback submitted!' });
  } catch (err) { res.status(500).json({ msg: err.message }); }
});

router.get('/', auth, async (req, res) => {
  try {
    if (req.user.role !== 'employee') return res.status(403).json({ msg: 'Access denied' });
    const feedback = await Feedback.find().sort('-createdAt');
    res.json(feedback);
  } catch (err) { res.status(500).json({ msg: err.message }); }
});

module.exports = router;
