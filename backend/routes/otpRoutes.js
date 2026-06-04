const express = require('express');
const router = express.Router();
const OTP = require('../models/OTP');
const nodemailer = require('nodemailer');

// Generate a random 6 digit number
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// @route   POST /api/otp/send
// @desc    Send OTP to an email address
router.post('/send', async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email || !email.includes('@')) {
      return res.status(400).json({ message: 'Valid email address is required' });
    }

    // Delete any existing unverified OTPs for this email to prevent spam
    await OTP.deleteMany({ email, isVerified: false });

    const otpCode = generateOTP();

    // Save to database
    await OTP.create({
      email,
      otp: otpCode
    });

    // --- LOCAL TESTING LOG ---
    console.log(`\n========================================`);
    console.log(`🔑 DEV MODE: OTP for ${email} is: ${otpCode}`);
    console.log(`========================================\n`);
    // -------------------------

    // Send Email using Nodemailer
    // Only attempt to send if environment variables are configured
    if (process.env.EMAIL_USER && process.env.EMAIL_APP_PASSWORD) {
      const transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 465,
        secure: true,
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_APP_PASSWORD
        }
      });

      const mailOptions = {
        from: `"RawWire Support" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: 'Your RawWire Verification Code',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
            <h2 style="color: #0F172A;">Welcome to RawWire!</h2>
            <p style="font-size: 16px; color: #333;">Please use the following 6-digit code to verify your email address and submit your post. This code will expire in 5 minutes.</p>
            <div style="background-color: #f4f4f5; padding: 15px; border-radius: 8px; text-align: center; margin: 20px 0;">
              <span style="font-size: 32px; font-weight: bold; color: #f43f5e; letter-spacing: 5px;">${otpCode}</span>
            </div>
            <p style="font-size: 14px; color: #666;">If you did not request this verification, please ignore this email.</p>
          </div>
        `
      };

      await transporter.sendMail(mailOptions);
      console.log(`📧 Real email sent to ${email}`);
    } else {
      console.log(`⚠️ Email credentials not found in .env, skipping real email delivery.`);
    }

    res.json({ success: true, message: 'OTP sent successfully' });
  } catch (error) {
    console.error('OTP Send Error:', error);
    res.status(500).json({ message: 'Failed to send OTP email' });
  }
});

// @route   POST /api/otp/verify
// @desc    Verify the OTP for an email address
router.post('/verify', async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ message: 'Email and OTP are required' });
    }

    // Find the most recent OTP for this email
    const record = await OTP.findOne({ email }).sort({ createdAt: -1 });

    if (!record) {
      return res.status(400).json({ message: 'OTP expired or not found. Please request a new one.' });
    }

    if (record.isVerified) {
      return res.status(400).json({ message: 'Email address already verified.' });
    }

    if (record.otp !== otp.toString()) {
      return res.status(400).json({ message: 'Invalid OTP code.' });
    }

    // Mark as verified
    record.isVerified = true;
    await record.save();

    res.json({ success: true, message: 'Email verified successfully!' });
  } catch (error) {
    console.error('OTP Verify Error:', error);
    res.status(500).json({ message: 'Failed to verify OTP' });
  }
});

module.exports = router;
