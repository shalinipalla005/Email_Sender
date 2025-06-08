const express = require('express');
const router = express.Router();
const multer = require('multer');
const auth = require('../middleware/auth');
const fs = require('fs');
const path = require('path');
const { getFiles, uploadFile, getPreview, deleteFile, getFileData } = require('../controllers/dataController');

// Configure multer for file upload
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = 'uploads';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir);
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'text/csv') {
      cb(null, true);
    } else {
      cb(new Error('Only CSV files are allowed'));
    }
  }
});

// Get all files
router.get('/', auth, getFiles);

// Upload file
router.post('/upload', auth, upload.single('file'), uploadFile);

// Get file preview
router.get('/:fileId/preview', auth, getPreview);

// Get file data for email campaign
router.get('/:fileId/data', auth, getFileData);

// Delete file
router.delete('/:fileId', auth, deleteFile);

module.exports = router; 