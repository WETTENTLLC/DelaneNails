const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../../app');
const agent = require('../../ai/agent');
const contextManager = require('../../ai/context');

// Mock the agent
jest.mock('../../ai/agent');

describe('AI API Endpoints', () => {
  let authToken;
  
  beforeAll(async () => {
    // Set up mocks
    agent.processMessage.mockImplementation((userId, message) => {
      return Promise.resolve({
        text: `Mock response to: ${message}`,
        intent: 'mock_intent',
        confidence: 0.95,
        actions: []
      });
    });
    
    // Log in to get auth token for protected routes
    const loginResponse = await request(app)
      .post('/api/v1/users/login')
      .send({
        email: 'test@example.com',
        password: 'password123'
      });
      
    authToken = loginResponse.body.token;
  });
  
  afterAll(async () => {
    // Close database connection if needed
    await mongoose.connection.close();
  });
  
  describe('POST /api/v1/ai/message', () => {
    test('Should process a message successfully', async () => {
      const response = await request(app)
        .post('/api/v1/ai/message')
        .send({ message: 'Hello' });
      
      expect(response.statusCode).toBe(200);
      expect(response.body.status).toBe('success');
      expect(response.body.data).toHaveProperty('text');
      expect(response.body.data).toHaveProperty('intent');
    });
    
    test('Should return 400 if message is missing', async () => {
      const response = await request(app)
        .post('/api/v1/ai/message')
        .send({});
      
      expect(response.statusCode).toBe(400);
      expect(response.body.status).toBe('fail');
    });
    
    test('Should handle errors in message processing', async () => {
      // Mock an error in the agent
      agent.processMessage.mockImplementationOnce(() => {
        throw new Error('Processing error');
      });
      
      const response = await request(app)
        .post('/api/v1/ai/message')
        .send({ message: 'Trigger error' });
      
      expect(response.statusCode).toBe(500);
    });
  });
  
  describe('GET /api/v1/ai/services', () => {
    test('Should return salon services', async () => {
      const response = await request(app)
        .get('/api/v1/ai/services');
      
      expect(response.statusCode).toBe(200);
      expect(response.body.status).toBe('success');
      expect(Array.isArray(response.body.data.services)).toBe(true);
      expect(response.body.data.services.length).toBeGreaterThan(0);
    });
  });
  
  describe('GET /api/v1/ai/conversation-history', () => {
    test('Should require authentication', async () => {
      const response = await request(app)
        .get('/api/v1/ai/conversation-history');
      
      expect(response.statusCode).toBe(401);
    });
    
    test('Should return conversation history for authenticated users', async () => {
      // Mock contextManager.getContext
      jest.spyOn(contextManager, 'getContext').mockImplementationOnce(() => {
        return {
          lastIntent: 'greeting',
          conversationHistory: [
            { role: 'user', message: 'Hello' },
            { role: 'bot', message: 'Hi there! How can I help you?' }
          ]
        };
      });
      
      const response = await request(app)
        .get('/api/v1/ai/conversation-history')
        .set('Authorization', `Bearer ${authToken}`);
      
      expect(response.statusCode).toBe(200);
      expect(response.body.status).toBe('success');
      expect(Array.isArray(response.body.data.conversationHistory)).toBe(true);
    });
  });
  
  describe('DELETE /api/v1/ai/conversation', () => {
    test('Should require authentication', async () => {
      const response = await request(app)
        .delete('/api/v1/ai/conversation');
      
      expect(response.statusCode).toBe(401);
    });
    
    test('Should clear conversation history for authenticated users', async () => {
      // Mock contextManager.clearContext
      jest.spyOn(contextManager, 'clearContext').mockImplementationOnce(() => true);
      
      const response = await request(app)
        .delete('/api/v1/ai/conversation')
        .set('Authorization', `Bearer ${authToken}`);
      
      expect(response.statusCode).toBe(204);
      expect(contextManager.clearContext).toHaveBeenCalled();
    });
  });
});
