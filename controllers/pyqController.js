const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { QuestionPaper } = require('../models/questionPaper'); 

// Set up Multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const { branch, semester } = req.body; 
    const dir = path.join(__dirname, '..', 'uploads', branch, `sem${semester}`);

    
    fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const { branch, semester } = req.body;
    const fileName = `${branch}_sem${semester}_${Date.now()}${path.extname(file.originalname)}`;
    cb(null, fileName);
  }
});

const upload = multer({ storage });


const uploadQuestionPaper = async (req, res) => {
  try {
    // Check if the user is an admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Only admins can upload question papers.' });
    }

    const { branch, semester } = req.body;
    const uploadedFile = req.file;

    
    if (!uploadedFile) {
      return res.status(400).json({ message: 'No file uploaded.' });
    }

  
    const allowedExtensions = ['.pdf', '.docx'];
    const fileExt = path.extname(uploadedFile.originalname).toLowerCase();

    if (!allowedExtensions.includes(fileExt)) {
      return res.status(400).json({ message: 'Only PDF and DOCX files are allowed.' });
    }

    
    const newQuestionPaper = await QuestionPaper.create({
      branch,
      semester,
      filePath: uploadedFile.path,
      fileName: uploadedFile.filename,
    });

    res.status(200).json({ message: 'Question paper uploaded successfully.', data: newQuestionPaper });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ message: 'Failed to upload question paper.' });
  }
};


const renderPyqPage = async (req, res) => {
  try {
    const { branch, semester } = req.params;  
    const query = {};
    let questionPapers = [];
    let files = [];
    let message = '';
    let searched = false;

    
    if (branch) query.branch = branch;
    if (semester) query.semester = Number(semester);  

    if (branch && semester) {
      searched = true;
      console.log('Querying for:', query);

    
      questionPapers = await QuestionPaper.find(query);

    
      console.log('Fetched question papers:', questionPapers);

      
      const dirPath = path.join(__dirname, '..', 'uploads', branch, `sem${semester}`);
      if (fs.existsSync(dirPath)) {
        files = fs.readdirSync(dirPath);
      }

      
      if (!questionPapers.length && !files.length) {
        message = 'No question papers or files found for the selected filters.';
      }
    }

    
    res.render('pyq', {
      user: req.user,
      branch,
      semester,
      questionPapers,
      files,
      message,
      searched,
    });
  } catch (error) {
    console.error('Render error:', error);
    res.status(500).send('Error loading PYQ page');
  }
};


const downloadQuestionPaper = async (req, res) => {
  try {
    const { id } = req.params;
    const questionPaper = await QuestionPaper.findById(id);

    if (!questionPaper) {
      return res.status(404).json({ message: 'Question paper not found.' });
    }

    const filePath = path.resolve(questionPaper.filePath);
    if (!filePath.startsWith(path.resolve('./uploads/'))) {
      return res.status(400).json({ message: 'Invalid file path.' });
    }

    
    console.log('Downloading file from path:', filePath);

    
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
  renderPyqPage,
  downloadQuestionPaper,
};

