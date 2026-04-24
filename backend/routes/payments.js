const router = require('express').Router();
const Bill = require('../models/Bill');
const auth = require('../middleware/auth');

// Helper: generate mock transaction ID
const genTxId = () => 'TXN' + Date.now().toString(36).toUpperCase() + Math.random().toString(36).substr(2, 4).toUpperCase();

// Supported payment methods
const PAYMENT_METHODS = ['razorpay', 'paytm', 'phonepe', 'googlepay', 'upi', 'cash'];

// POST /api/payments/initiate — simulate payment start
router.post('/initiate', auth, async (req, res) => {
  try {
    const { billId, method, upiId } = req.body;
    if (!billId) return res.status(400).json({ msg: 'Bill ID required' });
    if (!PAYMENT_METHODS.includes(method)) return res.status(400).json({ msg: 'Invalid payment method' });

    const bill = await Bill.findById(billId);
    if (!bill) return res.status(404).json({ msg: 'Bill not found' });
    if (bill.customer.toString() !== req.user.id && req.user.role !== 'employee') {
      return res.status(403).json({ msg: 'Not authorized' });
    }
    if (bill.status === 'paid') return res.status(400).json({ msg: 'Bill already paid' });

    // Simulate payment data
    const paymentData = {
      orderId: `ORD_${genTxId()}`,
      billId: bill._id,
      amount: bill.total,
      currency: 'INR',
      method,
      status: 'initiated',
      upiId: method === 'upi' ? (upiId || 'smartorder@upi') : null,
      qrCode: method !== 'cash' ? `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=upi://pay?pa=smartorder%40upi%26pn=SmartOrderBilling%26am=${bill.total}%26cu=INR` : null,
      message: method === 'cash' ? 'Pay at counter. Show this bill to the cashier.' : `Scan the QR or use ${method.toUpperCase()} app to pay ₹${bill.total}`,
    };

    res.json(paymentData);
  } catch (err) { res.status(500).json({ msg: err.message }); }
});

// POST /api/payments/verify — simulate payment success
router.post('/verify', auth, async (req, res) => {
  try {
    const { billId, method, transactionId } = req.body;
    if (!billId) return res.status(400).json({ msg: 'Bill ID required' });

    const bill = await Bill.findById(billId);
    if (!bill) return res.status(404).json({ msg: 'Bill not found' });
    if (bill.customer.toString() !== req.user.id && req.user.role !== 'employee') {
      return res.status(403).json({ msg: 'Not authorized' });
    }

    const txId = transactionId || genTxId();

    // Mark bill as paid
    bill.status = 'paid';
    bill.paidAt = new Date();
    bill.paymentMethod = method || 'upi';
    bill.transactionId = txId;
    await bill.save();

    res.json({
      success: true,
      transactionId: txId,
      method: method || 'upi',
      amount: bill.total,
      paidAt: bill.paidAt,
      bill,
    });
  } catch (err) { res.status(500).json({ msg: err.message }); }
});

// GET /api/payments/history — user payment history
router.get('/history', auth, async (req, res) => {
  try {
    const query = req.user.role === 'employee'
      ? { status: 'paid' }
      : { customer: req.user.id, status: 'paid' };
    const bills = await Bill.find(query).sort('-paidAt').limit(20);
    res.json(bills);
  } catch (err) { res.status(500).json({ msg: err.message }); }
});

module.exports = router;
