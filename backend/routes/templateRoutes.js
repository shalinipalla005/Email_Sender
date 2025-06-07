const express = require("express");
const {
  saveTemplate,
  getTemplates,
  deleteTemplate,
  updateTemplate,
  templatesByCategory,
  templateById,
} = require("../controllers/templateController");
const requireAuth = require("../middlewares/requireAuth");

const router = express.Router();

router.use(requireAuth)

// Save a new template
router.post("/", saveTemplate);

// Get all templates for the user
router.get("/", getTemplates);

// Get a specific template by ID
router.get("/:templateId", templateById);

// Update a template by ID
router.put("/:templateId", updateTemplate);

// Delete a template by ID
router.delete("/:templateId", deleteTemplate);

// Get templates by category (fixed route path)
router.get("/category/:category", templatesByCategory);

module.exports = router;
