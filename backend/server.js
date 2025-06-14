const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const listEndpoints = require('express-list-endpoints');

const authRoutes = require('./routes/auth');
const emailRoutes = require('./routes/emails');
const templateRoutes = require('./routes/templates');
const dataRoutes = require('./routes/data');

dotenv.config();

const app = express();

// CORS configuration
app.use(cors({
  origin: true, // Allow all origins (or replace with frontend URL in prod)
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  preflightContinue: false,
  optionsSuccessStatus: 204
}));

// Body parser middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/emails', emailRoutes);
app.use('/api/templates', templateRoutes);
app.use('/api/data', dataRoutes);

// Optional: API health check route
app.get('/api/status', (req, res) => {
  res.status(200).json({ success: true, message: 'API is running' });
});

// Options handling for CORS preflight
app.options('*', cors());

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ success: false, message: 'Something went wrong!', error: err.message });
});

// Log all available endpoints
console.log('📋 Listing all available endpoints:');
console.table(listEndpoints(app));

// Database connection
mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('✅ Connected to MongoDB');
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  })
  .catch((err) => console.error('❌ MongoDB connection error:', err));

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('Unhandled Promise Rejection:', err);
});