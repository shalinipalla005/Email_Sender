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

// CORS Configuration - FIXED
const allowedOrigins = process.env.FRONTEND_URL 
  ? process.env.FRONTEND_URL.split(',').map(o => o.trim().replace(/\/+$/, ''))
  : ['http://localhost:3000', 'http://localhost:3001', 'https://localhost:3000']; // fallback for development

console.log(" FRONTEND_URL:", process.env.FRONTEND_URL);
console.log(" allowedOrigins:", allowedOrigins);

// CORS middleware - MUST come FIRST, before any other middleware
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps, Postman, etc.)
    if (!origin) {
      console.log('✅ Allowing request with no origin (Postman, mobile app, etc.)');
      return callback(null, true);
    }
    
    if (allowedOrigins.includes(origin)) {
      console.log('✅ CORS allowed for origin:', origin);
      callback(null, true);
    } else {
      console.log(' CORS blocked for origin:', origin);
      console.log(' Allowed origins:', allowedOrigins);
      callback(new Error(`Origin ${origin} not allowed by CORS policy`));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type', 
    'Authorization', 
    'X-Requested-With',
    'Accept',
    'Origin',
    'Cache-Control',
    'Pragma'
  ],
  optionsSuccessStatus: 200, // For legacy browser support
  maxAge: 86400 // Cache preflight for 24 hours
};

// Apply CORS middleware FIRST
app.use(cors(corsOptions));

// Handle preflight requests explicitly
app.options('*', cors(corsOptions));

// Body parser middleware - AFTER CORS
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logging middleware for debugging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  console.log(' Origin:', req.headers.origin || 'No origin');
  console.log(' User-Agent:', req.headers['user-agent'] ? req.headers['user-agent'].substring(0, 50) + '...' : 'No user-agent');
  next();
});

// Root route for testing
app.get('/', (req, res) => {
  res.json({ 
    success: true,
    message: 'Email Sender API is running!',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    corsEnabled: true,
    allowedOrigins: allowedOrigins,
    routes: [
      'POST /api/auth/signup',
      'POST /api/auth/login',
      'GET /api/auth/validate',
      'GET /api/templates',
      'POST /api/templates',
      'GET /api/data',
      'POST /api/data/upload',
      'GET /api/emails/configs',
      'POST /api/emails/create'
    ]
  });
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    success: true,
    status: 'OK', 
    timestamp: new Date().toISOString(),
    mongodb: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    cors: 'enabled',
    allowedOrigins: allowedOrigins
  });
});

// Test CORS endpoint
app.get('/test-cors', (req, res) => {
  res.json({
    success: true,
    message: 'CORS is working!',
    origin: req.headers.origin || 'No origin',
    method: req.method,
    timestamp: new Date().toISOString()
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/emails', emailRoutes);
app.use('/api/templates', templateRoutes);
app.use('/api/data', dataRoutes);

// 404 handler for undefined routes
app.use('*', (req, res) => {
  console.log(` 404 - Route not found: ${req.method} ${req.originalUrl}`);
  console.log(' Origin:', req.headers.origin || 'No origin');
  
  res.status(404).json({
    success: false,
    message: `Route ${req.method} ${req.originalUrl} not found`,
    timestamp: new Date().toISOString(),
    availableRoutes: [
      'GET /',
      'GET /health',
      'GET /test-cors',
      'POST /api/auth/signup',
      'POST /api/auth/login',
      'GET /api/auth/validate',
      'GET /api/templates',
      'POST /api/templates',
      'GET /api/data',
      'POST /api/data/upload',
      'GET /api/emails/configs',
      'POST /api/emails/create'
    ]
  });
});

// Global error handler - MUST come AFTER routes
app.use((error, req, res, next) => {
  console.error(' Global error handler triggered:', error.message);
  console.log(' Request origin:', req.headers.origin || 'No origin');
  console.log(' Request path:', req.path);
  console.log(' Request method:', req.method);
  
  // CORS error - this is the most important fix
  if (error.message && error.message.includes('not allowed by CORS')) {
    return res.status(403).json({
      success: false,
      error: 'CORS_ERROR',
      message: 'Cross-Origin Request Blocked',
      details: error.message,
      origin: req.headers.origin,
      allowedOrigins: allowedOrigins,
      help: 'Make sure your frontend domain is added to FRONTEND_URL environment variable'
    });
  }
  
  // Validation errors
  if (error.name === 'ValidationError') {
    return res.status(400).json({
      success: false,
      error: 'VALIDATION_ERROR',
      message: 'Validation failed',
      details: Object.values(error.errors).map(err => err.message)
    });
  }
  
  // JWT errors
  if (error.name === 'JsonWebTokenError') {
    return res.status(401).json({
      success: false,
      error: 'JWT_ERROR',
      message: 'Invalid authentication token'
    });
  }
  
  if (error.name === 'TokenExpiredError') {
    return res.status(401).json({
      success: false,
      error: 'JWT_EXPIRED',
      message: 'Authentication token has expired'
    });
  }
  
  // Mongoose errors
  if (error.name === 'MongoError' || error.name === 'MongooseError') {
    return res.status(500).json({
      success: false,
      error: 'DATABASE_ERROR',
      message: 'Database operation failed'
    });
  }
  
  // Default error response
  res.status(error.status || 500).json({
    success: false,
    error: 'INTERNAL_ERROR',
    message: error.message || 'Internal server error',
    timestamp: new Date().toISOString(),
    ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
  });
});

// Database connection
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => {
  console.log('✅ Connected to MongoDB');
  
  // Only start server if not in Vercel environment (Vercel handles this)
  if (process.env.NODE_ENV !== 'production' || !process.env.VERCEL) {
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
      console.log(` Server running on port ${PORT}`);
      console.log(` Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(` CORS enabled for: ${allowedOrigins.join(', ')}`);
      console.log(` Test your API at: http://localhost:${PORT}/health`);
      console.log(` Test CORS at: http://localhost:${PORT}/test-cors`);
    });
  }
})
.catch((err) => {
  console.error('❌ MongoDB connection error:', err);
  process.exit(1);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('❌ Unhandled Promise Rejection:', err);
  console.error('Stack trace:', err.stack);
  // Don't exit in production, just log
  if (process.env.NODE_ENV !== 'production') {
    process.exit(1);
  }
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error(' Uncaught Exception:', err);
  console.error('Stack trace:', err.stack);
  // Don't exit in production, just log
  if (process.env.NODE_ENV !== 'production') {
    process.exit(1);
  }
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log(' SIGTERM received, shutting down gracefully');
  mongoose.connection.close(() => {
    console.log('🔌 MongoDB connection closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log(' SIGINT received, shutting down gracefully');
  mongoose.connection.close(() => {
    console.log('🔌 MongoDB connection closed');
    process.exit(0);
  });
});

// For Vercel deployment
module.exports = app;