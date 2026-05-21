const mongoose = require('mongoose');

const newsSchema = new mongoose.Schema({
  title: { type: String, required: true },
  content: { type: String, required: true },
  mediaUrl: { type: String, required: true },
  mediaType: { type: String, enum: ['image', 'video'], default: 'image' },
  views: { type: Number, default: 0 },
}, { timestamps: true });

module.exports = mongoose.model('News', newsSchema);
