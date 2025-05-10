require('dotenv').config(); // environment variables
const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const cookieParser = require('cookie-parser');
const methodOverride = require('method-override'); 
const pyqRoutes = require('./routes/pyq');
const authRoutes = require('./routes/auth');



const app = express();

// DB connection
require('./config/db')();

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.json()); 
app.use(express.urlencoded({ extended: true })); 
app.use(methodOverride(function (req, res) {
  if (req.body && typeof req.body === 'object' && '_method' in req.body) {
    console.log('methodOverride triggered:', req.body._method); 
    return req.body._method; 
  }
}));

app.use(methodOverride('_method')); 
app.use(express.static(path.join(__dirname, 'public'))); 
app.use(cookieParser()); 


app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes


app.use('/', authRoutes); 
app.use('/pyq', pyqRoutes); 


// 404 error handler
app.use((req, res, next) => {
  res.status(404).render('404');
});




// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something went wrong!');
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
