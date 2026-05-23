const express = require('express');
const router = express.Router();
const News = require('../models/News');
const Analytics = require('../models/Analytics');

// Get all news (with pagination and search)
router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search || '';
    
    // Match posts that are approved OR existing posts that don't have the field yet
    let query = { isApproved: { $ne: false } };

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { content: { $regex: search, $options: 'i' } }
      ];
    }

    const total = await News.countDocuments(query);
    const news = await News.find(query)
      .sort({ isPinned: -1, createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);
      
    res.json({
      data: news,
      total,
      page,
      pages: Math.ceil(total / limit)
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get Trending News
router.get('/trending', async (req, res) => {
  try {
    const trendingNews = await News.find({ isApproved: { $ne: false } })
      .sort({ views: -1, upvotes: -1 })
      .limit(5);
    res.json(trendingNews);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get User Profile News
router.get('/user/:username', async (req, res) => {
  try {
    const username = req.params.username.trim();
    // We match the username case-insensitively and allow for slight variations in the DB
    const query = { 
      isApproved: { $ne: false },
      userName: { $regex: new RegExp(username, 'i') } 
    };
    const news = await News.find(query).sort({ createdAt: -1 });
    res.json(news);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get single news
router.get('/:id', async (req, res) => {
  try {
    const news = await News.findById(req.params.id);
    if (!news) return res.status(404).json({ message: 'News not found' });
    res.json(news);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Increment views
router.post('/view/:id', async (req, res) => {
  try {
    const news = await News.findById(req.params.id);
    if (!news) return res.status(404).json({ message: 'News not found' });
    
    news.views += 1;
    await news.save();

    const today = new Date().toISOString().split('T')[0];
    let analytics = await Analytics.findOne({ date: today });
    if (!analytics) {
      analytics = new Analytics({ date: today, totalViews: 1 });
    } else {
      analytics.totalViews += 1;
    }
    await analytics.save();

    res.json({ success: true, views: news.views, dailyTotal: analytics.totalViews });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Increment Upvote
router.put('/:id/upvote', async (req, res) => {
  try {
    const news = await News.findById(req.params.id);
    if (!news) return res.status(404).json({ message: 'News not found' });
    
    news.upvotes = (news.upvotes || 0) + 1;
    await news.save();
    res.json({ success: true, upvotes: news.upvotes });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Decrement Upvote
router.put('/:id/downvote', async (req, res) => {
  try {
    const news = await News.findById(req.params.id);
    if (!news) return res.status(404).json({ message: 'News not found' });
    
    news.upvotes = Math.max(0, (news.upvotes || 0) - 1);
    await news.save();
    res.json({ success: true, upvotes: news.upvotes });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
