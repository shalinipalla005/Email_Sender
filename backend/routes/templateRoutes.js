import express from "express";
import {
  saveTemplate,
  getTemplates,
  deleteTemplate,
  updateTemplate,
  templatesByCategory,
  templateById
} from "../controllers/templateController.js";

const router = express.Router();

// Save a new template
router.post("/api/templates", saveTemplate);

// Get all templates for the user
router.get("/api/templates", getTemplates);

// Get a specific template by ID
router.get("/api/templates/:templateId", templateById);

// Delete a template by ID
router.delete("/api/templates/:templateId", deleteTemplate);

// Update a template by ID
router.put("/api/templates/:templateId", updateTemplate);

//Get templates by category
router.get("/api/templates/category:category", templatesByCategory);

export default router;