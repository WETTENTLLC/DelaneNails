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
        console.error('Chat error:', error);
        this.removeTypingIndicator();
        const fallbackResponse = this.getFallbackResponse(message);
        this.addMessage('assistant', fallbackResponse);
      }
    }

    async getGeminiResponse(userMessage) {
      // First try local response for common queries
      const localResponse = this.getLocalResponse(userMessage);
      if (localResponse) {
        return localResponse;
      }

      // Try Gemini API
      try {
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
          console.error('Gemini API error:', response.status, response.statusText);
          throw new Error('Gemini API request failed');
        }

        const data = await response.json();
        return data.candidates[0].content.parts[0].text;
      } catch (error) {
        console.error('Gemini API error:', error);
        return this.getFallbackResponse(userMessage);
      }
    }

    getLocalResponse(message) {
      const msg = message.toLowerCase();
      
      if (msg.includes('service') || msg.includes('what do you offer')) {
        return `We offer comprehensive nail care services:\n\n• Mobile Pedicure: $135+ (2h)\n• Luxurious Express Pedicure: $45 (30min)\n• Spa Pedicure: $65 (1h)\n• Specialized Pedicures: $75-100\n• Gelish Manicure: $55-60\n• IBX Restorative Manicure: $50-55\n\nWe specialize in natural nail health and have 4.9 stars on Yelp! Would you like to book an appointment?`;
      }
      
      if (msg.includes('book') || msg.includes('appointment') || msg.includes('schedule')) {
        return `I'd be happy to help you book an appointment! You can book online through our Booksy page: https://booksy.com/en-us/195354_delane-s-natural-nail-care_nail-salon_101290_san-leandro#ba_s=seo\n\nOur hours are:\n• Wed-Fri: 11AM-7PM\n• Saturday: 9AM-3PM\n• Tuesday: Mobile & At-Home Visits Only\n• Sun-Mon: Closed\n\nYou can also call us at (510) 346-2457!`;
      }
      
      if (msg.includes('hour') || msg.includes('open') || msg.includes('time')) {
        return `Our business hours are:\n\n• Wednesday-Friday: 11:00 AM - 7:00 PM\n• Saturday: 9:00 AM - 3:00 PM\n• Tuesday: Mobile & At-Home Visits Only\n• Sunday-Monday: Closed\n\nWe're located at 333 Estudillo Ave, Suite 204, San Leandro, CA 94577`;
      }
      
      if (msg.includes('price') || msg.includes('cost') || msg.includes('how much')) {
        return `Here are our popular services and pricing:\n\n• Express Pedicure: $45 (30min)\n• Spa Pedicure: $65 (1h)\n• Mobile Pedicure: $135+ (2h)\n• Gelish Manicure: $55-60\n• Specialized Pedicures: $75-100\n• Keryflex Nail Care: $200\n\nWould you like to book one of these services?`;
      }
      
      if (msg.includes('location') || msg.includes('address') || msg.includes('where')) {
        return `We're located at:\n333 Estudillo Ave, Suite 204\nSan Leandro, CA 94577\n\nPhone: (510) 346-2457\nEmail: delane@delanesnails.com\n\nWe also offer mobile services that come to you!`;
      }
      
      return null;
    }

    getFallbackResponse(message) {
      return `Thank you for your question! Here's how you can get help:\n\n📞 Call us: (510) 346-2457\n🌐 Book online: https://booksy.com/en-us/195354_delane-s-natural-nail-care_nail-salon_101290_san-leandro#ba_s=seo\n📧 Email: delane@delanesnails.com\n\nWe're open Wed-Fri 11AM-7PM, Sat 9AM-3PM. Tuesday is for mobile visits only!`;
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