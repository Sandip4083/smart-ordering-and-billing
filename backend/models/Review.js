const mongoose = require('mongoose');

const ReviewSchema = new mongoose.Schema({
  foodId: { type: String, required: true },
  foodName: { type: String, required: true },
  username: { type: String, required: true },
  rating: { type: Number, min: 1, max: 5, required: true },
  comment: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Review', ReviewSchema);
