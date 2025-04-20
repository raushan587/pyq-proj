// /controllers/subjectController.js

/*const Subject = require('../models/Subject'); // Make sure this path matches the actual file name and casing

// Function to save a new subject entry
async function saveSubject(req, res) {
  const { branch, semester, subject, year } = req.body;
  const filePath = req.file?.path; // Assuming you're using multer to handle file uploads

  if (!filePath) {
    return res.status(400).json({ message: 'File not uploaded or filePath missing' });
  }

  try {
    const newSubject = new Subject({
      branch,
      semester,
      subject,
      year,
      filePath,
    });

    await newSubject.save();
    console.log('Subject saved successfully!');
    res.status(201).json({ message: 'Subject saved successfully!' });
  } catch (error) {
    console.error('Error saving subject:', error);
    res.status(500).json({ message: 'Error saving subject' });
  }
}

module.exports = { saveSubject };*/
