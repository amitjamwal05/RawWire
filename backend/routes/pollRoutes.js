const express = require('express');
const router = express.Router();
const Poll = require('../models/Poll');

// Get active poll
router.get('/active', async (req, res) => {
  try {
    const poll = await Poll.findOne({ isActive: true }).sort({ createdAt: -1 });
    if (!poll) {
      return res.status(404).json({ message: 'No active poll found' });
    }
    
    // Calculate total votes and percentages
    const totalVotes = poll.options.reduce((sum, opt) => sum + opt.votes, 0);
    const optionsWithPercentages = poll.options.map(opt => ({
      _id: opt._id,
      text: opt.text,
      votes: opt.votes,
      percentage: totalVotes === 0 ? 0 : Math.round((opt.votes / totalVotes) * 100)
    }));

    res.json({
      _id: poll._id,
      question: poll.question,
      options: optionsWithPercentages,
      totalVotes,
      createdAt: poll.createdAt
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Vote on a poll
router.post('/:pollId/vote/:optionId', async (req, res) => {
  try {
    const poll = await Poll.findOne({ _id: req.params.pollId, isActive: true });
    if (!poll) return res.status(404).json({ message: 'Poll not found or inactive' });

    const option = poll.options.id(req.params.optionId);
    if (!option) return res.status(404).json({ message: 'Option not found' });

    option.votes += 1;
    await poll.save();

    // Broadcast updated poll
    const totalVotes = poll.options.reduce((sum, opt) => sum + opt.votes, 0);
    const optionsWithPercentages = poll.options.map(opt => ({
      _id: opt._id,
      text: opt.text,
      votes: opt.votes,
      percentage: totalVotes === 0 ? 0 : Math.round((opt.votes / totalVotes) * 100)
    }));

    const updatedPoll = {
      _id: poll._id,
      question: poll.question,
      options: optionsWithPercentages,
      totalVotes,
      createdAt: poll.createdAt
    };

    if (req.app.get('io')) {
      req.app.get('io').emit('poll_updated', updatedPoll);
    }

    res.json(updatedPoll);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
