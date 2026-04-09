const router = require('express').Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// 验证 SHA-256 哈希（64位十六进制字符串）
function isValidSha256Hash(hash) {
  return typeof hash === 'string' && /^[a-f0-9]{64}$/i.test(hash);
}

router.post('/register', async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) return res.status(400).json({ message: 'Username and password required' });
    if (!isValidSha256Hash(password)) return res.status(400).json({ message: 'Password must be a valid SHA-256 hash' });
    const existing = await User.findOne({ username });
    if (existing) return res.status(400).json({ message: 'Username already exists' });
    const user = new User({ username, password });
    await user.save();
    res.json({ message: 'Registration successful' });
  } catch(e) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!isValidSha256Hash(password)) return res.status(400).json({ message: 'Invalid credentials' });
    const user = await User.findOne({ username });
    if (!user) return res.status(400).json({ message: 'Invalid credentials' });
    const isMatch = await user.comparePassword(password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });
    user.status = 'idle';
    await user.save();
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '24h' });
    res.json({ token, user: { _id: user._id, username: user.username, wins: user.wins, losses: user.losses, draws: user.draws, status: user.status } });
  } catch(e) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
