const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const Doubt = require('../models/doubt');
const verifyToken = require('../middleware/verifyToken');
const methodOverride = require('method-override');
const router = express.Router();


const uploadDir = path.join(__dirname, '..', 'uploads', 'doubts');

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Multer configuration for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname)); 
  }
});

const upload = multer({ storage });

// GET: Ask doubt form
router.get('/ask', verifyToken, (req, res) => {
  res.render('doubtForm'); 
});

// POST: Ask doubt
router.post('/ask', verifyToken, upload.single('image'), async (req, res) => {
  const { text } = req.body;
  const imagePath = req.file ? `/uploads/doubts/${req.file.filename}` : null;   

  try {
    
    await Doubt.create({
      userEmail: req.user.email,
      text,
      image: imagePath
    });
    res.redirect('/doubt/all'); 
  } catch (error) {
    console.error('Error creating doubt:', error);
    res.status(500).send('Something went wrong while posting the doubt.');
  }
});

// GET
router.get('/all', verifyToken, async (req, res) => {
  try {
    const doubts = await Doubt.find().populate('userEmail', 'email'); 
    res.render('doubts', { doubts, currentUserEmail: req.user.email }); 
  } catch (error) {
    console.error('Error fetching doubts:', error);
    res.status(500).send('Error fetching doubts.');
  }
});

// POST
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
    console.error('Error replying to doubt:', error);
    res.status(500).send('Reply failed');
  }
});

// DELETE a reply
router.delete('/delete/reply/:doubtId/:replyId', verifyToken, async (req, res) => {
  const { doubtId, replyId } = req.params;

  try {
    const doubt = await Doubt.findById(doubtId);
    if (!doubt) {
      return res.status(404).send('Doubt not found');
    }

    const replyIndex = doubt.replies.findIndex(reply => reply._id.toString() === replyId);
    if (replyIndex === -1) {
      return res.status(404).send('Reply not found');
    }

    
    if (doubt.replies[replyIndex].userEmail !== req.user.email) {
      return res.status(403).send('Unauthorized');
    }

    
    doubt.replies.splice(replyIndex, 1);
    await doubt.save();

    res.redirect('/doubt/all'); 
  } catch (error) {
    console.error('Error deleting reply:', error);
    res.status(500).send('Something went wrong');
  }
});

// DELETE a doubt
router.delete('/delete/:doubtId', verifyToken, async (req, res) => {
  const { doubtId } = req.params;
  try {
    const doubt = await Doubt.findByIdAndDelete(doubtId);

    if (!doubt) {
      return res.status(404).send('Doubt not found');
    }

    res.redirect('/doubt/all'); 
  } catch (err) {
    console.error('Error deleting doubt:', err);
    res.status(500).send('Internal Server Error');
  }
});

module.exports = router;
