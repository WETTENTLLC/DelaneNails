/**
 * NailAide AI Agent - Main agent file that processes user inputs and returns responses
 */
const nlu = require('./nlu');
const nlg = require('./nlg');
const contextManager = require('./context');
const { detectIntent } = require('./intents/intentDetector');
const { findEntity } = require('./entityExtraction');
const serviceData = require('../data/services.json');
const { generateCompletion } = require('./models/openaiHandler');

class NailAideAgent {
  /**
   * Process a user message and generate a response
   * @param {string} userId - Unique identifier for the user
   * @param {string} message - The user's message
   * @param {object} sessionData - Current session data
   * @returns {object} Response object with text and actions
   */
  async processMessage(userId, message, sessionData = {}) {
    try {
      // Get or create user context
      const context = await contextManager.getContext(userId) || {};
      
      // Process the message to understand intent
      const processedInput = nlu.processInput(message);
      
      // Detect intent from the processed input
      const intent = await detectIntent(processedInput, context);
      
      // Extract relevant entities
      const entities = findEntity(processedInput, intent);
      
      // Update context with new information
      const updatedContext = contextManager.updateContext(userId, {
        ...context,
        lastIntent: intent.name,
        entities: { ...(context.entities || {}), ...entities },
        lastMessage: message
      });
      
      // Get response based on intent, entities, and context
      let response;
      
      // If we need a generated response for complex queries
      if (intent.name === 'general_question' || intent.confidence < 0.6) {
        // Use AI model to generate a response
        const aiResponse = await this._generateAIResponse(message, updatedContext);
        response = { text: aiResponse, intent: intent.name };
      } else {
        // Use template-based response
        response = await nlg.generateResponse(intent.name, entities, updatedContext);
      }
      
      // Add any necessary actions based on intent
      const actions = this._getActions(intent.name, entities, updatedContext);
      
      return {
        text: response.text,
        intent: intent.name,
        confidence: intent.confidence,
        actions
      };
    } catch (error) {
      console.error('Error processing message:', error);
      return {
        text: "I'm sorry, I'm having trouble understanding right now. Can you try again?",
        intent: 'error',
        error: error.message
      };
    }
  }
  
  /**
   * Generate a response using AI model
   * @param {string} message - User message
   * @param {object} context - User context
   * @returns {string} AI-generated response
   * @private
   */
  async _generateAIResponse(message, context) {
    try {
      const serviceNames = serviceData.services.map(s => s.name).join(', ');
      const prompt = `You are NailAide, a helpful assistant for a nail salon called Delane Nails. 
The salon offers these services: ${serviceNames}.
Current conversation context: ${JSON.stringify(context, null, 2)}
User says: ${message}
Respond in a friendly, helpful way. Keep responses concise but informative.`;
      
      const response = await generateCompletion(prompt, {
        maxTokens: 150,
        temperature: 0.7
      });
      
      return response;
    } catch (error) {
      console.error('Error generating AI response:', error);
      return "I'm sorry, I couldn't process that request. Can I help you with something else?";
    }
  }
  
  /**
   * Determine appropriate actions based on intent
   * @param {string} intent - Detected intent
   * @param {object} entities - Extracted entities
   * @param {object} context - User context
   * @returns {Array} List of actions to take
   * @private
   */
  _getActions(intent, entities, context) {
    const actions = [];
    
    switch(intent) {
      case 'book_appointment':
        actions.push({
          type: 'show_booking_form',
          data: { 
            prefilledService: entities.service,
            suggestedDate: entities.date || context.preferredDate
          }
        });
        break;
        
      case 'service_inquiry':
        if (entities.service) {
          const serviceInfo = serviceData.services.find(
            s => s.name.toLowerCase() === entities.service.toLowerCase()
          );
          
          if (serviceInfo) {
            actions.push({
              type: 'show_service_details',
              data: serviceInfo
            });
          }
        } else {
          actions.push({
            type: 'show_services_list',
            data: null
          });
        }
        break;
        
      case 'check_availability':
        actions.push({
          type: 'show_availability',
          data: {
            date: entities.date,
            service: entities.service
          }
        });
        break;
    }
    
    return actions;
  }
}

module.exports = new NailAideAgent();
