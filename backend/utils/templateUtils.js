/**
 * Template utility functions for email processing
 */

/**
 * Extracts template variables from a string template
 * Looks for patterns like {{variableName}} and returns unique variable names
 * @param {string} template - The template string to extract variables from
 * @returns {string[]} - Array of unique variable names found in the template
 */
const extractVariablesFromTemplate = (template) => {
    if (!template || typeof template !== 'string') {
        return [];
    }
    
    // Regular expression to match {{variableName}} patterns
    const regex = /\{\{([^}]+)\}\}/g;
    const variables = [];
    let match;
    
    // Extract all matches and collect unique variable names
    while ((match = regex.exec(template)) !== null) {
        const variableName = match[1].trim();
        if (variableName && !variables.includes(variableName)) {
            variables.push(variableName);
        }
    }
    
    return variables;
};

/**
 * Populates a template string with provided data
 * Replaces {{variableName}} patterns with corresponding values from data object
 * @param {string} template - The template string to populate
 * @param {Object} data - Object containing key-value pairs for replacement
 * @returns {string} - The populated template string
 */
const populateTemplate = (template, data) => {
    if (!template || typeof template !== 'string') {
        return template;
    }
    
    let populatedTemplate = template;
    
    // Replace each variable in the template with corresponding data value
    for (const [key, value] of Object.entries(data)) {
        const regex = new RegExp(`\\{\\{${key}\\}\\}`, 'g');
        populatedTemplate = populatedTemplate.replace(regex, value || '');
    }
    
    return populatedTemplate;
};

/**
 * Validates if all required template variables have corresponding data
 * @param {string} template - The template string to validate
 * @param {Object} data - Object containing available data
 * @returns {Object} - Validation result with missing variables and status
 */
const validateTemplateData = (template, data) => {
    const requiredVariables = extractVariablesFromTemplate(template);
    const availableKeys = Object.keys(data || {});
    
    const missingVariables = requiredVariables.filter(variable => 
        !availableKeys.includes(variable)
    );
    
    return {
        isValid: missingVariables.length === 0,
        requiredVariables,
        missingVariables,
        availableKeys
    };
};

module.exports = {
    extractVariablesFromTemplate,
    populateTemplate,
    validateTemplateData
};