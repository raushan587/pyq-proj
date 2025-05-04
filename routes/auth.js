const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController'); 
const verifyToken = require('../middleware/verifyToken'); 


router.get('/login', (req, res) => {
  res.render('login');
});


router.get('/signup', (req, res) => {
  res.render('signup');
});


router.post('/signup', authController.signupUser);


router.post('/login', authController.loginUser);


router.get('/verify-email', authController.verifyEmail);

module.exports = router;
