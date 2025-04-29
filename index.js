require('dotenv').config(); // Load environment variables

const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const cookieParser = require('cookie-parser');

const app = express(); //  Declare app BEFORE using it

// DB connection
require('./config/db')();  // Ensure your database connection is established

// Import routes AFTER app is defined
// const subjectRoutes = require('./routes/Subject'); // Uncomment if needed
const pyqRoutes = require('./routes/pyq');
const authRoutes = require('./routes/auth');
const doubtRoutes = require('./routes/doubt'); // ✅ Add this line here

// 1. Set EJS as the view engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// 2. Middlewares
app.use(express.json()); // For JSON body parsing
app.use(express.urlencoded({ extended: true })); // For form submissions
app.use(express.static(path.join(__dirname, 'public'))); // Serve static files
app.use(cookieParser()); // Cookie parser

// Attach user to locals (commented out)
/*
app.use((req, res, next) => {
  res.locals.user = req.user || null;
  next();
});
*/

// 3. Routes
// app.use('/subjects', subjectRoutes); // Uncomment if needed
app.use('/', authRoutes); // Login, Signup, etc.
app.use('/pyq', pyqRoutes); // PYQ-related routes
app.use('/doubt', doubtRoutes); 

// 4. 404 error handler
app.use((req, res, next) => {
  res.status(404).render('404'); // Make sure views/404.ejs exists
});

// 5. Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something went wrong!');
});

// 6. Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
