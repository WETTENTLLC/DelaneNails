/**
 * NailAide Chat Widget - Working Version with Intelligent Local Responses
 */

(function() {
  'use strict';

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
      await this.loadSiteInfo();
      this.createWidget();
      this.attachEventListeners();
      console.log('✅ NailAide widget initialized with intelligent responses');
    }

    async loadSiteInfo() {
      if (window.WebsiteContent) {
        try {
          this.siteInfo = window.WebsiteContent.getContent();
          console.log('✅ Website content loaded');
        } catch (error) {
          console.error('❌ Error loading website content:', error);
        }
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
      this.addMessage('assistant', 'Hello! I\'m your AI-powered nail care assistant. I can help you with information about our services, pricing, hours, and booking appointments. How can I help you today?');
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
      
      // Simulate thinking time
      await this.delay(800);
      
      const response = this.getIntelligentResponse(message);
      this.removeTypingIndicator();
      this.addMessage('assistant', response);
    }

    getIntelligentResponse(message) {
      const msg = message.toLowerCase();
      
      // Greeting responses
      if (msg.match(/^(hi|hello|hey|good morning|good afternoon|good evening)$/)) {
        return `Hello! Welcome to Delane's Natural Nail Care & Medi-Spa! 🌟 I'm here to help you with:\n\n• Service information and pricing\n• Business hours and location\n• Booking appointments\n• Special offers and packages\n\nWhat would you like to know?`;
      }

      // Services inquiry
      if (msg.includes('service') || msg.includes('what do you offer') || msg.includes('what can you do')) {
        return `We offer premium nail care services at Delane's Natural Nail Care & Medi-Spa:\n\n🏠 **Mobile Services:**\n• Mobile Pedicure: $135+ (2h)\n• Mobile Manicure & Pedicure: $175+ (3h)\n\n💅 **Pedicures:**\n• Express Pedicure: $45 (30min)\n• Spa Pedicure: $65 (1h)\n• Specialized Pedicures: $75-100\n• Keryflex Nail Care: $200\n\n✨ **Manicures:**\n• Gelish Manicure: $55-60\n• IBX Restorative Manicure: $50-55\n• Spa Manicure w/ Paraffin: $65\n\nWe specialize in natural nail health with 4.9⭐ on Yelp! Ready to book?`;
      }

      // Booking inquiries
      if (msg.includes('book') || msg.includes('appointment') || msg.includes('schedule') || msg.includes('reserve')) {
        return `I'd love to help you book an appointment! 📅\n\n**Click to Book Online:**\n<a href="https://booksy.com/en-us/195354_delane-s-natural-nail-care_nail-salon_101290_san-leandro#ba_s=seo" target="_blank" style="background: #00bcd4; color: white; padding: 10px 20px; border-radius: 5px; text-decoration: none; display: inline-block; margin: 10px 0;">📅 BOOK NOW ON BOOKSY</a>\n\n**Our Hours:**\n• Wednesday-Friday: 11AM-7PM\n• Saturday: 9AM-3PM\n• Tuesday: Mobile & At-Home Visits Only\n• Sunday-Monday: Closed\n\n**Or Call Us:**\n📞 (510) 346-2457\n\nWhich service interests you most?`;
      }

      // Hours inquiry
      if (msg.includes('hour') || msg.includes('open') || msg.includes('time') || msg.includes('when')) {
        return `Our business hours are:\n\n🕐 **Regular Hours:**\n• Wednesday-Friday: 11:00 AM - 7:00 PM\n• Saturday: 9:00 AM - 3:00 PM\n\n🚗 **Mobile Services:**\n• Tuesday: Mobile & At-Home Visits Only\n\n❌ **Closed:**\n• Sunday & Monday\n\n📍 **Location:**\n333 Estudillo Ave, Suite 204\nSan Leandro, CA 94577\n\nWould you like to book an appointment?`;
      }

      // Pricing inquiry
      if (msg.includes('price') || msg.includes('cost') || msg.includes('how much') || msg.includes('expensive')) {
        return `Here's our pricing for popular services:\n\n💰 **Quick Services:**\n• Express Pedicure: $45 (30min)\n• Spa Pedicure: $65 (1h)\n\n🏠 **Mobile Services:**\n• Mobile Pedicure: $135+ (2h)\n• Mobile Combo: $175+ (3h)\n\n✨ **Manicures:**\n• Gelish Manicure: $55-60\n• IBX Restorative: $50-55\n\n🔬 **Specialized Care:**\n• Specialized Pedicures: $75-100\n• Keryflex Prosthetic: $200\n\nAll services include premium natural products! Which service interests you?`;
      }

      // Location inquiry
      if (msg.includes('location') || msg.includes('address') || msg.includes('where') || msg.includes('directions')) {
        return `We're conveniently located in San Leandro:\n\n📍 **Address:**\n333 Estudillo Ave, Suite 204\nSan Leandro, CA 94577\n\n📞 **Contact:**\nPhone: (510) 346-2457\nEmail: delane@delanesnails.com\n\n🚗 **Mobile Services Available:**\nWe also come to you! Tuesday is dedicated to mobile and at-home visits.\n\n🌟 **Why Choose Us:**\n• 4.9⭐ rating on Yelp\n• 500+ happy customers\n• Natural nail care specialists\n\nReady to book your appointment?`;
      }

      // Mobile services inquiry
      if (msg.includes('mobile') || msg.includes('home') || msg.includes('travel') || msg.includes('come to me')) {
        return `Yes! We offer premium mobile services! 🚗✨\n\n🏠 **Mobile Services:**\n• Mobile Pedicure: $135+ (2 hours)\n• Mobile Manicure & Pedicure: $175+ (3 hours)\n\n📅 **Mobile Day:**\n• Tuesday: Dedicated mobile service day\n• Other days: By special arrangement\n\n✨ **What's Included:**\n• All professional equipment\n• Premium natural products\n• Same quality as in-salon service\n• Comfort of your own home\n\n**Book Mobile Service:**\n<a href="https://booksy.com/en-us/195354_delane-s-natural-nail-care_nail-salon_101290_san-leandro#ba_s=seo" target="_blank" style="background: #00bcd4; color: white; padding: 8px 16px; border-radius: 5px; text-decoration: none; display: inline-block; margin: 5px 0;">📅 BOOK MOBILE SERVICE</a>\n\nOr call: (510) 346-2457\n\nWhich mobile service interests you?`;
      }

      // Specialized services
      if (msg.includes('special') || msg.includes('medical') || msg.includes('problem') || msg.includes('condition')) {
        return `We specialize in advanced nail care! 🔬\n\n**Specialized Services:**\n• Specialized Pedicure I: $75 (1h)\n• Specialized Pedicure II: $85 (1h) \n• Specialized Pedicure III: $100 (1h)\n• Keryflex Prosthetic Nail Care: $200 (1.5h)\n• Special Focus Cracked Heels: $75 (1h)\n\n**We Help With:**\n• Nail health restoration\n• Foot care conditions\n• Cracked heels\n• Prosthetic nail solutions\n• Natural nail strengthening\n\n**Expert Care:**\n• 4.9⭐ rating for specialized treatments\n• Natural, gentle products\n• Professional expertise\n\nWhat specific concern can we help you with?`;
      }

      // Steps to Success inquiry
      if (msg.includes('steps to success') || msg.includes('nonprofit') || msg.includes('donate') || msg.includes('charity')) {
        return `Thank you for asking about DNNC Steps to Success! 💝\n\n**Our Mission:**\nEmpowering underserved women, especially African American single parents in the Bay Area through:\n\n• Vocational training in cosmetology\n• Mentorship and career guidance\n• Financial literacy support\n• Emergency assistance\n• Housing help\n\n**Founded:** 2000 in Oakland, formalized 2016\n**Leadership:** Delane Sims & Myeshia Jefferson\n\n**Awards:**\n• Mayor's Award of Excellence (2018)\n• Business of the Year\n• "Future is our Community Award" (2023)\n\n**Support Us:**\n💰 Donate via Zelle: delane@delanesnails.com\n🛍️ Every service purchase supports our mission\n\nWould you like to book a service to support our cause?`;
      }

      // General help or confused responses
      if (msg.includes('help') || msg.includes('confused') || msg.includes('don\'t understand')) {
        return `I'm here to help! Here's what I can assist you with:\n\n📋 **I Can Help With:**\n• Service information & pricing\n• Booking appointments\n• Business hours & location\n• Mobile service details\n• Specialized nail care\n• Steps to Success nonprofit info\n\n💬 **Try Asking:**\n• "What services do you offer?"\n• "How much does a pedicure cost?"\n• "What are your hours?"\n• "How do I book an appointment?"\n• "Do you offer mobile services?"\n\n📞 **Direct Contact:**\nPhone: (510) 346-2457\nEmail: delane@delanesnails.com\n\nWhat specific information would you like?`;
      }

      // Default intelligent response
      return `Thank you for your question! I'd be happy to help you with information about Delane's Natural Nail Care & Medi-Spa.\n\n🌟 **Quick Info:**\n• Premium nail care services ($45-200)\n• Mobile services available\n• 4.9⭐ rating with 500+ reviews\n• Natural nail health specialists\n\n**Book Your Appointment:**\n<a href="https://booksy.com/en-us/195354_delane-s-natural-nail-care_nail-salon_101290_san-leandro#ba_s=seo" target="_blank" style="background: #00bcd4; color: white; padding: 8px 16px; border-radius: 5px; text-decoration: none; display: inline-block; margin: 5px 0;">📅 BOOK NOW</a>\n\n📞 **Or Call:** (510) 346-2457\n\n⏰ **Hours:**\nWed-Fri: 11AM-7PM, Sat: 9AM-3PM\nTuesday: Mobile visits only\n\nWhat specific information can I help you find?`;
    }

    addMessage(sender, text, isTyping = false) {
      const messageDiv = document.createElement('div');
      messageDiv.className = `nailaide-message nailaide-${sender}`;
      if (isTyping) messageDiv.classList.add('typing');
      
      // Handle line breaks and formatting
      messageDiv.innerHTML = text.replace(/\n/g, '<br>');
      
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