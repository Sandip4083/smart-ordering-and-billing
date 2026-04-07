const router = require('express').Router();
const Order = require('../models/Order');
const Bill = require('../models/Bill');
const Notification = require('../models/Notification');
const auth = require('../middleware/auth');

// Place order → auto-generates bill immediately
router.post('/', auth, async (req, res) => {
  try {
    const { foodItem, cuisine, price, quantity, orderType, deliveryPlace, deliveryTime, imgUrl } = req.body;
    const qty = Number(quantity) || 1;
    const unitPrice = Number(price) || 0;

    const order = new Order({
      customer: req.user.id,
      customerName: req.user.username,
      foodItem, cuisine,
      price: unitPrice,
      quantity: qty,
      orderType: orderType || 'delivery',
      deliveryPlace, deliveryTime,
      imgUrl,
      statusHistory: [{ status: 'Pending', time: new Date() }],
    });
    await order.save();

    // ✅ Auto-generate bill immediately
    const subtotal = +(unitPrice * qty).toFixed(2);
    const tax = +(subtotal * 0.1).toFixed(2);
    const total = +(subtotal + tax).toFixed(2);
    const bill = new Bill({
      customer: req.user.id,
      customerName: req.user.username,
      orderId: order._id,
      orders: [{ foodItem, cuisine, price: unitPrice, quantity: qty, currency: '₹' }],
      subtotal, tax, total,
      status: 'pending',
    });
    await bill.save();

    await Notification.create({
      type: 'new_order',
      title: 'New Order Received 🛒',
      message: `${req.user.username} ordered ${qty > 1 ? qty + 'x ' : ''}${foodItem} (${orderType || 'delivery'}) — ${deliveryPlace}`,
      customer: req.user.id,
      refId: order._id,
    });

    res.json({ order, bill });
  } catch (err) { res.status(500).json({ msg: err.message }); }
});

// Get orders
router.get('/', auth, async (req, res) => {
  try {
    const orders = req.user.role === 'employee'
      ? await Order.find().sort('-createdAt')
      : await Order.find({ customer: req.user.id }).sort('-createdAt');
    res.json(orders);
  } catch (err) { res.status(500).json({ msg: err.message }); }
});

// Cancel order
router.put('/:id/cancel', auth, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ msg: 'Not found' });
    if (req.user.role !== 'employee' && order.customer.toString() !== req.user.id)
      return res.status(403).json({ msg: 'Not authorized' });
    order.status = 'Cancelled';
    order.statusHistory.push({ status: 'Cancelled', time: new Date() });
    await order.save();
    await Notification.create({
      type: 'cancellation',
      title: 'Order Cancelled ❌',
      message: `${order.customerName} cancelled order for ${order.foodItem}`,
      customer: order.customer, refId: order._id,
    });
    res.json(order);
  } catch (err) { res.status(500).json({ msg: err.message }); }
});

// Update status (admin)
router.put('/:id/status', auth, async (req, res) => {
  try {
    if (req.user.role !== 'employee') return res.status(403).json({ msg: 'Admin only' });
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ msg: 'Not found' });
    order.status = req.body.status;
    order.statusHistory.push({ status: req.body.status, time: new Date() });
    await order.save();
    res.json(order);
  } catch (err) { res.status(500).json({ msg: err.message }); }
});

// Delete (admin)
router.delete('/:id', auth, async (req, res) => {
  try {
    if (req.user.role !== 'employee') return res.status(403).json({ msg: 'Admin only' });
    await Order.findByIdAndDelete(req.params.id);
    res.json({ msg: 'Deleted' });
  } catch (err) { res.status(500).json({ msg: err.message }); }
});

module.exports = router;
