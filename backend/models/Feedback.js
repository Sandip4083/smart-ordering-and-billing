const mongoose = require('mongoose');

const FeedbackSchema = new mongoose.Schema({
  name:    String,
  message: { type: String, required: true },
  rating:  { type: Number, min: 1, max: 5, default: 5 },
  type:    { type: String, enum: ['customer', 'employee'], default: 'customer' },
}, { timestamps: true });

module.exports = mongoose.model('Feedback', FeedbackSchema);
