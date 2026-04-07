const mongoose = require('mongoose');

const ReservationSchema = new mongoose.Schema({
  customer: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  customerName: { type: String },
  guestName: { type: String, required: true },
  tableNumber: { type: Number, required: true },
  tableType: { type: String, enum: ['Standard', 'Booth', 'Window', 'Premium'], default: 'Standard' },
  occasion: { type: String, enum: ['None', 'Birthday', 'Anniversary', 'Business', 'Date Night'], default: 'None' },
  specialRequests: { type: String, default: '' },
  numGuests: { type: Number, required: true },
  reservationDate: { type: String, required: true },
  reservationTime: { type: String, required: true },
  preOrderedItems: [{ type: String }],
  status: { type: String, enum: ['active', 'cancelled'], default: 'active' }
}, { timestamps: true });

module.exports = mongoose.model('Reservation', ReservationSchema);
