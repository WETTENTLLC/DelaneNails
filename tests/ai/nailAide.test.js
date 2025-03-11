const agent = require('../../ai/agent');
const nlu = require('../../ai/nlu');
const { detectIntent } = require('../../ai/intents/intentDetector');
const contextManager = require('../../ai/context');
const { findEntity } = require('../../ai/entityExtraction');

// Mock external dependencies
jest.mock('../../ai/models/openaiHandler', () => ({
  generateCompletion: jest.fn().mockResolvedValue('This is a mock AI response')
}));

describe('NailAide AI System', () => {
  // Clear context store between tests
  beforeEach(() => {
    // Clear any stored contexts
    const contexts = contextManager.getStats().totalContexts;
    if (contexts > 0) {
      // Get all contexts and clear them
      for (const userId of Array.from({ length: contexts }, (_, i) => `test-user-${i}`)) {
        contextManager.clearContext(userId);
      }
    }
  });
  
  describe('Natural Language Understanding', () => {
    test('Processes input correctly', () => {
      const result = nlu.processInput('I want to book a gel manicure appointment');
      
      expect(result).toHaveProperty('original');
      expect(result).toHaveProperty('tokens');
      expect(result).toHaveProperty('stems');
      expect(result).toHaveProperty('normalized');
      expect(result.tokens.length).toBeGreaterThan(0);
      expect(result.stems.length).toBeGreaterThan(0);
    });
    
    test('Handles empty inputs', () => {
      const result = nlu.processInput('');
      expect(result.tokens).toEqual([]);
      expect(result.normalized).toBe('');
    });
    
    test('Extracts dates correctly', () => {
      const dates = nlu.extractDates('I want an appointment on October 15th, 2023');
      expect(dates.length).toBeGreaterThan(0);
      expect(dates[0]).toContain('October 15');
    });
  });
  
  describe('Intent Detection', () => {
    test('Detects greeting intent', async () => {
      const processedInput = nlu.processInput('hello there');
      const intent = await detectIntent(processedInput);
      
      expect(intent.name).toBe('greeting');
      expect(intent.confidence).toBeGreaterThan(0.6);
    });
    
    test('Detects booking intent', async () => {
      const processedInput = nlu.processInput('I want to book an appointment for a manicure');
      const intent = await detectIntent(processedInput);
      
      expect(intent.name).toBe('book_appointment');
      expect(intent.confidence).toBeGreaterThan(0.6);
    });
    
    test('Returns fallback for unclear intents', async () => {
      const processedInput = nlu.processInput('xyz123 random text');
      const intent = await detectIntent(processedInput);
      
      expect(intent.name).toBe('fallback');
    });
  });
  
  describe('Entity Extraction', () => {
    test('Extracts service entities', () => {
      const processedInput = nlu.processInput('I want a gel manicure');
      const intent = { name: 'book_appointment', confidence: 0.9 };
      
      const entities = findEntity(processedInput, intent);
      
      expect(entities).toHaveProperty('service');
      expect(entities.service).toBe('Gel Manicure');
    });
    
    test('Extracts date entities', () => {
      const processedInput = nlu.processInput('Book me for tomorrow at 2pm');
      const intent = { name: 'book_appointment', confidence: 0.9 };
      
      const entities = findEntity(processedInput, intent);
      
      expect(entities).toHaveProperty('date');
      // Can't test exact value as it depends on the current date
    });
  });
  
  describe('Context Management', () => {
    test('Stores and retrieves context', () => {
      const userId = 'test-user-1';
      const contextData = { 
        lastIntent: 'greeting',
        preferredService: 'Gel Manicure'
      };
      
      contextManager.updateContext(userId, contextData);
      const retrievedContext = contextManager.getContext(userId);
      
      expect(retrievedContext).toHaveProperty('lastIntent', 'greeting');
      expect(retrievedContext).toHaveProperty('preferredService', 'Gel Manicure');
      expect(retrievedContext).toHaveProperty('lastUpdated');
    });
    
    test('Clears context correctly', () => {
      const userId = 'test-user-2';
      contextManager.updateContext(userId, { test: 'data' });
      
      expect(contextManager.getContext(userId)).not.toBeNull();
      
      contextManager.clearContext(userId);
      
      expect(contextManager.getContext(userId)).toBeNull();
    });
  });
  
  describe('Agent Message Processing', () => {
    test('Processes messages and returns appropriate response', async () => {
      const userId = 'test-user-3';
      const userMessage = 'Hello, I want to book a manicure';
      
      const response = await agent.processMessage(userId, userMessage);
      
      expect(response).toHaveProperty('text');
      expect(response).toHaveProperty('intent');
      expect(response).toHaveProperty('confidence');
      expect(response).toHaveProperty('actions');
      
      expect(response.text.length).toBeGreaterThan(0);
      expect(['greeting', 'book_appointment']).toContain(response.intent);
    });
    
    test('Handles empty messages', async () => {
      const userId = 'test-user-4';
      const userMessage = '';
      
      const response = await agent.processMessage(userId, userMessage);
      
      expect(response).toHaveProperty('text');
      expect(response).toHaveProperty('intent', 'error');
    });
    
    test('Maintains conversation context between messages', async () => {
      const userId = 'test-user-5';
      
      // First message establishes context
      await agent.processMessage(userId, 'I want to book a gel manicure');
      
      // Second message should use the context from the first message
      const response = await agent.processMessage(userId, 'What time do you have available?');
      
      const context = contextManager.getContext(userId);
      
      expect(context.entities).toHaveProperty('service', 'Gel Manicure');
      expect(response.actions.some(a => a.type === 'show_booking_form' || 
                                    a.type === 'show_availability')).toBeTruthy();
    });
  });
});
