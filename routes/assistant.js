// routes/assistant.js
const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
  res.render('assistant'); // render assistant.ejs
});

module.exports = router;
