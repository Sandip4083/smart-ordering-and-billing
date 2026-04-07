const mongoose = require('mongoose');

const OrderSchema = new mongoose.Schema({
  customer:     { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  customerName: String,
  foodItem:     { type: String, required: true },
  cuisine:      String,
  price:        { type: Number, default: 0 },
  quantity:     { type: Number, default: 1 },
  orderType:    { type: String, enum: ['delivery', 'dine-in', 'takeaway'], default: 'delivery' },
  deliveryPlace:{ type: String, required: true },
  deliveryTime: { type: String, required: true },
  imgUrl:       String,
  status:       { type: String, enum: ['Pending','In Progress','Completed','Cancelled'], default: 'Pending' },
  statusHistory:[{ status: String, time: Date }],
}, { timestamps: true });

module.exports = mongoose.model('Order', OrderSchema);
