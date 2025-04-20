const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { QuestionPaper } = require('../models/questionPaper');

//  Configure Multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const { branch, semester } = req.body;
    const dir = path.join(__dirname, '..', 'uploads', branch, `sem${semester}`);  // Corrected string interpolation
    
    // Create directory if it doesn't exist
    fs.mkdirSync(dir, { recursive: true });
    
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const { branch, semester } = req.body;
    const fileName = `${branch}_sem${semester}_${Date.now()}${path.extname(file.originalname)}`;  // Corrected string interpolation
    cb(null, fileName);
  }
});

const upload = multer({ storage });

//  Upload Controller (Admins only)
const uploadQuestionPaper = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Only admins can upload question papers.' });
    }

    const { branch, semester, year, subject } = req.body;
    const uploadedFile = req.file;

    if (!uploadedFile) {
      return res.status(400).json({ message: 'No file uploaded.' });
    }

    const allowedExtensions = ['.pdf', '.docx'];
    if (!allowedExtensions.includes(path.extname(uploadedFile.originalname).toLowerCase())) {
      return res.status(400).json({ message: 'Only PDF and DOCX files are allowed.' });
    }

    const newQuestionPaper = await QuestionPaper.create({
      branch,
      semester,
      year,
      subject,
      filePath: uploadedFile.path,  // Store relative path in the DB
      fileName: uploadedFile.filename,
      uploadedAt: new Date(),
    });

    res.status(200).json({ message: 'Question paper uploaded successfully.', data: newQuestionPaper });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ message: 'Failed to upload question paper.' });
  }
};

// Search Controller
const searchQuestionPapers = async (req, res) => {
  try {
    const { branch, semester, year, subject } = req.query;

    const query = {};
    if (branch) query.branch = { '$regex': new RegExp(branch, 'i') };  // Case-insensitive search
    if (semester) query.semester = semester;
    if (year) query.year = year;
    if (subject) query.subject = subject;

    const questionPapers = await QuestionPaper.find(query);
    if (!questionPapers.length) {
      return res.status(404).json({ message: 'No question papers found for the given criteria.' });
    }

    res.status(200).json(questionPapers);
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({ message: 'Failed to fetch question papers.' });
  }
};

//  Render PYQ Dashboard Page
const renderPyqPage = async (req, res) => {
  try {
    const { branch, semester, year, subject } = req.query;
    const query = {};

    if (branch) query.branch = branch;
    if (semester) query.semester = semester;
    if (year) query.year = year;
    if (subject) query.subject = subject;

    console.log("Running query:", query);  //  Log the query

    let questionPapers = [];
    let message = '';
    let searched = false;

    if (Object.keys(query).length) {
      searched = true;
      questionPapers = await QuestionPaper.find(query);

      console.log("Found question papers:", questionPapers);  //  Log the result

      if (!questionPapers.length) {
        message = 'No question papers found for the selected filters.';
      }
    }

    res.render('pyq', {
      user: req.user,
      questionPapers,
      message,
      searched
    });
  } catch (error) {
    console.error('Render error:', error);
    res.status(500).send('Error loading PYQ page');
  }
};

// ⬇ Download Question Paper by ID
const downloadQuestionPaper = async (req, res) => {
  try {
    const { id } = req.params;
    console.log('Download requested for Question Paper ID:', id); // Log the ID

    const questionPaper = await QuestionPaper.findById(id);
    if (!questionPaper) {
      console.log('No question paper found for ID:', id); // Log if no paper is found
      return res.status(404).json({ message: 'Question paper not found.' });
    }

    const filePath = path.resolve(questionPaper.filePath);  // Use absolute path resolution
    console.log('File Path:', filePath); // Log the file path
    // Validate the file path is under the uploads directory
    if (!filePath.startsWith(path.resolve('./uploads/'))) {
      console.log('Invalid file path:', filePath); // Log if file path is invalid
      return res.status(400).json({ message: 'Invalid file path.' });
    }

    // Start the download
    res.download(filePath, questionPaper.fileName, (err) => {
      if (err) {
        console.error('Download error:', err);
        res.status(500).json({ message: 'Failed to download the file.' });
      }
    });
  } catch (error) {
    console.error('Download error:', error);
    res.status(500).json({ message: 'Failed to download the file.' });
  }
};

module.exports = {
  upload,
  uploadQuestionPaper,
  searchQuestionPapers,
  renderPyqPage,
  downloadQuestionPaper,
};
