const router = require('express').Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');

// Customer Register (public)
router.post('/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;
    if (!username || !email || !password) return res.status(400).json({ msg: 'All fields required' });
    if (await User.findOne({ username })) return res.status(400).json({ msg: 'Username already taken' });
    if (await User.findOne({ email })) return res.status(400).json({ msg: 'Email already registered' });
    // Always register as customer from public route
    const user = new User({ username, email, password, role: 'customer' });
    await user.save();
    res.status(201).json({ msg: 'Account created! Please log in.' });
  } catch (err) { res.status(500).json({ msg: err.message }); }
});

// Customer Login — only accepts role=customer
router.post('/login/customer', async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username });
    if (!user) return res.status(400).json({ msg: 'Invalid username or password' });
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ msg: 'Invalid username or password' });
    if (user.role !== 'customer') return res.status(403).json({ msg: '⛔ This is the customer portal. Use Admin Login instead.' });
    const token = jwt.sign({ id: user._id, role: user.role, username: user.username }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, role: user.role, username: user.username });
  } catch (err) { res.status(500).json({ msg: err.message }); }
});

// Admin Login — only accepts role=employee
router.post('/login/admin', async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username });
    if (!user) return res.status(400).json({ msg: 'Invalid credentials' });
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ msg: 'Invalid credentials' });
    if (user.role !== 'employee') return res.status(403).json({ msg: '⛔ Access denied. This is the admin portal only.' });
    const token = jwt.sign({ id: user._id, role: user.role, username: user.username }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, role: user.role, username: user.username });
  } catch (err) { res.status(500).json({ msg: err.message }); }
});

// Generic login (backward compat)
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username });
    if (!user) return res.status(400).json({ msg: 'Invalid credentials' });
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ msg: 'Invalid credentials' });
    const token = jwt.sign({ id: user._id, role: user.role, username: user.username }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, role: user.role, username: user.username });
  } catch (err) { res.status(500).json({ msg: err.message }); }
});

// Reset Password Route
router.post('/reset-password', async (req, res) => {
  try {
    const { email, newPassword } = req.body;
    if (!email || !newPassword) return res.status(400).json({ msg: 'Email and new password are required' });
    if (newPassword.length < 6) return res.status(400).json({ msg: 'Password must be at least 6 characters' });
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ msg: 'No account found with that email address' });
    
    // Assign raw password; UserSchema.pre('save') handles the hashing
    user.password = newPassword;
    await user.save();
    
    res.json({ msg: 'Password reset successful! You can now log in.' });
  } catch (err) { res.status(500).json({ msg: err.message }); }
});

module.exports = router;
