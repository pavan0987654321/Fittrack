/**
 * seed.js  —  Creates a default admin user in the database
 * Run with:  node seed.js
 */

const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const User = require('./models/User');

async function seed() {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/fittrack');
    console.log('✅ Connected to MongoDB');

    // Check if admin already exists
    const existing = await User.findOne({ email: 'admin@fittrack.com' });
    if (existing) {
      console.log('ℹ️  Admin user already exists — nothing to do.');
      process.exit(0);
    }

    await User.create({
      name: 'Admin User',
      email: 'admin@fittrack.com',
      password: 'admin123',   // will be hashed by the pre-save hook
      role: 'admin',
    });

    console.log('🎉 Admin user created successfully!');
    console.log('   Email:    admin@fittrack.com');
    console.log('   Password: admin123');
    process.exit(0);
  } catch (err) {
    console.error('❌ Seed failed:', err.message);
    process.exit(1);
  }
}

seed();
