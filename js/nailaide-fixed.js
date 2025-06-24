/**
 * NailAide Chat Widget - Fixed Version with Better Error Handling
 */

(function() {
  'use strict';

  // Configuration with validation
  const CONFIG = {
    GEMINI_API_KEY: 'AIzaSyCr913ppyEgYL0k47gLye1YTiL9lD1SH_0',
    GEMINI_API_URL: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent',
    MAX_RETRIES: 3,
    RETRY_DELAY: 1000
  };

  class NailAideWidget {
    constructor() {
      this.isOpen = false;
      this.container = null;
      this.messagesContainer = null;
      this.inputField = null;
      this.siteInfo = null;
      this.retryCount = 0;
      this.init();
    }

    async init() {
      console.log('🚀 Initializing NailAide widget...');
      
      // Validate API key
      if (!this.validateApiKey()) {
        console.error('❌ Invalid API key format');
        return;
      }

      await this.loadSiteInfo();
      this.createWidget();
      this.attachEventListeners();
      
      // Test API connection on startup
      await this.testApiConnection();
      
      console.log('✅ NailAide widget initialized successfully');
    }

    validateApiKey() {
      const key = CONFIG.GEMINI_API_KEY;
      return key && key.startsWith('AIzaSy') && key.length === 39;
    }

    async loadSiteInfo() {
      if (window.WebsiteContent) {
        try {
          this.siteInfo = window.WebsiteContent.getContent();
          console.log('✅ Website content loaded:', this.siteInfo);
        } catch (error) {
          console.error('❌ Error loading website content:', error);
        }
      } else {
        console.warn('⚠️ WebsiteContent not available, using defaults');
      }
    }

    async testApiConnection() {
      console.log('🔗 Testing Gemini API connection...');
      
      try {
        const testResponse = await this.makeApiRequest('Hello, please respond with "API working"');
        console.log('✅ API test successful:', testResponse);
        return true;
      } catch (error) {
        console.error('❌ API test failed:', error);
        return false;
      }
    }

    createWidget() {
      // Create chat button
      const chatButton = document.createElement('div');
      chatButton.className = 'nailaide-chat-button';
      chatButton.innerHTML = '💬';
      chatButton.onclick = () => this.toggle();
      
      // Create chat container
      this.container = document.createElement('div');
      this.container.className = 'nailaide-container';
      this.container.style.display = 'none';
      this.container.innerHTML = `
        <div class="nailaide-header">
          <h3>Nail Care Assistant</h3>
          <button class="nailaide-close" onclick="window.NailAide.toggle()">×</button>
        </div>
        <div class="nailaide-messages"></div>
        <div class="nailaide-input-container">
          <textarea placeholder="Ask about our services, hours, or booking..." rows="2"></textarea>
          <button class="nailaide-send">Send</button>
        </div>
      `;

      this.messagesContainer = this.container.querySelector('.nailaide-messages');
      this.inputField = this.container.querySelector('textarea');
      
      document.body.appendChild(chatButton);
      document.body.appendChild(this.container);
      
      this.addWelcomeMessage();
    }

    addWelcomeMessage() {
      this.addMessage('assistant', 'Hello! I\'m your nail care assistant powered by AI. I can help you with information about our services, pricing, hours, and booking appointments. How can I help you today?');
    }

    attachEventListeners() {
      const sendButton = this.container.querySelector('.nailaide-send');
      sendButton.onclick = () => this.sendMessage();
      
      this.inputField.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
          e.preventDefault();
          this.sendMessage();
        }
      });
    }

    toggle() {
      this.isOpen = !this.isOpen;
      this.container.style.display = this.isOpen ? 'flex' : 'none';
      
      if (this.isOpen) {
        this.inputField.focus();
      }
    }

    async sendMessage() {
      const message = this.inputField.value.trim();
      if (!message) return;

      this.addMessage('user', message);
      this.inputField.value = '';
      
      // Show typing indicator
      this.addMessage('assistant', 'Typing...', true);
      
      try {
        const response = await this.getResponse(message);
        this.removeTypingIndicator();
        this.addMessage('assistant', response);
        this.retryCount = 0; // Reset retry count on success
      } catch (error) {
        console.error('❌ Chat error:', error);
        this.removeTypingIndicator();
        this.handleError(message, error);
      }
    }

    async getResponse(userMessage) {
      console.log('💬 Processing message:', userMessage);
      
      try {
        // Try Gemini API first
        const response = await this.makeApiRequest(userMessage);
        console.log('✅ Gemini response received');
        return response;
      } catch (error) {
        console.error('❌ Gemini API failed:', error);
        
        // Retry logic
        if (this.retryCount < CONFIG.MAX_RETRIES) {
          this.retryCount++;
          console.log(`🔄 Retrying... (${this.retryCount}/${CONFIG.MAX_RETRIES})`);
          
          await this.delay(CONFIG.RETRY_DELAY);
          return this.getResponse(userMessage);
        }
        
        throw error;
      }
    }

    async makeApiRequest(userMessage) {
      const systemPrompt = this.buildSystemPrompt();
      
      const requestBody = {
        contents: [{
          parts: [{
            text: `${systemPrompt}\\n\\nUser question: ${userMessage}`
          }]
        }],
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 1024,
        }
      };

      console.log('📤 Sending API request...');
      
      const response = await fetch(`${CONFIG.GEMINI_API_URL}?key=${CONFIG.GEMINI_API_KEY}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
      });

      console.log('📥 API response status:', response.status);

      if (!response.ok) {
        const errorData = await response.text();
        console.error('❌ API error details:', errorData);
        throw new Error(`API request failed: ${response.status} - ${errorData}`);
      }

      const data = await response.json();
      console.log('📋 API response data:', data);

      if (!data.candidates || !data.candidates[0] || !data.candidates[0].content) {
        throw new Error('Invalid API response structure');
      }

      return data.candidates[0].content.parts[0].text;
    }

    buildSystemPrompt() {
      const business = this.siteInfo?.business || {};
      const services = this.siteInfo?.services || [];
      
      return `You are a helpful assistant for Delane's Natural Nail Care & Medi-Spa. Here's our current information:

BUSINESS INFO:
- Name: ${business.name || "Delane's Natural Nail Care & Medi-Spa"}
- Address: ${business.address || "333 Estudillo Ave, Suite 204, San Leandro, CA 94577"}
- Phone: ${business.phone || "(510) 346-2457"}
- Email: ${business.email || "delane@delanesnails.com"}

HOURS:
- Wednesday-Friday: 11:00 AM - 7:00 PM
- Saturday: 9:00 AM - 3:00 PM  
- Tuesday: Mobile & At-Home Visits Only
- Sunday-Monday: Closed

BOOKING: ${business.bookingUrl || "https://booksy.com/en-us/195354_delane-s-natural-nail-care_nail-salon_101290_san-leandro#ba_s=seo"}

POPULAR SERVICES:
${services.map(s => `- ${s.title}: ${s.price} (${s.duration || 'varies'})`).join('\\n')}

IMPORTANT: 
- Always provide the Booksy booking link when customers ask about appointments
- Tuesday is ONLY for mobile and at-home visits
- We specialize in natural nail care and have 4.9 stars on Yelp
- Be helpful, friendly, and professional
- Keep responses concise but informative
- If asked about booking, always include the Booksy link`;
    }

    handleError(message, error) {
      let errorMessage = `I apologize, but I'm experiencing technical difficulties. Here's how you can still get help:\\n\\n`;
      errorMessage += `📞 Call us: (510) 346-2457\\n`;
      errorMessage += `🌐 Book online: https://booksy.com/en-us/195354_delane-s-natural-nail-care_nail-salon_101290_san-leandro#ba_s=seo\\n`;
      errorMessage += `📧 Email: delane@delanesnails.com\\n\\n`;
      errorMessage += `Hours: Wed-Fri 11AM-7PM, Sat 9AM-3PM, Tue (Mobile only)`;
      
      this.addMessage('assistant', errorMessage);
    }

    addMessage(sender, text, isTyping = false) {
      const messageDiv = document.createElement('div');
      messageDiv.className = `nailaide-message nailaide-${sender}`;
      if (isTyping) messageDiv.classList.add('typing');
      
      // Handle line breaks in text
      messageDiv.innerHTML = text.replace(/\\n/g, '<br>');
      
      this.messagesContainer.appendChild(messageDiv);
      this.messagesContainer.scrollTop = this.messagesContainer.scrollHeight;
    }

    removeTypingIndicator() {
      const typingMessage = this.container.querySelector('.typing');
      if (typingMessage) {
        typingMessage.remove();
      }
    }

    delay(ms) {
      return new Promise(resolve => setTimeout(resolve, ms));
    }
  }

  // Initialize widget when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      window.NailAide = new NailAideWidget();
    });
  } else {
    window.NailAide = new NailAideWidget();
  }

})();