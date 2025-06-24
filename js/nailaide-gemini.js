/**
 * NailAide Chat Widget with Gemini AI
 */

(function() {
  'use strict';

  // Configuration
  const CONFIG = {
    GEMINI_API_KEY: 'AIzaSyCr913ppyEgYL0k47gLye1YTiL9lD1SH_0',
    GEMINI_API_URL: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent'
  };

  class NailAideWidget {
    constructor() {
      this.isOpen = false;
      this.container = null;
      this.messagesContainer = null;
      this.inputField = null;
      this.siteInfo = null;
      this.init();
    }

    async init() {
      this.loadSiteInfo();
      this.createWidget();
      this.attachEventListeners();
      console.log('NailAide widget initialized with Gemini AI');
    }

    loadSiteInfo() {
      if (window.WebsiteContent) {
        this.siteInfo = window.WebsiteContent.getContent();
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
      this.addMessage('assistant', 'Hello! I\'m your nail care assistant. I can help you with information about our services, pricing, hours, and booking appointments. How can I help you today?');
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
    }

    async sendMessage() {
      const message = this.inputField.value.trim();
      if (!message) return;

      this.addMessage('user', message);
      this.inputField.value = '';
      
      // Show typing indicator
      this.addMessage('assistant', 'Typing...', true);
      
      try {
        const response = await this.getGeminiResponse(message);
        this.removeTypingIndicator();
        this.addMessage('assistant', response);
      } catch (error) {
        this.removeTypingIndicator();
        this.addMessage('assistant', 'I apologize, but I\'m having trouble responding right now. Please call us at (510) 346-2457 or book online at our Booksy page.');
      }
    }

    async getGeminiResponse(userMessage) {
      const systemPrompt = this.buildSystemPrompt();
      
      const requestBody = {
        contents: [{
          parts: [{
            text: `${systemPrompt}\n\nUser question: ${userMessage}`
          }]
        }]
      };

      const response = await fetch(`${CONFIG.GEMINI_API_URL}?key=${CONFIG.GEMINI_API_KEY}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        throw new Error('Gemini API request failed');
      }

      const data = await response.json();
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
${services.map(s => `- ${s.title}: ${s.price} (${s.duration || 'varies'})`).join('\n')}

IMPORTANT: 
- Always provide the Booksy booking link when customers ask about appointments
- Tuesday is ONLY for mobile and at-home visits
- We specialize in natural nail care and have 4.9 stars on Yelp
- Be helpful, friendly, and professional
- Keep responses concise but informative`;
    }

    addMessage(sender, text, isTyping = false) {
      const messageDiv = document.createElement('div');
      messageDiv.className = `nailaide-message nailaide-${sender}`;
      if (isTyping) messageDiv.classList.add('typing');
      messageDiv.textContent = text;
      
      this.messagesContainer.appendChild(messageDiv);
      this.messagesContainer.scrollTop = this.messagesContainer.scrollHeight;
    }

    removeTypingIndicator() {
      const typingMessage = this.container.querySelector('.typing');
      if (typingMessage) {
        typingMessage.remove();
      }
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