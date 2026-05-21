const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');
const News = require('../models/News');
const Analytics = require('../models/Analytics');
const upload = require('../middleware/upload');
const { protect } = require('../middleware/auth');

// Auth: Login
router.post('/login', async (req, res) => {
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

// Create News
router.post('/news', upload.single('media'), async (req, res) => {
  try {
    const { title, content } = req.body;
    if (!req.file) return res.status(400).json({ message: 'Media file is required' });
    
    const mediaType = req.file.mimetype.startsWith('video/') ? 'video' : 'image';
    
    const news = await News.create({
      title,
      content,
      mediaUrl: req.file.path,
      mediaType
    });
    res.status(201).json(news);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update News
router.put('/news/:id', upload.single('media'), async (req, res) => {
  try {
    const { title, content } = req.body;
    let news = await News.findById(req.params.id);
    if (!news) return res.status(404).json({ message: 'News not found' });

    news.title = title || news.title;
    news.content = content || news.content;
    
    if (req.file) {
      news.mediaUrl = req.file.path;
      news.mediaType = req.file.mimetype.startsWith('video/') ? 'video' : 'image';
    }

    const updatedNews = await news.save();
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
    
    await news.deleteOne();
    res.json({ message: 'News removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get Analytics
router.get('/analytics', async (req, res) => {
  try {
    const allNews = await News.find().select('title views createdAt');
    const today = new Date().toISOString().split('T')[0];
    const dailyAnalytics = await Analytics.findOne({ date: today });
    
    res.json({
      newsStats: allNews,
      todayViews: dailyAnalytics ? dailyAnalytics.totalViews : 0
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
