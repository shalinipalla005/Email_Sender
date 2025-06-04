import templates from "../models/templates";

export const saveTemplate = async (request, response) =>{
    try{
        const {templateName, category, description, content } = request.body;
        const userId = request.user._id; // Assuming user ID is stored in request.user
        if (!templateName || !category || !description || !content) {
            return response.status(400).json({ message: "All fields are required" });
        }
        const newTemplate = new templates({
            templateName,
            category,
            description,
            content,
            createdBy: userId
        });
        const savedTemplate = await newTemplate.save();
    }
    catch (error) {
        console.error("Error saving template:", error);
        return response.status(500).json({ message: "Internal server error" });
    }
}

export const getTemplates = async (request, response) => {
    try {
        const userId = request.user._id; // Assuming user ID is stored in request.user
        const templates = await templates.find({ createdBy: userId }).populate("createdBy", "name email");
        return response.status(200).json(templates);
    } catch (error) {
        console.error("Error fetching templates:", error);
        return response.status(500).json({ message: "Internal server error" });
    }
}

export const templateById = async (request, response) => {
    try {
        const { templateId } = request.params;
        const userId = request.user._id; // Assuming user ID is stored in request.user
        const template = await templates.findOne({ _id: templateId, createdBy: userId }).populate("createdBy", "name email");
        if (!template) {
            return response.status(404).json({ message: "Template not found" });
        }
        return response.status(200).json(template);
    } catch (error) {
        console.error("Error fetching template by ID:", error);
        return response.status(500).json({ message: "Internal server error" });
    }
}

export const templatesByCategory = async (request, response) => {
    try {
        const { category } = request.params;
        const userId = request.user._id; // Assuming user ID is stored in request.user
        const templatesByCategory = await templates.find({ category, createdBy: userId }).populate("createdBy", "name email");
        if (templatesByCategory.length === 0) {
            return response.status(404).json({ message: "No templates found for this category" });
        }
        return response.status(200).json(templatesByCategory);
    } catch (error) {
        console.error("Error fetching templates by category:", error);
        return response.status(500).json({ message: "Internal server error" });
    }
}

export const deleteTemplate = async (request, response) => {
    try {
        const { templateId } = request.params;
        const userId = request.user._id; // Assuming user ID is stored in request.user
        const deletedTemplate = await templates.findOneAndDelete({ _id: templateId, createdBy: userId });
        if (!deletedTemplate) {
            return response.status(404).json({ message: "Template not found" });
        }
        return response.status(200).json({ message: "Template deleted successfully" });
    } catch (error) {
        console.error("Error deleting template:", error);
        return response.status(500).json({ message: "Internal server error" });
    }
}

export const updateTemplate = async (request, response) => {
    try {
        const { templateId } = request.params;
        const { templateName, category, description, content } = request.body;
        const userId = request.user._id; // Assuming user ID is stored in request.user

        if (!templateName || !category || !description || !content) {
            return response.status(400).json({ message: "All fields are required" });
        }

        const updatedTemplate = await templates.findOneAndUpdate(
            { _id: templateId, createdBy: userId },
            { templateName, category, description, content, updatedAt: Date.now() },
            { new: true }
        );

        if (!updatedTemplate) {
            return response.status(404).json({ message: "Template not found" });
        }

        return response.status(200).json(updatedTemplate);
    } catch (error) {
        console.error("Error updating template:", error);
        return response.status(500).json({ message: "Internal server error" });
    }
}