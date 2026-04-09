const router = require('express').Router();
const User = require('../models/User');
const auth = require('../middleware/auth');

router.get('/me', auth, async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch(e) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/online', auth, async (req, res) => {
  try {
    const users = await User.find({ status: { $ne: 'away' } }).select('-password');
    res.json(users);
  } catch(e) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
