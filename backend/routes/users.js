const router = require('express').Router();
const User = require('../models/User');
const Order = require('../models/Order');
const Bill = require('../models/Bill');
const Reservation = require('../models/Reservation');
const auth = require('../middleware/auth');

// Middleware: admin only
const adminOnly = (req, res, next) => {
  if (req.user.role !== 'employee') return res.status(403).json({ msg: 'Admin only' });
  next();
};

// GET /api/users — list all users with order + bill counts
router.get('/', auth, adminOnly, async (req, res) => {
  try {
    const users = await User.find({}).select('-password').sort('-createdAt');
    const usersWithStats = await Promise.all(users.map(async u => {
      const [orderCount, billCount, reservationCount] = await Promise.all([
        Order.countDocuments({ customer: u._id }),
        Bill.countDocuments({ customer: u._id }),
        Reservation.countDocuments({ customer: u._id }),
      ]);
      const totalSpent = await Bill.aggregate([
        { $match: { customer: u._id, status: 'paid' } },
        { $group: { _id: null, total: { $sum: '$total' } } }
      ]);
      return {
        ...u.toObject(),
        orderCount,
        billCount,
        reservationCount,
        totalSpent: totalSpent[0]?.total || 0,
      };
    }));
    res.json(usersWithStats);
  } catch (err) { res.status(500).json({ msg: err.message }); }
});

// GET /api/users/:id/details — full user details
router.get('/:id/details', auth, adminOnly, async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) return res.status(404).json({ msg: 'User not found' });
    const [orders, bills, reservations] = await Promise.all([
      Order.find({ customer: req.params.id }).sort('-createdAt').limit(10),
      Bill.find({ customer: req.params.id }).sort('-createdAt').limit(10),
      Reservation.find({ customer: req.params.id }).sort('-createdAt').limit(5),
    ]);
    res.json({ user, orders, bills, reservations });
  } catch (err) { res.status(500).json({ msg: err.message }); }
});

// PUT /api/users/:id/role — promote/demote (admin use)
router.put('/:id/role', auth, adminOnly, async (req, res) => {
  try {
    const { role } = req.body;
    if (!['customer', 'employee'].includes(role)) return res.status(400).json({ msg: 'Invalid role' });
    const user = await User.findByIdAndUpdate(req.params.id, { role }, { new: true }).select('-password');
    res.json(user);
  } catch (err) { res.status(500).json({ msg: err.message }); }
});

// DELETE /api/users/:id — remove user & their data
router.delete('/:id', auth, adminOnly, async (req, res) => {
  try {
    // Prevent deleting yourself
    if (req.params.id === req.user.id) return res.status(400).json({ msg: 'Cannot delete yourself' });
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ msg: 'User not found' });
    // Clean up user data
    await Promise.all([
      Order.deleteMany({ customer: req.params.id }),
      Bill.deleteMany({ customer: req.params.id }),
      Reservation.deleteMany({ customer: req.params.id }),
      User.findByIdAndDelete(req.params.id),
    ]);
    res.json({ msg: `User "${user.username}" and all their data deleted.` });
  } catch (err) { res.status(500).json({ msg: err.message }); }
});

// GET /api/users/analytics — aggregated stats for admin charts
router.get('/analytics/summary', auth, adminOnly, async (req, res) => {
  try {
    // Orders last 7 days
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      days.push(new Date(d.setHours(0, 0, 0, 0)));
    }
    const ordersByDay = await Promise.all(days.map(async day => {
      const nextDay = new Date(day); nextDay.setDate(nextDay.getDate() + 1);
      const count = await Order.countDocuments({ createdAt: { $gte: day, $lt: nextDay } });
      const revenue = await Bill.aggregate([
        { $match: { createdAt: { $gte: day, $lt: nextDay }, status: 'paid' } },
        { $group: { _id: null, total: { $sum: '$total' } } }
      ]);
      return {
        day: day.toLocaleDateString('en-IN', { weekday: 'short' }),
        orders: count,
        revenue: revenue[0]?.total || 0,
      };
    }));

    // Order status distribution
    const statusDist = await Order.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);

    // Order type distribution
    const typeDist = await Order.aggregate([
      { $group: { _id: '$orderType', count: { $sum: 1 } } }
    ]);

    // Top dishes (from items array)
    const topDishes = await Order.aggregate([
      { $unwind: '$items' },
      { $group: { _id: '$items.foodItem', count: { $sum: '$items.quantity' }, revenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } } } },
      { $sort: { count: -1 } },
      { $limit: 5 }
    ]);

    // Total revenue
    const totalRevenue = await Bill.aggregate([
      { $match: { status: 'paid' } },
      { $group: { _id: null, total: { $sum: '$total' } } }
    ]);

    // Monthly revenue
    const monthlyRevenue = await Bill.aggregate([
      { $match: { status: 'paid' } },
      { $group: { _id: { $month: '$createdAt' }, total: { $sum: '$total' }, count: { $sum: 1 } } },
      { $sort: { '_id': 1 } }
    ]);

    res.json({
      ordersByDay,
      statusDist: statusDist.map(s => ({ name: s._id || 'Unknown', value: s.count })),
      typeDist: typeDist.map(t => ({ name: t._id || 'Unknown', value: t.count })),
      topDishes,
      totalRevenue: totalRevenue[0]?.total || 0,
      monthlyRevenue,
    });
  } catch (err) { res.status(500).json({ msg: err.message }); }
});

module.exports = router;
