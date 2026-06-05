const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');
const News = require('../models/News');
const Analytics = require('../models/Analytics');
const upload = require('../middleware/upload');
const { protect } = require('../middleware/auth');
const rateLimit = require('express-rate-limit');

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 login requests per windowMs
  message: { message: 'Too many login attempts from this IP, please try again after 15 minutes' },
  standardHeaders: true,
  legacyHeaders: false,
});

// Auth: Login
router.post('/login', loginLimiter, async (req, res) => {
  const { username, password } = req.body;
  try {
    const admin = await Admin.findOne({ username });
    if (admin && (await admin.matchPassword(password))) {
      res.json({
        _id: admin._id,
        username: admin.username,
        token: jwt.sign({ id: admin._id }, process.env.JWT_SECRET, { expiresIn: '30d' })
      });
    } else {
      res.status(401).json({ message: 'Invalid username or password' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Init first admin (One-time setup route)
router.post('/init', async (req, res) => {
  try {
    const exists = await Admin.findOne({ username: 'admin' });
    if (exists) return res.status(400).json({ message: 'Admin already exists' });
    const admin = await Admin.create({ username: 'admin', password: 'password123' });
    res.status(201).json({ message: 'Admin created', username: admin.username });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Protect all routes below
router.use(protect);

// Get Pending News
router.get('/news/pending', async (req, res) => {
  try {
    const pendingNews = await News.find({ isApproved: false, isPaid: true }).sort({ createdAt: -1 });
    res.json(pendingNews);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Approve News
router.put('/news/:id/approve', async (req, res) => {
  try {
    const news = await News.findById(req.params.id);
    if (!news) return res.status(404).json({ message: 'News not found' });
    
    news.isApproved = true;
    
    await news.save();

    // Broadcast to all clients
    if (req.app.get('io')) {
      req.app.get('io').emit('new_post_alert', { title: news.title });
    }

    res.json({ message: 'News approved successfully', news });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Toggle Pin Status
router.put('/news/:id/pin', async (req, res) => {
  try {
    const news = await News.findById(req.params.id);
    if (!news) return res.status(404).json({ message: 'News not found' });
    
    news.isPinned = !news.isPinned;
    await news.save();
    res.json({ message: news.isPinned ? 'News pinned' : 'News unpinned', news });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create News
router.post('/news', upload.single('media'), async (req, res) => {
  try {
    const { title, content, category } = req.body;
    
    let mediaType = 'image';
    if (req.file && req.file.mimetype.startsWith('video/')) mediaType = 'video';
    
    const news = await News.create({
      title,
      content,
      category: category || 'General',
      mediaUrl: req.file ? req.file.path : null,
      mediaType
    });

    // Broadcast to all clients
    if (req.app.get('io')) {
      req.app.get('io').emit('new_post_alert', { title: news.title });
    }

    res.status(201).json(news);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update News
router.put('/news/:id', upload.single('media'), async (req, res) => {
  try {
    const { title, content, category, views, upvotes } = req.body;
    let news = await News.findById(req.params.id);
    if (!news) return res.status(404).json({ message: 'News not found' });

    news.title = title || news.title;
    news.content = content || news.content;
    news.category = category || news.category;
    
    if (views !== undefined && views !== '') news.views = Number(views);
    if (upvotes !== undefined && upvotes !== '') news.upvotes = Number(upvotes);
    
    if (req.file) {
      news.mediaUrl = req.file.path;
      news.mediaType = req.file.mimetype.startsWith('video/') ? 'video' : 'image';
    }

    await news.save();

    if (req.app.get('io')) {
      if (views !== undefined && views !== '') req.app.get('io').emit('view_count_changed', { newsId: news._id.toString(), views: news.views });
      if (upvotes !== undefined && upvotes !== '') req.app.get('io').emit('upvote_changed', { newsId: news._id.toString(), upvotes: news.upvotes });
    }

    res.json(updatedNews);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete News
router.delete('/news/:id', async (req, res) => {
  try {
    const news = await News.findById(req.params.id);
    if (!news) return res.status(404).json({ message: 'News not found' });
    
    // Delete media from Cloudinary
    if (news.mediaUrl) {
      const cloudinary = require('cloudinary').v2;
      const publicIdMatch = news.mediaUrl.match(/\/rawwire\/([^\.]+)/);
      if (publicIdMatch) {
        const public_id = `rawwire/${publicIdMatch[1]}`;
        await cloudinary.uploader.destroy(public_id, { resource_type: news.mediaType });
      }
    }
    
    // Delete user photo from Cloudinary
    if (news.userPhotoUrl) {
      const cloudinary = require('cloudinary').v2;
      const publicIdMatch = news.userPhotoUrl.match(/\/rawwire\/([^\.]+)/);
      if (publicIdMatch) {
        const public_id = `rawwire/${publicIdMatch[1]}`;
        await cloudinary.uploader.destroy(public_id, { resource_type: 'image' });
      }
    }

    await news.deleteOne();

    // Broadcast to all clients
    if (req.app.get('io')) {
      req.app.get('io').emit('post_deleted', { newsId: req.params.id });
    }

    res.json({ message: 'News removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get Analytics
router.get('/analytics', async (req, res) => {
  try {
    const liveQuery = {
      $or: [
        { isUserSubmitted: false },
        { isUserSubmitted: { $exists: false } },
        { isApproved: true }
      ]
    };
    const liveNews = await News.find(liveQuery).sort({ createdAt: -1 }).select('title content views createdAt isPinned category');
    
    const abandonedQuery = {
      isUserSubmitted: true,
      isPaid: false
    };
    const abandonedNews = await News.find(abandonedQuery).sort({ createdAt: -1 }).select('title content views createdAt category');

    const today = new Date().toISOString().split('T')[0];
    const dailyAnalytics = await Analytics.findOne({ date: today });
    
    res.json({
      newsStats: liveNews,
      abandonedStats: abandonedNews,
      todayViews: dailyAnalytics ? dailyAnalytics.totalViews : 0
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
