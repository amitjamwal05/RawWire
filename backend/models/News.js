const mongoose = require('mongoose');

const newsSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
  mediaUrl: {
    type: String,
  },
  mediaType: {
    type: String,
    enum: ['image', 'video'],
    default: 'image'
  },
  views: {
    type: Number,
    default: 0
  },
  
  // Paid User Submission Fields
  isUserSubmitted: { type: Boolean, default: false },
  userName: { type: String },
  userEmail: { type: String },
  userPhone: { type: String },
  userAadhaar: { type: String },
  userPhotoUrl: { type: String },
  isPaid: { type: Boolean, default: false },
  razorpayOrderId: { type: String },
  razorpayPaymentId: { type: String },
  isApproved: { type: Boolean, default: true }, // Default true for admin posts
}, { timestamps: true });

module.exports = mongoose.model('News', newsSchema);
