const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const authRoutes = require('./routes/auth');
const emailRoutes = require('./routes/emails');
const templateRoutes = require('./routes/templates');
const dataRoutes = require('./routes/data');

dotenv.config();

const app = express();

const allowedOrigins = process.env.FRONTEND_URL
  .split(',')
  .map(o => o.trim().replace(/\/+$/, ''));

app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization');
  }
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

// Separate CORS errors
app.use((err, req, res, next) => {
  if (err.message && err.message.includes('not allowed by CORS')) {
    return res.status(403).json({ success: false, message: err.message });
  }
  console.error(err.stack);
  res.status(500).json({ success: false, message: 'Something went wrong!', error: err.message });
});
console.log("🚀 FRONTEND_URL:", process.env.FRONTEND_URL);
console.log("🚀 allowedOrigins:", allowedOrigins);

// Body parser middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/emails', emailRoutes);
app.use('/api/templates', templateRoutes);
app.use('/api/data', dataRoutes);


// Database connection
mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('Connected to MongoDB');
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((err) => console.error('MongoDB connection error:', err));

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('Unhandled Promise Rejection:', err);
}); 

// For Vercel/Firebase
module.exports = app;
