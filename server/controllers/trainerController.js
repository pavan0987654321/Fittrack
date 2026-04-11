const Trainer = require('../models/Trainer');

// @desc    Get all trainers
// @route   GET /api/trainers
// @access  Private
const getTrainers = async (req, res) => {
  try {
    const { status } = req.query;
    const query = {};
    if (status) query.status = status;

    const trainers = await Trainer.find(query)
      .populate('assignedMembers', 'name email')
      .sort({ createdAt: -1 });
    res.json(trainers);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get single trainer
// @route   GET /api/trainers/:id
// @access  Private
const getTrainer = async (req, res) => {
  try {
    const trainer = await Trainer.findById(req.params.id)
      .populate('assignedMembers', 'name email phone');
    if (!trainer) return res.status(404).json({ message: 'Trainer not found' });
    res.json(trainer);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Create trainer
// @route   POST /api/trainers
// @access  Private/Admin
const createTrainer = async (req, res) => {
  try {
    const trainer = await Trainer.create(req.body);
    res.status(201).json(trainer);
  } catch (error) {
    res.status(400).json({ message: 'Error creating trainer', error: error.message });
  }
};

// @desc    Update trainer
// @route   PUT /api/trainers/:id
// @access  Private/Admin
const updateTrainer = async (req, res) => {
  try {
    const trainer = await Trainer.findByIdAndUpdate(req.params.id, req.body, {
      new: true, runValidators: true,
    });
    if (!trainer) return res.status(404).json({ message: 'Trainer not found' });
    res.json(trainer);
  } catch (error) {
    res.status(400).json({ message: 'Error updating trainer', error: error.message });
  }
};

// @desc    Delete trainer
// @route   DELETE /api/trainers/:id
// @access  Private/Admin
const deleteTrainer = async (req, res) => {
  try {
    const trainer = await Trainer.findByIdAndDelete(req.params.id);
    if (!trainer) return res.status(404).json({ message: 'Trainer not found' });
    res.json({ message: 'Trainer deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = { getTrainers, getTrainer, createTrainer, updateTrainer, deleteTrainer };
