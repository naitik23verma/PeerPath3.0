import express from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const router = express.Router();

// Middleware to verify JWT token
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Access token required' });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ message: 'Invalid or expired token' });
    }
    req.user = user;
    next();
  });
};

// Get all users
router.get('/', async (req, res) => {
  try {
    const users = await User.find()
      .select('username profilePhoto bio expertise skills')
      .sort({ username: 1 });
    res.json(users);
  } catch (error) {
    console.error('Get all users error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get top helpers (users who solved most doubts)
router.get('/top-helpers', async (req, res) => {
  try {
    const topHelpers = await User.find()
      .sort({ doubtsSolved: -1 })
      .limit(10)
      .select('username profilePhoto doubtsSolved expertise');

    res.json(topHelpers);
  } catch (error) {
    console.error('Get top helpers error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get user statistics
router.get('/stats/:userId', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.params.userId)
      .select('doubtsSolved doubtsAsked weeklyStats joinDate');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    console.error('Get user stats error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get user profile
router.get('/profile/:userId', async (req, res) => {
  try {
    const user = await User.findById(req.params.userId)
      .select('-password');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    console.error('Get user profile error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

export default router; 