const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const Doubt = require('../models/doubt');  // Mongoose model for doubts
const verifyToken = require('../middleware/verifyToken');  // JWT verification middleware
const router = express.Router();

// Define the upload directory path
const uploadDir = path.join(__dirname, '..', 'uploads', 'doubts');

// Ensure the directory exists
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Multer configuration for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);  // Specify where to store the uploaded files
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname)); // Ensure unique filenames using timestamp
  }
});

const upload = multer({ storage });

// GET: Ask doubt form (protected route, only accessible by authenticated users)
router.get('/ask', verifyToken, (req, res) => {
  res.render('doubtForm');  // Render the 'doubtForm.ejs' view for the form
});

// POST: Submit a doubt (protected route, only accessible by authenticated users)
router.post('/ask', verifyToken, upload.single('image'), async (req, res) => {
  const { text } = req.body;
  const imagePath = req.file ? `/uploads/doubts/${req.file.filename}` : null;  // Handle file path for image upload

  try {
    // Save the doubt in the database using the user's email from the JWT
    await Doubt.create({
      userEmail: req.user.email,  // Using email instead of ObjectId (from the JWT)
      text,
      image: imagePath
    });
    res.redirect('/doubt/all');  // Redirect to the page displaying all doubts
  } catch (error) {
    console.error('❌ Error creating doubt:', error);
    res.status(500).send('Something went wrong while posting the doubt.');
  }
});

// GET: View all doubts (this route shows all doubts posted by users)

  router.get('/all', verifyToken, async (req, res) => {
    try {
      // Fetch all doubts and populate the user details (email in this case)
      const doubts = await Doubt.find().populate('userEmail', 'email'); // Populate with email
  
      // Render the 'doubts.ejs' view and pass both the doubts data and currentUserEmail
      res.render('doubts', { doubts, currentUserEmail: req.user.email });
    } catch (error) {
      console.error('❌ Error fetching doubts:', error);
      res.status(500).send('Error fetching doubts.');
    }
  });
  
// POST: Reply to a doubt
router.post('/reply/:id', verifyToken, async (req, res) => {
    const { replyText } = req.body;
    const doubtId = req.params.id;
  
    try {
      const doubt = await Doubt.findById(doubtId);
      if (!doubt) return res.status(404).send('Doubt not found');
  
      doubt.replies.push({
        text: replyText,
        userEmail: req.user.email
      });
  
      await doubt.save();
      res.redirect('/doubt/all');
    } catch (error) {
      console.error('❌ Error replying to doubt:', error);
      res.status(500).send('Reply failed');
    }
  });
  
router.post('/delete/:id', verifyToken, async (req, res) => {
  try {
    const doubt = await Doubt.findById(req.params.id);
    if (!doubt) return res.status(404).send('Doubt not found');

    if (doubt.userEmail !== req.user.email) {
      return res.status(403).send('Unauthorized');
    }

    await Doubt.findByIdAndDelete(req.params.id);
    res.redirect('/doubt/all');
  } catch (err) {
    res.status(500).send('Server error');
  }
});

module.exports = router;
