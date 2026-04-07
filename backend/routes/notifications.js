const router = require('express').Router();
const Notification = require('../models/Notification');
const auth = require('../middleware/auth');

// Get all notifications (admin only)
router.get('/', auth, async (req, res) => {
  try {
    if (req.user.role !== 'employee') return res.status(403).json({ msg: 'Admin only' });
    const notifications = await Notification.find().sort('-createdAt').limit(50);
    res.json(notifications);
  } catch (err) { res.status(500).json({ msg: err.message }); }
});

// Get unread count
router.get('/unread-count', auth, async (req, res) => {
  try {
    if (req.user.role !== 'employee') return res.json({ count: 0 });
    const count = await Notification.countDocuments({ read: false });
    res.json({ count });
  } catch (err) { res.status(500).json({ msg: err.message }); }
});

// Mark all as read
router.put('/mark-read', auth, async (req, res) => {
  try {
    if (req.user.role !== 'employee') return res.status(403).json({ msg: 'Admin only' });
    await Notification.updateMany({ read: false }, { read: true });
    res.json({ msg: 'All marked as read' });
  } catch (err) { res.status(500).json({ msg: err.message }); }
});

// Mark one as read
router.put('/:id/read', auth, async (req, res) => {
  try {
    await Notification.findByIdAndUpdate(req.params.id, { read: true });
    res.json({ msg: 'Marked as read' });
  } catch (err) { res.status(500).json({ msg: err.message }); }
});

module.exports = router;
