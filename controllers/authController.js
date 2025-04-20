const User = require('../models/user');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();

// LOGIN
exports.loginUser = async (req, res) => {
  const { username, password } = req.body;

  try {
    if (!username || !password) {
      return res.status(400).send('Please provide both username and password');
    }

    // You can also allow login by email, optional
    const user = await User.findOne({ username }); // Or use: { $or: [{ username }, { email: username }] }

    if (!user) return res.send('Invalid username or password');

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.send('Invalid username or password');

    const token = jwt.sign(
      { id: user._id, username: user.username, role: user.role }, // ← include role
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );
    
    res.cookie('token', token, { httpOnly: true, secure: process.env.NODE_ENV === 'production' });
    res.redirect('/pyq');
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
};

// SIGNUP
exports.signupUser = async (req, res) => {
  const { username, email, password, confirmPassword } = req.body;

  if (!username || !email || !password || !confirmPassword) {
    return res.status(400).send('All fields are required');
  }

  if (password !== confirmPassword) {
    return res.status(400).send('Passwords do not match');
  }

  try {
    // Check if username or email already exists
    const existing = await User.findOne({ $or: [{ username }, { email }] });
    if (existing) {
      return res.status(400).send('Username or email already exists');
    }

    const hashed = await bcrypt.hash(password, 10);
    const newUser = new User({
      username,
      email,
      password: hashed,
    });

    await newUser.save();

    res.redirect('/login');
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
};
// authcontroller
// EXPORTING THE CONTROLLER METHODS

// authcontroller