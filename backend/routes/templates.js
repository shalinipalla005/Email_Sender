const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const auth = require('../middleware/auth');
const Template = require('../models/Template');

// Validate template creation/update
const validateTemplate = [
  body('templateName').trim().notEmpty().withMessage('Template name is required'),
  body('category')
    .isIn(['General', 'Business', 'Personal'])
    .withMessage('Invalid category'),
  body('description').notEmpty().withMessage('Description is required'),
  body('subject').notEmpty().withMessage('Subject is required'),
  body('content').notEmpty().withMessage('Content is required')
];

// Create template
router.post('/', auth, validateTemplate, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const template = new Template({
      ...req.body,
      createdBy: req.user._id
    });

    await template.save();

    res.status(201).json({
      success: true,
      message: 'Template saved successfully',
      data: template
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get all templates
router.get('/', auth, async (req, res) => {
  try {
    const templates = await Template.find({ createdBy: req.user._id })
      .populate('createdBy', 'userName email');

    res.json({
      success: true,
      data: templates
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get template by ID
router.get('/:templateId', auth, async (req, res) => {
  try {
    const template = await Template.findOne({
      _id: req.params.templateId,
      createdBy: req.user._id
    });

    if (!template) {
      return res.status(404).json({
        success: false,
        message: 'Template not found'
      });
    }

    res.json({
      success: true,
      data: template
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Update template
router.put('/:templateId', auth, validateTemplate, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const template = await Template.findOne({
      _id: req.params.templateId,
      createdBy: req.user._id
    });

    if (!template) {
      return res.status(404).json({
        success: false,
        message: 'Template not found'
      });
    }

    Object.assign(template, req.body);
    await template.save();

    res.json({
      success: true,
      message: 'Template updated successfully',
      data: template
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Delete template
router.delete('/:templateId', auth, async (req, res) => {
  try {
    const template = await Template.findOneAndDelete({
      _id: req.params.templateId,
      createdBy: req.user._id
    });

    if (!template) {
      return res.status(404).json({
        success: false,
        message: 'Template not found'
      });
    }

    res.json({
      success: true,
      message: 'Template deleted successfully'
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get templates by category
router.get('/category/:category', auth, async (req, res) => {
  try {
    const { category } = req.params;
    
    if (!['General', 'Business', 'Personal'].includes(category)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid category'
      });
    }

    const templates = await Template.find({
      createdBy: req.user._id,
      category
    }).populate('createdBy', 'userName email');

    res.json({
      success: true,
      data: templates
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router; 