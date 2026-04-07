const mongoose = require('mongoose');

const NotificationSchema = new mongoose.Schema({
  type: { type: String, enum: ['new_order', 'new_reservation', 'cancellation', 'feedback'], required: true },
  title: { type: String, required: true },
  message: { type: String, required: true },
  read: { type: Boolean, default: false },
  customer: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  refId: { type: mongoose.Schema.Types.ObjectId }, // order or reservation id
}, { timestamps: true });

module.exports = mongoose.model('Notification', NotificationSchema);
