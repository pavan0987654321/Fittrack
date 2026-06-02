const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { DEMO_USER } = require('../demoData');

const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({ message: 'Not authorized, no token provided' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // ── Demo mode: never touch the real database ──────────────────────────────
    if (decoded.isDemo) {
      req.user = { ...DEMO_USER, isDemo: true };
      return next();
    }

    req.user = await User.findById(decoded.id).select('-password');
    if (!req.user) {
      return res.status(401).json({ message: 'User not found' });
    }
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Not authorized, token invalid' });
  }
};

const adminOnly = (req, res, next) => {
  if (req.user && (req.user.role === 'admin' || req.user.isDemo)) {
    next();
  } else {
    res.status(403).json({ message: 'Access denied: Admins only' });
  }
};

const adminOrTrainer = (req, res, next) => {
  if (req.user && (req.user.role === 'admin' || req.user.role === 'trainer' || req.user.isDemo)) {
    next();
  } else {
    res.status(403).json({ message: 'Access denied: Admins and Trainers only' });
  }
};

module.exports = { protect, adminOnly, adminOrTrainer };
