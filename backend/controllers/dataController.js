const Data = require('../models/Data');
const csv = require('papaparse');
const fs = require('fs');
const path = require('path');

// Get all data files for the user
const getFiles = async (req, res) => {
  try {
    const files = await Data.find({ createdBy: req.user._id })
      .sort({ createdAt: -1 })
      .select('-path'); // Don't send file path to client

    res.json(files);
  } catch (error) {
    console.error('Error fetching files:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch files',
      error: error.message
    });
  }
};

// Upload a new file
const uploadFile = async (req, res) => {
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

    // Create new data entry
    const data = new Data({
      name: req.file.filename,
      originalName: req.file.originalname,
      path: req.file.path,
      fields: results.meta.fields,
      rowCount: results.data.length,
      createdBy: req.user._id
    });

    await data.save();

    res.json({
      success: true,
      message: 'File uploaded successfully',
      data: {
        _id: data._id,
        name: data.originalName,
        fields: data.fields,
        rows: data.rowCount,
        preview: results.data.slice(0, 5)
      }
    });
  } catch (error) {
    if (req.file) {
      fs.unlinkSync(req.file.path);
    }
    console.error('Error uploading file:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to upload file',
      error: error.message
    });
  }
};

// Get file preview
const getPreview = async (req, res) => {
  try {
    const file = await Data.findOne({
      _id: req.params.fileId,
      createdBy: req.user._id
    });

    if (!file) {
      return res.status(404).json({
        success: false,
        message: 'File not found'
      });
    }

    if (!fs.existsSync(file.path)) {
      return res.status(404).json({
        success: false,
        message: 'File not found on disk'
      });
    }

    const fileContent = fs.readFileSync(file.path, 'utf-8');
    const results = csv.parse(fileContent, {
      header: true,
      skipEmptyLines: true
    });

    // Update last used timestamp
    file.lastUsed = new Date();
    file.useCount += 1;
    await file.save();

    res.json({
      success: true,
      data: {
        fields: results.meta.fields,
        preview: results.data.slice(0, 10),
        totalRows: results.data.length
      }
    });
  } catch (error) {
    console.error('Error getting file preview:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get file preview',
      error: error.message
    });
  }
};

// Delete a file
const deleteFile = async (req, res) => {
  try {
    const file = await Data.findOne({
      _id: req.params.fileId,
      createdBy: req.user._id
    });

    if (!file) {
      return res.status(404).json({
        success: false,
        message: 'File not found'
      });
    }

    // Delete file from disk if it exists
    if (fs.existsSync(file.path)) {
      fs.unlinkSync(file.path);
    }

    // Delete file record from database
    await file.deleteOne();

    res.json({
      success: true,
      message: 'File deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting file:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete file',
      error: error.message
    });
  }
};

// Get file data for email campaign
const getFileData = async (req, res) => {
  try {
    const file = await Data.findOne({
      _id: req.params.fileId,
      createdBy: req.user._id
    });

    if (!file) {
      return res.status(404).json({
        success: false,
        message: 'File not found'
      });
    }

    if (!fs.existsSync(file.path)) {
      return res.status(404).json({
        success: false,
        message: 'File not found on disk'
      });
    }

    const fileContent = fs.readFileSync(file.path, 'utf-8');
    const results = csv.parse(fileContent, {
      header: true,
      skipEmptyLines: true
    });

    // Update last used timestamp
    file.lastUsed = new Date();
    file.useCount += 1;
    await file.save();

    res.json({
      success: true,
      data: results.data
    });
  } catch (error) {
    console.error('Error getting file data:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get file data',
      error: error.message
    });
  }
};

module.exports = {
  getFiles,
  uploadFile,
  getPreview,
  deleteFile,
  getFileData
}; 