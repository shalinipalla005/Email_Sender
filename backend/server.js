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

const corsOptions = {
  origin: (origin, cb) => {
    if (!origin) return cb(null, true);
    return allowedOrigins.includes(origin)
      ? cb(null, true)
      : cb(new Error(`Origin ${origin} not allowed by CORS`));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  optionsSuccessStatus: 204
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions)); // preflight

// Separate CORS errors
app.use((err, req, res, next) => {
  if (err.message && err.message.includes('not allowed by CORS')) {
    return res.status(403).json({ success: false, message: err.message });
  }
  console.error(err.stack);
  res.status(500).json({ success: false, message: 'Something went wrong!', error: err.message });
});


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
