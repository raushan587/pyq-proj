require('dotenv').config(); // Load environment variables

const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const cookieParser = require('cookie-parser');
const assistantRoutes = require('./routes/assistant');
const apiRoutes = require('./routes/api'); 
const app = express(); 

// DB connection
require('./config/db')();  

const pyqRoutes = require('./routes/pyq');
const authRoutes = require('./routes/auth');
const doubtRoutes = require('./routes/doubt'); 

//  EJS as the view engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

//  Middlewares
app.use(express.json()); //  JSON body parsing
app.use(express.urlencoded({ extended: true })); // form submissions
app.use(express.static(path.join(__dirname, 'public'))); //  static files
app.use(cookieParser()); // Cookie parser
app.use('/assistant', assistantRoutes);
app.use('/api', apiRoutes);

/*
app.use((req, res, next) => {
  res.locals.user = req.user || null;
  next();
});
*/

//  Routes

app.use('/', authRoutes); // Login, Signup, etc.
app.use('/pyq', pyqRoutes); // PYQ-related routes
app.use('/doubt', doubtRoutes); 

// 404 error handler
app.use((req, res, next) => {
  res.status(404).render('404');
});

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something went wrong!');
});

//  Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
