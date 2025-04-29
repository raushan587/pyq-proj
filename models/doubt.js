const mongoose = require('mongoose');

const replySchema = new mongoose.Schema({
  userEmail: { type: String, required: true },
  text: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

const doubtSchema = new mongoose.Schema({
  userEmail: { type: String, required: true },
  text: { type: String, required: true },
  image: { type: String },
  replies: [replySchema]  // Embed replies directly
});

const Doubt = mongoose.model('Doubt', doubtSchema);
module.exports = Doubt;
