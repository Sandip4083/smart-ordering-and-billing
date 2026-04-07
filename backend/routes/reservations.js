const router = require('express').Router();
const Reservation = require('../models/Reservation');
const Notification = require('../models/Notification');
const auth = require('../middleware/auth');

// Make reservation - with 3-strike ban + pre-order food
router.post('/', auth, async (req, res) => {
  try {
    const cancelCount = await Reservation.countDocuments({ customer: req.user.id, status: 'cancelled' });
    if (cancelCount >= 3) return res.status(400).json({ msg: '⛔ Reservation denied: 3+ past cancellations.' });
    const reservation = new Reservation({ ...req.body, customer: req.user.id, customerName: req.user.username });
    await reservation.save();
    // Notify admin
    const preOrder = req.body.preOrderedItems?.length ? ` with pre-order: ${req.body.preOrderedItems.join(', ')}` : '';
    const occasionInfo = req.body.occasion !== 'None' ? ` Celebrating ${req.body.occasion}! 🎉` : '';
    await Notification.create({
      type: 'new_reservation',
      title: 'New Table Reservation 📅',
      message: `${req.user.username} reserved a ${req.body.tableType} Table (${req.body.tableNumber}) for ${req.body.numGuests} guests on ${req.body.reservationDate}${occasionInfo}${preOrder}`,
      customer: req.user.id,
      refId: reservation._id,
    });
    res.json(reservation);
  } catch (err) { res.status(500).json({ msg: err.message }); }
});

// Get reservations
router.get('/', auth, async (req, res) => {
  try {
    const reservations = req.user.role === 'employee'
      ? await Reservation.find().sort('-createdAt')
      : await Reservation.find({ customer: req.user.id }).sort('-createdAt');
    res.json(reservations);
  } catch (err) { res.status(500).json({ msg: err.message }); }
});

// Cancel reservation
router.put('/:id/cancel', auth, async (req, res) => {
  try {
    const reservation = await Reservation.findById(req.params.id);
    if (!reservation) return res.status(404).json({ msg: 'Not found' });
    if (req.user.role !== 'employee' && reservation.customer.toString() !== req.user.id)
      return res.status(403).json({ msg: 'Not authorized' });
    reservation.status = 'cancelled';
    await reservation.save();
    if (req.user.role !== 'employee') {
      await Notification.create({
        type: 'cancellation',
        title: 'Reservation Cancelled ❌',
        message: `${req.user.username} cancelled Table ${reservation.tableNumber} reservation`,
        customer: req.user.id, refId: reservation._id,
      });
    }
    res.json(reservation);
  } catch (err) { res.status(500).json({ msg: err.message }); }
});

// Delete reservation (admin only)
router.delete('/:id', auth, async (req, res) => {
  try {
    if (req.user.role !== 'employee') return res.status(403).json({ msg: 'Admin only' });
    await Reservation.findByIdAndDelete(req.params.id);
    res.json({ msg: 'Deleted' });
  } catch (err) { res.status(500).json({ msg: err.message }); }
});

module.exports = router;
