const mongoose = require('mongoose');

const otpSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
  },
  otp: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 300, // Automatically delete document after 5 minutes (300 seconds)
  },
  isVerified: {
    type: Boolean,
    default: false,
  }
});

module.exports = mongoose.model('OTP', otpSchema);
