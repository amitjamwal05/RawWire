const express = require('express');
const router = express.Router();
const Razorpay = require('razorpay');
const crypto = require('crypto');
const News = require('../models/News');
const upload = require('../middleware/upload');

// Create user submitted news and Razorpay order
router.post('/create-order', upload.fields([{ name: 'media', maxCount: 1 }, { name: 'userPhoto', maxCount: 1 }]), async (req, res) => {
  try {
    const { title, content, userName, userEmail, userPhone, userAadhaar } = req.body;
    
    if (!userName || !userEmail || !userPhone || !userAadhaar || userAadhaar.length !== 12) {
      return res.status(400).json({ message: 'Valid User Details and 12-digit Aadhaar required' });
    }

    const mediaFile = req.files && req.files['media'] ? req.files['media'][0] : null;
    const userPhotoFile = req.files && req.files['userPhoto'] ? req.files['userPhoto'][0] : null;

    // 1. Create unapproved, unpaid news post
    const mediaType = mediaFile && mediaFile.mimetype.startsWith('video/') ? 'video' : 'image';
    const news = await News.create({
      title,
      content,
      mediaUrl: mediaFile ? mediaFile.path : null,
      mediaType,
      isUserSubmitted: true,
      userName,
      userEmail,
      userPhone,
      userAadhaar,
      userPhotoUrl: userPhotoFile ? userPhotoFile.path : null,
      isPaid: false,
      isApproved: false // Admin must approve
    });

    // 2. Check for valid Razorpay keys or simulate
    const keyId = process.env.RAZORPAY_KEY_ID || '';
    const keySecret = process.env.RAZORPAY_KEY_SECRET || '';

    let order;
    
    if (keyId && keySecret && keyId.startsWith('rzp_')) {
      // Real Razorpay Call
      const razorpay = new Razorpay({ key_id: keyId, key_secret: keySecret });
      const options = {
        amount: 500 * 100, // amount in smallest currency unit (paise)
        currency: "INR",
        receipt: `receipt_news_${news._id}`,
      };
      order = await razorpay.orders.create(options);
    } else {
      // Simulate Razorpay Order for Local Testing without keys
      console.log('Valid Razorpay keys not found. Simulating payment order...');
      order = {
        id: `order_simulated_${Date.now()}`,
        amount: 50000,
        currency: "INR"
      };
    }
    
    // 4. Save order ID to news
    news.razorpayOrderId = order.id;
    await news.save();

    res.json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      newsId: news._id,
      keyId: keyId || 'rzp_test_dummy_key' // Pass dummy to frontend so checkout opens
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
});

// Verify Payment
router.post('/verify', async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, newsId } = req.body;

    const secret = process.env.RAZORPAY_KEY_SECRET || '';
    
    if (razorpay_order_id && razorpay_order_id.startsWith('order_simulated_')) {
      // It's a simulated order, auto verify
      await News.findByIdAndUpdate(newsId, {
        isPaid: true,
        razorpayPaymentId: razorpay_payment_id || `pay_sim_${Date.now()}`
      });
      return res.json({ success: true, message: 'Simulated payment verified successfully' });
    }

    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac("sha256", secret)
      .update(body.toString())
      .digest("hex");

    if (expectedSignature === razorpay_signature) {
      // Payment is legit!
      await News.findByIdAndUpdate(newsId, {
        isPaid: true,
        razorpayPaymentId: razorpay_payment_id
      });
      res.json({ success: true, message: 'Payment verified successfully' });
    } else {
      res.status(400).json({ success: false, message: 'Invalid payment signature' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
