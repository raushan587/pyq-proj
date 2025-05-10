
const User = require('../models/user');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
require('dotenv').config();

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_PASS,
  },
});


const sendVerificationEmail = async (user, req) => {
  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });

  
  const verificationUrl = `${req.protocol}://${req.get('host')}/verify-email?token=${token}`;

  await transporter.sendMail({
    from: process.env.GMAIL_USER, 
    to: user.email,
    subject: 'Verify Your Email',
    html: `<p>Hello ${user.username},</p>
           <p>Please click the link below to verify your email:</p>
           <p><a href="${verificationUrl}">${verificationUrl}</a></p>`,
  });
};

// LOGIN 
exports.loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    if (!email || !password) {
      return res.status(400).send('Please provide both email and password');
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).send('Invalid email or password');
    }

    if (!user.isVerified) {
      return res.status(403).send('Please verify your email before logging in.');
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).send('Invalid email or password');
    }

    const token = jwt.sign(
      { id: user._id, username: user.username, email: user.email, role: user.role },
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
    
    console.log('Signup attempt with email:', email);

    const existingEmail = await User.findOne({ email });
    if (existingEmail) {
      console.log('Email already found in DB:', existingEmail.email);
      return res.status(400).send('Email already exists');
    }

    console.log('Proceeding to save user with email:', email);

    
    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      username,
      email,
      password: hashedPassword,
      isVerified: false, 
    });

    await newUser.save();

   
    await sendVerificationEmail(newUser, req);

    res.status(200).send('Signup successful! Please check your email to verify your account.');
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
};


exports.verifyEmail = async (req, res) => {
  const { token } = req.query;

  try {
    // Decode the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(400).send('Invalid verification link');
    }

    if (user.isVerified) {
      return res.send('Email already verified');
    }

    user.isVerified = true;
    await user.save();

    res.status(200).send('Email verified successfully! You can now log in.');
  } catch (err) {
    console.error(err);
    res.status(400).send('Invalid or expired token.');
  }
};

// authcontroller


// authcontroller