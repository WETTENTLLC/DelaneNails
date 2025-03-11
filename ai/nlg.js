/**
 * Natural Language Generation module
 * Generates human-like responses based on intents and entities
 */
const fs = require('fs').promises;
const path = require('path');

class NLG {
  constructor() {
    this.templates = {};
    this.loadTemplates();
  }
  
  /**
   * Load response templates from files
   */
  async loadTemplates() {
    try {
      const templatesPath = path.join(__dirname, 'responses');
      const files = await fs.readdir(templatesPath);
      
      for (const file of files) {
        if (file.endsWith('.json')) {
          const content = await fs.readFile(path.join(templatesPath, file), 'utf-8');
          const intentName = file.replace('.json', '');
          this.templates[intentName] = JSON.parse(content);
        }
      }
      
      console.log(`Loaded ${Object.keys(this.templates).length} response template files`);
    } catch (error) {
      console.error('Error loading templates:', error);
      
      // Initialize with default templates if files don't exist
      this.templates = {
        greeting: {
          responses: [
            "Hello! I'm NailAide, how can I help you today?",
            "Hi there! Welcome to Delane Nails. What can I assist you with?",
            "Welcome! How may I help you with your nail care needs today?"
          ]
        },
        fallback: {
          responses: [
            "I'm not sure I understand. Could you rephrase that?",
            "I didn't quite catch that. Can you try again?",
            "I'm still learning. Could you please rephrase your question?"
          ]
        }
      };
    }
  }
  
  /**
   * Generate a response based on intent, entities, and context
   * @param {string} intent - The detected intent
   * @param {object} entities - Extracted entities
   * @param {object} context - User context
   * @returns {object} Response object
   */
  async generateResponse(intent, entities, context) {
    // Select templates for the given intent, or fallback
    const templateData = this.templates[intent] || this.templates['fallback'];
    
    if (!templateData || !templateData.responses || templateData.responses.length === 0) {
      return { 
        text: "I'm not sure how to respond to that.",
        intent: 'fallback'
      };
    }
    
    // Randomly select a response template
    const template = this._selectRandomTemplate(templateData.responses);
    
    // Fill in entity values
    const filledText = this._fillTemplate(template, entities, context);
    
    return {
      text: filledText,
      intent: intent
    };
  }
  
  /**
   * Select a random template from available templates
   * @param {Array} templates - Available templates
   * @returns {string} Selected template
   * @private
   */
  _selectRandomTemplate(templates) {
    const index = Math.floor(Math.random() * templates.length);
    return templates[index];
  }
  
  /**
   * Fill template with entity and context values
   * @param {string} template - Template string
   * @param {object} entities - Extracted entities
   * @param {object} context - User context
   * @returns {string} Filled template
   * @private
   */
  _fillTemplate(template, entities = {}, context = {}) {
    let result = template;
    
    // Replace entity placeholders
    if (entities) {
      for (const [key, value] of Object.entries(entities)) {
        const placeholder = new RegExp(`\\{${key}\\}`, 'g');
        result = result.replace(placeholder, value);
      }
    }
    
    // Replace context placeholders
    if (context) {
      for (const [key, value] of Object.entries(context)) {
        // Only replace simple string or number context values
        if (typeof value === 'string' || typeof value === 'number') {
          const placeholder = new RegExp(`\\{context.${key}\\}`, 'g');
          result = result.replace(placeholder, value);
        }
      }
    }
    
    // Remove any unfilled placeholders
    result = result.replace(/\{[^{}]*\}/g, '');
    
    return result;
  }
}

module.exports = new NLG();
