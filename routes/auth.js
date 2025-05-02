const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController'); // Correct path
const verifyToken = require('../middleware/verifyToken');

// Route to render login page
router.get('/login', (req, res) => {
  res.render('login');
});

// Route to render signup page
router.get('/signup', (req, res) => {
  res.render('signup');
});


// Route to handle login
router.post('/login', authController.loginUser);

// Route to handle signup
router.post('/signup', authController.signupUser);
router.get('/verify-email', authController.verifyEmail);
module.exports = router;
console.log(authController);//auth.js