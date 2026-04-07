const router = require('express').Router();
const Bill = require('../models/Bill');
const auth = require('../middleware/auth');

// Generate bill (admin)
router.post('/', auth, async (req, res) => {
  try {
    if (req.user.role !== 'employee') return res.status(403).json({ msg: 'Admin only' });
    const { customerId, customerName, orders, reservationId } = req.body;
    const subtotal = orders.reduce((s, o) => s + Number(o.price || 0), 0);
    const tax = +(subtotal * 0.1).toFixed(2);
    const total = +(subtotal + tax).toFixed(2);
    const bill = new Bill({ customer: customerId, customerName, orders, reservation: reservationId || null, subtotal, tax, total });
    await bill.save();
    res.json(bill);
  } catch (err) { res.status(500).json({ msg: err.message }); }
});

// Get all bills (admin)
router.get('/', auth, async (req, res) => {
  try {
    const bills = req.user.role === 'employee'
      ? await Bill.find().populate('customer', 'username').sort('-createdAt')
      : await Bill.find({ customer: req.user.id }).sort('-createdAt');
    res.json(bills);
  } catch (err) { res.status(500).json({ msg: err.message }); }
});

// Mark as paid
router.put('/:id/pay', auth, async (req, res) => {
  try {
    if (req.user.role !== 'employee') return res.status(403).json({ msg: 'Admin only' });
    const bill = await Bill.findByIdAndUpdate(req.params.id, { status: 'paid', paidAt: new Date() }, { new: true });
    res.json(bill);
  } catch (err) { res.status(500).json({ msg: err.message }); }
});

module.exports = router;
