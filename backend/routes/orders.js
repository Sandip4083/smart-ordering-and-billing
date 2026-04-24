const router = require('express').Router();
const Order = require('../models/Order');
const Bill = require('../models/Bill');
const Notification = require('../models/Notification');
const auth = require('../middleware/auth');

// Place order → auto-generates bill immediately
router.post('/', auth, async (req, res) => {
  try {
    const { items, orderType, deliveryPlace, deliveryTime } = req.body;
    
    // Support both single item (legacy) and multi-item (modern)
    let orderItems = [];
    if (items && Array.isArray(items)) {
      orderItems = items.map(i => ({
        foodItem: i.foodItem || i.name,
        cuisine: i.cuisine,
        price: Number(i.price) || 0,
        quantity: Number(i.quantity) || 1,
        imgUrl: i.imgUrl || i.img
      }));
    } else {
      // Legacy support for single item POST
      const { foodItem, cuisine, price, quantity, imgUrl } = req.body;
      orderItems = [{
        foodItem, cuisine,
        price: Number(price) || 0,
        quantity: Number(quantity) || 1,
        imgUrl
      }];
    }

    if (orderItems.length === 0) return res.status(400).json({ msg: 'Order must have items' });

    const order = new Order({
      customer: req.user.id,
      customerName: req.user.username,
      items: orderItems,
      // Fallback fields for summary
      foodItem: orderItems[0].foodItem,
      cuisine: orderItems[0].cuisine,
      price: orderItems[0].price,
      quantity: orderItems[0].quantity,
      imgUrl: orderItems[0].imgUrl,

      orderType: orderType || 'delivery',
      deliveryPlace: deliveryPlace || 'N/A',
      deliveryTime: deliveryTime || 'ASAP',
      statusHistory: [{ status: 'Pending', time: new Date() }],
    });
    await order.save();

    // ✅ Auto-generate bill immediately for ALL items
    const subtotal = +orderItems.reduce((sum, item) => sum + (item.price * item.quantity), 0).toFixed(2);
    const tax = +(subtotal * 0.1).toFixed(2);
    const total = +(subtotal + tax).toFixed(2);
    
    const bill = new Bill({
      customer: req.user.id,
      customerName: req.user.username,
      orderId: order._id,
      orders: orderItems.map(i => ({
        foodItem: i.foodItem,
        cuisine: i.cuisine,
        price: i.price,
        quantity: i.quantity,
        currency: '₹'
      })),
      subtotal, tax, total,
      status: 'pending',
    });
    await bill.save();

    await Notification.create({
      type: 'new_order',
      title: 'New Order Received 🛒',
      message: `${req.user.username} placed an order for ${orderItems.length} item(s) (${orderType || 'delivery'}) — Total: ₹${total}`,
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
