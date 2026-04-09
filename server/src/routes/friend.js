const router = require('express').Router();
const Friendship = require('../models/Friendship');
const auth = require('../middleware/auth');

router.get('/list', auth, async (req, res) => {
  try {
    const friendships = await Friendship.find({ $or: [{ user1: req.userId }, { user2: req.userId }] }).populate('user1 user2', '-password');
    const friends = friendships.map(f => {
      return f.user1._id.toString() === req.userId ? f.user2 : f.user1;
    });
    res.json(friends);
  } catch(e) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/add', auth, async (req, res) => {
  try {
    const { friendId } = req.body;
    if (friendId === req.userId) return res.status(400).json({ message: 'Cannot add yourself' });
    const ids = [req.userId, friendId].sort();
    const existing = await Friendship.findOne({ user1: ids[0], user2: ids[1] });
    if (existing) return res.status(400).json({ message: 'Already friends' });
    const friendship = new Friendship({ user1: ids[0], user2: ids[1] });
    await friendship.save();
    res.json({ message: 'Friend added successfully' });
  } catch(e) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/check/:friendId', auth, async (req, res) => {
  try {
    const ids = [req.userId, req.params.friendId].sort();
    const existing = await Friendship.findOne({ user1: ids[0], user2: ids[1] });
    res.json({ isFriend: !!existing });
  } catch(e) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
