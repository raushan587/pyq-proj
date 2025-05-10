// models/questionPaper.js
// models/questionPaper.js
const mongoose = require('mongoose');

const questionPaperSchema = new mongoose.Schema({
  branch: { type: String, required: true },
  semester: { type: Number, required: true },
  filePath: { type: String, required: true },
  fileName: { type: String, required: true },
  uploadedAt: { type: Date, default: Date.now },
});

const QuestionPaper = mongoose.model('QuestionPaper', questionPaperSchema);

module.exports = { QuestionPaper };
