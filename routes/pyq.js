const path = require('path');
const fs = require('fs');
const express = require('express');
const multer = require('multer');
const verifyToken = require('../middleware/verifyToken');
const { QuestionPaper } = require('../models/questionPaper');
const router = express.Router();

const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    try {
      const { branch, semester } = req.body;
      const safeBranch = branch.replace(/[^a-z0-9]/gi, '');
      const safeSemester = semester.replace(/[^0-9]/g, '');
      const dir = path.join(__dirname, `../uploads/${safeBranch}/sem${safeSemester}`);

      await fs.promises.mkdir(dir, { recursive: true });
      cb(null, dir);
    } catch (err) {
      console.error('Error creating directory:', err);
      cb(err, null);
    }
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const randomString = Math.random().toString(36).substring(7); 
    cb(null, `${Date.now()}-${randomString}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, 
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['.pdf'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (!allowedTypes.includes(ext)) {
      return cb(new Error('Only PDF files are allowed.'));
    }
    cb(null, true);
  },
});


async function renderPyqPage(res, query = {}, user = null, message = '', files = []) {
  try {
    const questionPapers = await QuestionPaper.find(query).sort({ uploadedAt: -1 }); 
    res.render('pyq', {
      user,
      questionPapers,
      files,
      branch: query.branch?.$regex?.source || '',
      semester: query.semester || '',
      message,
      searched: !!(query.branch || query.semester),
    });
  } catch (error) {
    console.error('Error fetching question papers:', error);
    res.status(500).send('Internal server error');
  }
}


router.get('/about', (req, res) => {
  res.render('about');
});

router.get('/notes', (req, res) => {
  res.render('notes');
});


router.get('/playlist', (req, res) => {
  res.render('playlist'); 
});


router.get('/contact', (req, res) => {
  res.render('contact');
});

// routes/notes.js
// routes/notes.js
router.get('/notes/sem:semester', (req, res) => {
  const { semester } = req.params;
  
  // List of branches to display
  const branches = ['CSE', 'AIML', 'ECE', 'EEE', 'IoT', 'Data Science', 'Mechanical', 'Civil'];

  // Render the page with the branches and semester
  res.render('notesBranch', { semester, branches });
});



router.get('/', verifyToken, async (req, res) => {
  const { branch, semester } = req.query;

  if (!branch || !semester) {
    return res.render('pyq', {
      user: res.locals.user,
      questionPapers: [],
      files: [],
      message: 'Please apply filters to view question papers.',
      branch: branch || '',
      semester: semester || '',
      searched: false,
    });
  }

  const query = {
    branch: { $regex: new RegExp(branch, 'i') },
    semester: Number(semester),
  };

  await renderPyqPage(res, query, res.locals.user);
});

router.post('/', verifyToken, async (req, res) => {
  const { branch, semester } = req.body;
  const query = {};
  if (branch) query.branch = { $regex: new RegExp(branch, 'i') };
  if (semester) query.semester = Number(semester);

  await renderPyqPage(res, query, res.locals.user);
});


router.get('/upload', verifyToken, (req, res) => {
  res.render('uploadpyq', { user: res.locals.user });
});


router.post('/upload', verifyToken, upload.single('pdfFile'), async (req, res) => {
  try {
    const user = req.user || res.locals.user;
    if (!user || user.role !== 'admin') {
      return res.status(403).json({ message: 'Only admin can upload question papers.' });
    }

    const { branch, semester } = req.body;
    const uploadedFile = req.file;

    if (!branch || !semester || !uploadedFile) {
      return res.status(400).json({ message: 'Branch, semester, and file are required.' });
    }

    const newPaper = new QuestionPaper({
      branch,
      semester: Number(semester),
      filePath: uploadedFile.path,
      fileName: uploadedFile.filename,
      uploadedAt: new Date(),
    });

    await newPaper.save();
    res.status(200).json({ message: 'File uploaded successfully.' });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ message: 'Failed to upload question paper.' });
  }
});


router.get('/download/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const questionPaper = await QuestionPaper.findById(id);
    if (!questionPaper) {
      return res.status(404).json({ message: 'Question paper not found.' });
    }

    const filePath = path.resolve(questionPaper.filePath);
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ message: 'File not found.' });
    }

    res.download(filePath, questionPaper.fileName);
  } catch (error) {
    console.error('Download error:', error);
    res.status(500).json({ message: 'Failed to download file.' });
  }
});

router.get('/:branch/sem:semester', verifyToken, async (req, res) => {
  const { branch, semester } = req.params;

  const query = {
    branch: { $regex: new RegExp(branch, 'i') },
    semester: Number(semester),
  };

  await renderPyqPage(res, query, res.locals.user);
});


router.get('/:branch', verifyToken, (req, res) => {
  const { branch } = req.params;
  res.render('pyq', {
    user: res.locals.user,
    questionPapers: [],
    files: [],
    branch,
    semester: '',
    message: 'Select semester to continue.',
    searched: false,
  });
});



module.exports = router;
