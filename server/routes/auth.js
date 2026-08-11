const router = require('express').Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

router.post('/signup', async (req, res) => {
  try {
    const { fullName, studentId, email, department, phone, password } = req.body;
    if (!fullName || !studentId || !email || !department || !phone || !password) {
      return res.status(400).json({ message: 'Please fill in all required fields.' });
    }

    const exists = await User.findOne({ $or: [{ email: email.toLowerCase() }, { studentId }] });
    if (exists) return res.status(409).json({ message: 'Email or Student ID already exists.' });

    const hashedPassword = await bcrypt.hash(password, 12);
    const user = await User.create({ fullName, studentId, email, department, phone, password: hashedPassword });

    const token = jwt.sign({ id: user._id, email: user.email }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.status(201).json({
      message: 'Account created successfully.',
      token,
      user: { id: user._id, fullName: user.fullName, studentId: user.studentId, email: user.email }
    });
  } catch (err) {
    res.status(500).json({ message: 'Could not create account.', error: err.message });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { identifier, password } = req.body;
    const user = await User.findOne({ $or: [{ email: identifier.toLowerCase() }, { studentId: identifier }] });
    if (!user) return res.status(401).json({ message: 'Invalid email/ID or password.' });

    const ok = await bcrypt.compare(password, user.password);
    if (!ok) return res.status(401).json({ message: 'Invalid email/ID or password.' });

    const token = jwt.sign({ id: user._id, email: user.email }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.json({
      message: 'Login successful.',
      token,
      user: { id: user._id, fullName: user.fullName, studentId: user.studentId, email: user.email }
    });
  } catch (err) {
    res.status(500).json({ message: 'Could not login.', error: err.message });
  }
});

module.exports = router;
