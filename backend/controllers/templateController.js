const Templates = require("../models/templates");

// Save a new template
const saveTemplate = async (req, res) => {
  try {
    const { templateName, category, description, subject,  content } = req.body;
    const userId = req.user._id; // Assuming auth middleware sets this

    if (!templateName || !category || !description || !content) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    const newTemplate = new Templates({
      templateName,
      category,
      description,
      subject,
      content,
      createdBy: userId,
    });

    const savedTemplate = await newTemplate.save();

    return res.status(201).json({
      success: true,
      message: "Template saved successfully",
      data: savedTemplate,
    });
  } catch (error) {
    console.error("Error saving template:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to save template",
      error: error.message,
    });
  }
};

// Get all templates for the logged-in user
const getTemplates = async (req, res) => {
  try {
    const userId = req.user._id;

    const templates = await Templates.find({ createdBy: userId }).populate("createdBy", "name email");

    return res.status(200).json({
      success: true,
      data: templates,
    });
  } catch (error) {
    console.error("Error fetching templates:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch templates",
      error: error.message,
    });
  }
};

// Get one template by ID
const templateById = async (req, res) => {
  try {
    const { templateId } = req.params;
    const userId = req.user._id;

    const template = await Templates.findOne({ _id: templateId, createdBy: userId }).populate("createdBy", "name email");

    if (!template) {
      return res.status(404).json({
        success: false,
        message: "Template not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: template,
    });
  } catch (error) {
    console.error("Error fetching template by ID:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch template",
      error: error.message,
    });
  }
};

// Get all templates by category
const templatesByCategory = async (req, res) => {
  try {
    const { category } = req.params;
    const userId = req.user._id;

    const templates = await Templates.find({ category, createdBy: userId }).populate("createdBy", "name email");

    if (templates.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No templates found in this category",
      });
    }

    return res.status(200).json({
      success: true,
      data: templates,
    });
  } catch (error) {
    console.error("Error fetching templates by category:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch templates by category",
      error: error.message,
    });
  }
};

// Delete template by ID
const deleteTemplate = async (req, res) => {
  try {
    const { templateId } = req.params;
    const userId = req.user._id;

    const deleted = await Templates.findOneAndDelete({ _id: templateId, createdBy: userId });

    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: "Template not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Template deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting template:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to delete template",
      error: error.message,
    });
  }
};

// Update existing template
const updateTemplate = async (req, res) => {
  try {
    const { templateId } = req.params;
    const { templateName, category, description, subject, content } = req.body;
    const userId = req.user._id;

    if (!templateName || !category || !description || !subject || !content) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    const updated = await Templates.findOneAndUpdate(
      { _id: templateId, createdBy: userId },
      { templateName, category, description, subject, content, updatedAt: Date.now() },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({
        success: false,
        message: "Template not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Template updated successfully",
      data: updated,
    });
  } catch (error) {
    console.error("Error updating template:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update template",
      error: error.message,
    });
  }
};

module.exports = {
  saveTemplate,
  getTemplates,
  templateById,
  templatesByCategory,
  deleteTemplate,
  updateTemplate,
};
