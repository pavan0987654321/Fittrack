const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

// Load env vars
dotenv.config();

// Route imports
const authRoutes         = require('./routes/authRoutes');
const memberRoutes       = require('./routes/memberRoutes');
const trainerRoutes      = require('./routes/trainerRoutes');
const planRoutes         = require('./routes/planRoutes');
const paymentRoutes      = require('./routes/paymentRoutes');
const progressRoutes     = require('./routes/progressRoutes');
const subscriptionRoutes = require('./routes/subscriptionRoutes');
const attendanceRoutes   = require('./routes/attendanceRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const analyticsRoutes    = require('./routes/analyticsRoutes');
const { checkExpiries }  = require('./controllers/notificationController');

const app = express();

// ─── Middleware ────────────────────────────────────────────────────────────────
app.use(cors({
  origin: function (origin, callback) {
    if (!origin || origin.includes('localhost') || origin.includes('vercel.app')) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// ─── Routes ───────────────────────────────────────────────────────────────────
app.use('/api/auth',          authRoutes);
app.use('/api/members',       memberRoutes);
app.use('/api/trainers',      trainerRoutes);
app.use('/api/plans',         planRoutes);
app.use('/api/payments',      paymentRoutes);
app.use('/api/progress',      progressRoutes);
app.use('/api/subscriptions', subscriptionRoutes);
app.use('/api/attendance',    attendanceRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/analytics',     analyticsRoutes);

// Run expiry checker once a day (86400000 ms) and once on startup
setTimeout(checkExpiries, 5000); // Short delay on startup to ensure DB is connected
setInterval(checkExpiries, 24 * 60 * 60 * 1000);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'FitTrack API is running 🏋️' });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Internal Server Error', error: err.message });
});

// ─── MongoDB Connection ────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/fittrack';

mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log('✅ MongoDB connected successfully');
    app.listen(PORT, () => {
      console.log(`🚀 FitTrack server running on http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error('❌ MongoDB connection error:', err.message);
    process.exit(1);
  });
