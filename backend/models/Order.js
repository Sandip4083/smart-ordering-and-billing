const mongoose = require('mongoose');

const OrderSchema = new mongoose.Schema({
  customer:     { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  customerName: String,
  items: [{
    foodItem: { type: String, required: true },
    cuisine:  String,
    price:    { type: Number, default: 0 },
    quantity: { type: Number, default: 1 },
    imgUrl:   String
  }],
  // Backward compatibility fields (optional, but good to keep if strictly required)
  foodItem:     String, 
  cuisine:      String,
  price:        { type: Number, default: 0 },
  quantity:     { type: Number, default: 1 },
  imgUrl:       String,
  
  orderType:    { type: String, enum: ['delivery', 'dine-in', 'takeaway'], default: 'delivery' },
  deliveryPlace:{ type: String, required: true },
  deliveryTime: { type: String, required: true },
  status:       { type: String, enum: ['Pending','In Progress','Completed','Cancelled'], default: 'Pending' },
  statusHistory:[{ status: String, time: Date }],
}, { timestamps: true });

module.exports = mongoose.model('Order', OrderSchema);
