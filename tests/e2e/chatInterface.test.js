/**
 * End-to-end tests for the chat interface
 * Note: This requires a browser environment (e.g., Jest with jsdom or Puppeteer)
 */
const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs').promises;
const { Server } = require('http');
const express = require('express');

// Define URLs
const BASE_URL = 'http://localhost:3333';
const CHAT_URL = `${BASE_URL}/chat`;

// Configure test server
let server;
let browser;
let page;

// Mock AI API response for testing
const mockApiHandler = (req, res) => {
  if (req.originalUrl.includes('/api/v1/ai/message') && req.method === 'POST') {
    const response = {
      status: 'success',
      data: {
        text: "I'm NailAide, your virtual assistant. How can I help you today?",
        intent: 'greeting',
        confidence: 0.95,
        actions: [
          {
            type: 'show_services_list',
            data: null
          }
        ]
      }
    };
    return res.json(response);
  }
  
  if (req.originalUrl.includes('/api/v1/ai/services') && req.method === 'GET') {
    const serviceData = require('../../data/services.json');
    return res.json({
      status: 'success',
      results: serviceData.services.length,
      data: { services: serviceData.services }
    });
  }
  
  // Default response for unhandled routes
  res.status(404).json({ status: 'error', message: 'Not found' });
};

// Setup and teardown
beforeAll(async () => {
  // Create a simple Express server with the necessary routes for testing
  const app = express();
  app.use(express.json());
  app.use(express.static(path.join(__dirname, '../../public')));
  
  // Mock API endpoints
  app.post('/api/v1/ai/message', mockApiHandler);
  app.get('/api/v1/ai/services', mockApiHandler);
  
  // Create test HTML page for the chat interface
  const testHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>NailAide Chat Test</title>
      <style>
        #chat-container { display: none; }
        #chat-container.open { display: block; }
      </style>
    </head>
    <body>
      <button id="chat-toggle">💅 Chat with NailAide</button>
      <div id="chat-container">
        <div id="chat-messages"></div>
        <form id="chat-input-form">
          <input type="text" id="chat-input" placeholder="Type your message...">
          <button id="chat-send" type="submit">Send</button>
        </form>
      </div>
      <script>
        // Utility functions for the chat interface tests
        function escapeHtml(unsafe) {
          return unsafe
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
        }
        
        function getCurrentTime() {
          const now = new Date();
          return now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        }
        
        function processMessageText(text) {
          // Simple link detection
          const urlRegex = /(https?:\\/\\/[^\\s]+)/g;
          const textWithLinks = text.replace(urlRegex, '<a href="$1" target="_blank">$1</a>');
          return textWithLinks;
        }
        
        function showTypingIndicator() {
          const typingEl = document.createElement('div');
          typingEl.className = 'typing-indicator';
          typingEl.innerHTML = '<span></span><span></span><span></span>';
          document.getElementById('chat-messages').appendChild(typingEl);
        }
        
        function hideTypingIndicator() {
          const typingEl = document.querySelector('.typing-indicator');
          if (typingEl) typingEl.remove();
        }
        
        function scrollToBottom() {
          const messagesContainer = document.getElementById('chat-messages');
          messagesContainer.scrollTop = messagesContainer.scrollHeight;
        }
        
        function formatDateForInput(date) {
          const d = new Date(date);
          return d.toISOString().split('T')[0];
        }
      </script>
      <script src="/js/chat.js"></script>
    </body>
    </html>
  `;
  
  // Serve the test HTML page
  app.get('/chat', (req, res) => {
    res.send(testHtml);
  });
  
  // Start the server
  server = new Server(app);
  await new Promise(resolve => {
    server.listen(3333, () => {
      console.log('Test server started on port 3333');
      resolve();
    });
  });
  
  // Launch browser
  browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  // Create page
  page = await browser.newPage();
});

afterAll(async () => {
  // Close browser and server
  if (browser) await browser.close();
  if (server) await new Promise(resolve => server.close(resolve));
});

// Tests
describe('Chat Interface', () => {
  test('Chat toggle button shows/hides the chat', async () => {
    await page.goto(CHAT_URL);
    
    // Check initial state
    const isVisible = await page.evaluate(() => {
      const container = document.getElementById('chat-container');
      return window.getComputedStyle(container).display !== 'none';
    });
    
    expect(isVisible).toBe(false);
    
    // Click toggle button
    await page.click('#chat-toggle');
    
    // Check if chat is now visible
    const isVisibleAfterToggle = await page.evaluate(() => {
      const container = document.getElementById('chat-container');
      return window.getComputedStyle(container).display !== 'none';
    });
    
    expect(isVisibleAfterToggle).toBe(true);
  });
  
  test('Can send a message and receive a response', async () => {
    await page.goto(CHAT_URL);
    
    // Open chat
    await page.click('#chat-toggle');
    
    // Type and send a message
    await page.type('#chat-input', 'Hello');
    await page.click('#chat-send');
    
    // Wait for response
    await page.waitForSelector('.bot-message', { timeout: 5000 });
    
    // Check that messages are displayed
    const messages = await page.evaluate(() => {
      const userMessages = Array.from(document.querySelectorAll('.user-message .message-content'))
        .map(msg => msg.textContent.trim());
      
      const botMessages = Array.from(document.querySelectorAll('.bot-message .message-content'))
        .map(msg => msg.textContent.trim());
      
      return { userMessages, botMessages };
    });
    
    expect(messages.userMessages).toContain('Hello');
    expect(messages.botMessages.length).toBeGreaterThan(0);
  });
  
  test('Action buttons are created and work', async () => {
    await page.goto(CHAT_URL);
    
    // Open chat
    await page.click('#chat-toggle');
    
    // Send a message that should trigger action buttons
    await page.type('#chat-input', 'What services do you offer?');
    await page.click('#chat-send');
    
    // Wait for response and action button
    await page.waitForSelector('.message-actions .action-button', { timeout: 5000 });
    
    // Check if action button exists and has correct text
    const buttonText = await page.evaluate(() => {
      const button = document.querySelector('.message-actions .action-button');
      return button ? button.textContent.trim() : null;
    });
    
    expect(buttonText).toBe('View Services');
    
    // Click the action button
    await page.click('.message-actions .action-button');
    
    // Wait for service list to be displayed
    await page.waitForFunction(() => {
      const messages = document.querySelectorAll('.bot-message .message-content');
      const lastMessage = messages[messages.length - 1];
      return lastMessage && lastMessage.textContent.includes('Our Services:');
    }, { timeout: 5000 });
    
    // Verify service list was displayed
    const serviceListDisplayed = await page.evaluate(() => {
      const messages = document.querySelectorAll('.bot-message .message-content');
      const lastMessage = messages[messages.length - 1];
      return lastMessage.textContent.includes('Our Services:');
    });
    
    expect(serviceListDisplayed).toBe(true);
  });
});
