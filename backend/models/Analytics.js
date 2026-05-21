const mongoose = require('mongoose');

const analyticsSchema = new mongoose.Schema({
  date: { type: String, required: true, unique: true }, // Format: YYYY-MM-DD
  totalViews: { type: Number, default: 0 }
});

module.exports = mongoose.model('Analytics', analyticsSchema);
