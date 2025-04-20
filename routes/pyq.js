console.log(" /pyq routes loaded");
const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const router = express.Router();
const verifyToken = require('../middleware/verifyToken');
const { QuestionPaper } = require('../models/questionPaper');

// Multer setup
const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    const { branch, semester } = req.body;
    const dir = `./uploads/${branch}/sem${semester}`; //  fixed template literal
    try {
      // Ensuring directory is created if it doesn't exist
      await fs.promises.mkdir(dir, { recursive: true });
      cb(null, dir);
    } catch (err) {
      console.error(' Error creating directory:', err);
      cb(err, null);
    }
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${Date.now()}${ext}`); //  fixed template literal
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB max file size
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['.pdf'];
    const ext = path.extname(file.originalname);
    if (!allowedTypes.includes(ext)) {
      return cb(new Error('Only PDF files are allowed.'));
    }
    cb(null, true);
  },
});

// Function to render pyq.ejs
async function renderPyqPage(res, query = {}, user = null, message = '') {
  try {
    const questionPapers = await QuestionPaper.find(query);

    console.log(" Rendering PYQ page with data:", {
      user,
      query,
      total: questionPapers.length
    });

    res.render('pyq', {
      user,
      questionPapers,
      branch: query.branch || '',
      semester: query.semester || '',
      year: query.year || '',
      subject: query.subject || '',
      message,
      searched: true // This enables result rendering
    });
  } catch (error) {
    console.error(' Error fetching question papers:', error);
    res.status(500).send('Internal server error');
  }
}

// GET: Load the PYQ page only if filters are provided
router.get('/', verifyToken, async (req, res) => {
  const { branch, semester, year, subject } = req.query;

  // If no filters are applied, prompt the user
  if (!branch || !semester || !year) {
    return res.render('pyq', {
      user: res.locals.user,
      questionPapers: [],
      message: 'Please apply filters to view question papers.',
      branch: branch || '',
      semester: semester || '',
      year: year || '',
      subject: subject || ''
    });
  }

  const query = {
    branch: { $regex: new RegExp(branch, 'i') },
    semester,
    year,
  };
  if (subject) query.subject = subject;

  await renderPyqPage(res, query, res.locals.user);
});

// POST: Filter route via form submission
router.post('/', verifyToken, async (req, res) => {
  const { branch, semester, year, subject } = req.body;
  const query = {};

  if (branch) query.branch = { $regex: new RegExp(branch, 'i') };
  if (semester) query.semester = semester;
  if (year) query.year = year;
  if (subject) query.subject = subject;

  await renderPyqPage(res, query, res.locals.user);
});

// Admin-only file upload
router.post('/upload', verifyToken, upload.single('pdfFile'), async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Only admin can upload question papers.' });
    }

    const { branch, semester, year, subject } = req.body;
    const uploadedFile = req.file;

    if (!branch || !semester || !year || !subject || !uploadedFile) {
      return res.status(400).json({ message: 'All fields and file are required.' });
    }

    const newQuestionPaper = new QuestionPaper({
      branch,
      semester,
      year,
      subject,
      filePath: uploadedFile.path,
      fileName: uploadedFile.filename,
      uploadedAt: new Date(),
    });

    await newQuestionPaper.save();
    res.status(200).json({ message: 'File uploaded successfully.' });
  } catch (error) {
    console.error(' Upload error:', error);
    res.status(500).json({ message: 'Failed to upload question paper.' });
  }
});

//

// Download route
router.get('/download/:id', async (req, res) => {
  console.log("Download route triggered with id", req.params.id);

  try {
    const { id } = req.params;
    const questionPaper = await QuestionPaper.findById(id);

    if (!questionPaper) {
      return res.status(404).json({ message: 'Question paper not found.' });
    }

    // Ensuring the path uses the correct separator and is resolved correctly
    const filePath = path.resolve(questionPaper.filePath.replace(/\\/g, "/"));
    console.log("Resolved file path:", filePath);  // Check if this path is correct

    if (!fs.existsSync(filePath)) {
      console.error("File does not exist:", filePath);  // Debugging: Check if the file exists
      return res.status(404).json({ message: 'File not found.' });
    }

    res.download(filePath, questionPaper.fileName, (err) => {
      if (err) {
        console.error(' Download error:', err);
        res.status(500).json({ message: 'Download failed.' });
      } else {
        console.log(' File download started successfully');
      }
    });
  } catch (error) {
    console.error(' Download error:', error);
    res.status(500).json({ message: 'Failed to download file.' });
  }
});

module.exports = router;
