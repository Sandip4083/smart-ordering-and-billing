const mongoose = require('mongoose');

const BillSchema = new mongoose.Schema({
  customer:     { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  customerName: String,
  orderId:      { type: mongoose.Schema.Types.ObjectId, ref: 'Order' },
  orders:       [{ foodItem: String, cuisine: String, price: Number, quantity: { type: Number, default: 1 }, currency: String }],
  reservation:  { type: mongoose.Schema.Types.ObjectId, ref: 'Reservation' },
  subtotal:     Number,
  tax:          Number,
  total:        Number,
  status:       { type: String, enum: ['pending', 'paid'], default: 'pending' },
  paidAt:       Date,
  paymentMethod:{ type: String, enum: ['razorpay', 'paytm', 'phonepe', 'googlepay', 'upi', 'cash', 'admin'], default: 'admin' },
  transactionId:{ type: String, default: null },
}, { timestamps: true });

module.exports = mongoose.model('Bill', BillSchema);
