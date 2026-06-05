const express = require('express');
const router = express.Router();
const webpush = require('web-push');
const PushSubscription = require('../models/PushSubscription');

// Configure web-push
webpush.setVapidDetails(
  'mailto:amitjamwal005@gmail.com',
  process.env.VAPID_PUBLIC_KEY,
  process.env.VAPID_PRIVATE_KEY
);

// Subscribe route
router.post('/subscribe', async (req, res) => {
  try {
    const subscription = req.body;
    
    // Save to DB (upsert based on endpoint)
    await PushSubscription.findOneAndUpdate(
      { endpoint: subscription.endpoint },
      subscription,
      { upsert: true, new: true }
    );
    
    res.status(201).json({ message: 'Subscription saved.' });
  } catch (err) {
    console.error('Subscription error:', err);
    res.status(500).json({ error: 'Failed to save subscription.' });
  }
});

// Admin send notification route
router.post('/send', async (req, res) => {
  try {
    const { title, body, url } = req.body;
    
    const payload = JSON.stringify({
      title,
      body,
      url: url || 'https://raw-wire.vercel.app'
    });
    
    const subscriptions = await PushSubscription.find({});
    
    const sendPromises = subscriptions.map(sub => {
      return webpush.sendNotification(sub, payload).catch(err => {
        if (err.statusCode === 410 || err.statusCode === 404) {
          // Subscription has expired or is no longer valid
          return PushSubscription.deleteOne({ endpoint: sub.endpoint });
        }
        console.error('Failed to send push to one sub:', err);
      });
    });
    
    await Promise.all(sendPromises);
    res.status(200).json({ message: `Push notifications sent to ${subscriptions.length} subscribers.` });
  } catch (err) {
    console.error('Send push error:', err);
    res.status(500).json({ error: 'Failed to send push notifications.' });
  }
});

module.exports = router;
