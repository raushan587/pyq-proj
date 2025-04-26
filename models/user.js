// /models/User.js

const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: false,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    match: [/.+\@.+\..+/, 'Please enter a valid email address'],
  },
  password: {
    type: String,
    required: true,
  },
  isVerified: {
    type: Boolean,
    default: false, // You can use this for email verification flow
  },
  role: {
    type: String,
    enum: ['admin', 'user'], // Role must be either 'admin' or 'user'
    default: 'user',
  },
});

module.exports = mongoose.model('User', userSchema);
// user.js