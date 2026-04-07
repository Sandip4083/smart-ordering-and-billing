const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const Reservation = require('../models/Reservation');
const Feedback = require('../models/Feedback');

// Middleware to verify JWT token
const auth = (req, res, next) => {
  const token = req.header('x-auth-token');
  if (!token) return res.status(401).json({ msg: 'No token, authorization denied' });
  try {
    const decoded = require('jsonwebtoken').verify(token, process.env.JWT_SECRET);
    req.user = decoded.user;
    next();
  } catch (err) {
    res.status(401).json({ msg: 'Token is not valid' });
  }
};

// PLACE ORDER
router.post('/order', auth, async (req, res) => {
  try {
    const newOrder = new Order({ ...req.body, customer: req.user.id });
    await newOrder.save();
    res.json(newOrder);
  } catch (err) { res.status(500).send('Server Error'); }
});

// GET ORDERS (Employee)
router.get('/orders', async (req, res) => {
  try {
    const orders = await Order.find().populate('customer', 'username');
    res.json(orders);
  } catch (err) { res.status(500).send('Server Error'); }
});

// MAKE RESERVATION (With 3-Strike Check)
router.post('/resolve-reservation', auth, async (req, res) => {
  try {
    // Check previous cancellations for this customer
    const userReservations = await Reservation.find({ customer: req.user.id, status: 'cancelled' });
    if(userReservations.length >= 3) {
       return res.status(400).json({ msg: 'Reservation denied: 3 or more past cancellations.' });
    }
    const newRes = new Reservation({ ...req.body, customer: req.user.id });
    await newRes.save();
    res.json(newRes);
  } catch (err) { res.status(500).send('Server Error'); }
});

module.exports = router;
