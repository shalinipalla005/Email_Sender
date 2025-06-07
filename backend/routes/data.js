const express = require('express');
const router = express.Router();
const multer = require('multer');
const csv = require('papaparse');
const auth = require('../middleware/auth');
const fs = require('fs');
const path = require('path');

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

// Upload file
router.post('/upload', auth, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }

    const fileContent = fs.readFileSync(req.file.path, 'utf-8');
    const results = csv.parse(fileContent, {
      header: true,
      skipEmptyLines: true
    });

    // Validate required fields
    const hasEmailField = results.meta.fields.includes('email');
    const hasNameField = results.meta.fields.includes('name');

    if (!hasEmailField || !hasNameField) {
      fs.unlinkSync(req.file.path);
      return res.status(400).json({
        success: false,
        message: 'CSV must contain "email" and "name" columns'
      });
    }

    res.json({
      success: true,
      message: 'File uploaded successfully',
      data: {
        fields: results.meta.fields,
        preview: results.data.slice(0, 5),
        totalRows: results.data.length,
        fileName: req.file.filename
      }
    });
  } catch (error) {
    if (req.file) {
      fs.unlinkSync(req.file.path);
    }
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Get file preview
router.get('/:filename/preview', auth, (req, res) => {
  try {
    const filePath = path.join('uploads', req.params.filename);
    
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        success: false,
        message: 'File not found'
      });
    }

    const fileContent = fs.readFileSync(filePath, 'utf-8');
    const results = csv.parse(fileContent, {
      header: true,
      skipEmptyLines: true
    });

    res.json({
      success: true,
      data: {
        fields: results.meta.fields,
        preview: results.data.slice(0, 10),
        totalRows: results.data.length
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Delete file
router.delete('/:filename', auth, (req, res) => {
  try {
    const filePath = path.join('uploads', req.params.filename);
    
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        success: false,
        message: 'File not found'
      });
    }

    fs.unlinkSync(filePath);
    res.json({
      success: true,
      message: 'File deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

module.exports = router; 