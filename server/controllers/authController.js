const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '7d' });
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
const register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User with this email already exists' });
    }

    const adminEmails = ['kppatelkppatel2786@gmail.com', 'gajulapavan29@gmail.com'];
    let assignedRole = role || 'member';
    
    // Auto-assign admin if email matches, or restrict admin if they asked for it but aren't in the list
    if (adminEmails.includes(email.toLowerCase())) {
      assignedRole = 'admin';
    } else if (assignedRole === 'admin') {
      assignedRole = 'member';
    }

    const user = await User.create({ name, email, password, role: assignedRole });

    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token: generateToken(user._id),
    });
  } catch (error) {
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(val => val.message);
      return res.status(400).json({ message: messages.join(', ') });
    }
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token: generateToken(user._id),
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// ── Helper: build member profile response ────────────────────────────────────
function buildMemberProfile(user, memberRecord) {
  return {
    _id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    avatar: user.avatar,
    // Member-specific
    memberId:        memberRecord._id,
    membershipPlan:  memberRecord.membershipPlan,
    trainerAssigned: memberRecord.trainerAssigned,
    expiryDate:      memberRecord.expiryDate,
    joinDate:        memberRecord.joinDate,
    status:          memberRecord.status,
    phone:           memberRecord.phone,
    // Fitness fields
    age:             memberRecord.age,
    gender:          memberRecord.gender,
    height:          memberRecord.height,
    weight:          memberRecord.weight,
    bmi:             memberRecord.bmi,
    fitnessGoal:     memberRecord.fitnessGoal,
    address:         memberRecord.address,
  };
}

// @desc    Get current user profile
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res) => {
  try {
    const user = req.user;
    if (user.role === 'member') {
      const Member = require('../models/Member');
      const memberRecord = await Member.findOne({ email: user.email })
        .populate('membershipPlan', 'name price duration')
        .populate('trainerAssigned', 'name specialty phone');

      if (memberRecord) {
        return res.json(buildMemberProfile(user, memberRecord));
      }
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Update profile (and Member fitness data if caller is a member)
// @route   PUT /api/auth/me
// @access  Private
const updateProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    user.name = req.body.name || user.name;
    user.email = req.body.email || user.email;
    if (req.body.password) user.password = req.body.password;

    const updated = await user.save();

    // For members – also update their Member doc & log a Progress entry
    if (user.role === 'member') {
      const Member = require('../models/Member');
      const Progress = require('../models/Progress');

      const { age, height, weight, fitnessGoal, gender, phone, address } = req.body;
      const fitnessUpdate = {};
      if (age          !== undefined) fitnessUpdate.age          = age === '' ? null : Number(age);
      if (height       !== undefined) fitnessUpdate.height       = height === '' ? null : Number(height);
      if (weight       !== undefined) fitnessUpdate.weight       = weight === '' ? null : Number(weight);
      if (fitnessGoal  !== undefined) fitnessUpdate.fitnessGoal  = fitnessGoal;
      if (gender       !== undefined) fitnessUpdate.gender       = gender;
      if (phone        !== undefined) fitnessUpdate.phone        = phone;
      if (address      !== undefined) fitnessUpdate.address      = address;

      // Recalculate BMI inline if both are strictly valid numbers
      if (typeof fitnessUpdate.weight === 'number' && fitnessUpdate.weight > 0 && 
          typeof fitnessUpdate.height === 'number' && fitnessUpdate.height > 0) {
        const hm = fitnessUpdate.height / 100;
        fitnessUpdate.bmi = Math.round((fitnessUpdate.weight / (hm * hm)) * 10) / 10;
      } else if (fitnessUpdate.weight === null || fitnessUpdate.height === null) {
        fitnessUpdate.bmi = null;
      }

      let memberRecord = null;
      if (Object.keys(fitnessUpdate).length > 0) {
        fitnessUpdate.name = updated.name;
        
        memberRecord = await Member.findOneAndUpdate(
          { email: user.email },
          { $set: fitnessUpdate },
          { new: true, runValidators: true, upsert: true }
        )
          .populate('membershipPlan', 'name price duration')
          .populate('trainerAssigned', 'name specialty phone');

        // Log progress whenever weight is updated
        if (weight !== undefined && weight !== '' && memberRecord) {
          await Progress.create({ memberId: memberRecord._id, weight: Number(weight) });
        }
      }

      if (!memberRecord) {
        memberRecord = await Member.findOne({ email: user.email })
          .populate('membershipPlan', 'name price duration')
          .populate('trainerAssigned', 'name specialty phone');
      }

      if (memberRecord) {
        return res.json({
          ...buildMemberProfile(updated, memberRecord),
          token: generateToken(updated._id),
        });
      }
    }

    res.json({
      _id: updated._id,
      name: updated.name,
      email: updated.email,
      role: updated.role,
      token: generateToken(updated._id),
    });
  } catch (error) {
    if (error.name === 'ValidationError' || error.errors) {
      const messages = Object.values(error.errors || {}).map(val => val.message);
      return res.status(400).json({ message: messages.length ? messages.join(', ') : error.message });
    }
    console.error('Profile Update Error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = { register, login, getMe, updateProfile };

