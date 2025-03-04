/**
 * NailAide - AI Assistant Widget for Delane's Natural Nail Care
 */
const NailAide = {
    widget: null,
    config: null,
    isOpen: false,
    conversationState: {
        awaitingBookingConfirmation: false,
        lastQuestion: null,
        context: {},
        conversationHistory: []
    },
    voiceAssistant: null,
    knowledgeBase: null,
    
    createWidget: function(config) {
        console.log('Creating NailAide widget with config:', config);
        
        this.config = {
            container: config.container || document.getElementById('nailaide-root'),
            theme: config.theme || {
                primaryColor: '#9333ea',
                secondaryColor: '#f3f4f6',
                textColor: '#1f2937',
                buttonTextColor: '#ffffff'
            },
            welcomeMessage: config.welcomeMessage || 'Hello! How can I help you today?',
            bookingUrl: config.bookingUrl || (typeof BooksyService !== 'undefined' ? BooksyService.getBookingUrl() : 'https://delanesnaturalnailcare.booksy.com/'),
            enableVoice: config.enableVoice !== undefined ? config.enableVoice : true,
            debug: false, // Force debug to false
            buttonLabel: config.buttonLabel || 'Ask NailAide' // Default button label
        };
        
        // Load predefined responses if not provided
        this.loadResponses();
        
        return this;
    },
    
    mount: function() {
        console.log('Mounting NailAide widget...');
        
        try {
            if (!this.config) {
                throw new Error('Widget configuration not set. Call createWidget() first.');
            }
            
            if (!this.config.container) {
                throw new Error('Widget container not specified or found.');
            }
            
            // Create widget DOM structure
            this.createWidgetDOM();
            
            // Add event listeners
            this.setupEventListeners();
            
            // Initialize voice assistant if enabled
            if (this.config.enableVoice) {
                this.initVoiceAssistant();
            }
            
            // Show the chat button
            this.showChatButton();
            
            // Load knowledge base
            this.loadKnowledgeBase();
            
            console.log('NailAide widget mounted successfully');
            return true;
        } catch (error) {
            console.error('Failed to mount NailAide widget:', error);
            return false;
        }
    },
    
    createWidgetDOM: function() {
        const container = this.config.container;
        container.innerHTML = '';
        container.classList.add('nailaide-container');
        
        // Create chat button with descriptive text
        const chatButton = document.createElement('div');
        chatButton.classList.add('nailaide-chat-button');
        chatButton.innerHTML = `
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M21 11.5C21.0034 12.8199 20.6951 14.1219 20.1 15.3C19.3944 16.7118 18.3098 17.8992 16.9674 18.7293C15.6251 19.5594 14.0782 19.9994 12.5 20C11.1801 20.0034 9.87812 19.6951 8.7 19.1L3 21L4.9 15.3C4.30493 14.1219 3.99656 12.8199 4 11.5C4.00061 9.92179 4.44061 8.37488 5.27072 7.03258C6.10083 5.69028 7.28825 4.6056 8.7 3.90001C9.87812 3.30494 11.1801 2.99659 12.5 3.00001H13C15.0843 3.11502 17.053 3.99479 18.5291 5.47089C20.0052 6.94699 20.885 8.91568 21 11V11.5Z" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            <span class="nailaide-chat-button-text">${this.config.buttonLabel}</span>
        `;
        
        chatButton.style.backgroundColor = this.config.theme.primaryColor;
        chatButton.style.color = this.config.theme.buttonTextColor;
        container.appendChild(chatButton);
        
        // Create chat window
        const chatWindow = document.createElement('div');
        chatWindow.classList.add('nailaide-chat-window');
        chatWindow.style.display = 'none';
        
        // Chat header
        const chatHeader = document.createElement('div');
        chatHeader.classList.add('nailaide-chat-header');
        chatHeader.style.backgroundColor = this.config.theme.primaryColor;
        chatHeader.style.color = this.config.theme.buttonTextColor;
        
        // Header content with accessibility controls
        chatHeader.innerHTML = `
            <div class="nailaide-chat-title">NailAide Assistant</div>
            <div class="accessibility-controls">
                <button class="accessibility-button language-button" title="Change language">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="currentColor" stroke-width="2"/>
                        <path d="M2 12H22" stroke="currentColor" stroke-width="2"/>
                        <path d="M12 2C14.5013 4.73835 15.9228 8.29203 16 12C15.9228 15.708 14.5013 19.2616 12 22" stroke="currentColor" stroke-width="2"/>
                        <path d="M12 2C9.49872 4.73835 8.07725 8.29203 8 12C8.07725 15.708 9.49872 19.2616 12 22" stroke="currentColor" stroke-width="2"/>
                    </svg>
                </button>
                <button class="accessibility-button text-size-button" title="Adjust text size">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M6 10H8L12 4L16 10H18" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        <path d="M6 14H8L12 20L16 14H18" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                </button>
            </div>
            <div class="nailaide-chat-close">&times;</div>
        `;
        
        chatWindow.appendChild(chatHeader);
        
        // Chat messages container
        const chatMessages = document.createElement('div');
        chatMessages.classList.add('nailaide-chat-messages');
        
        // Add welcome message
        const welcomeMessage = document.createElement('div');
        welcomeMessage.classList.add('nailaide-message', 'nailaide-assistant-message');
        welcomeMessage.textContent = this.config.welcomeMessage;
        chatMessages.appendChild(welcomeMessage);
        
        chatWindow.appendChild(chatMessages);
        
        // Add voice controls
        const voiceControls = document.createElement('div');
        voiceControls.classList.add('voice-controls');
        voiceControls.innerHTML = `
            <button class="voice-button" title="Tap to start voice input">
                <svg width="16" height="16" viewBox="0 0 24 24"><path fill="currentColor" d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z"/><path fill="currentColor" d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z"/></svg>
            </button>
            <button class="tour-button" title="Take a guided tour of this page">
                <svg width="16" height="16" viewBox="0 0 24 24"><path fill="currentColor" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z"/></svg>
            </button>
        `;
        
        chatWindow.appendChild(voiceControls);
        
        // Chat input area
        const chatInput = document.createElement('div');
        chatInput.classList.add('nailaide-chat-input');
        chatInput.innerHTML = `
            <input type="text" placeholder="Type your question here...">
            <button class="nailaide-send-button">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M22 2L11 13" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    <path d="M22 2L15 22L11 13L2 9L22 2Z" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
            </button>
        `;
        chatWindow.appendChild(chatInput);
        
        // Add chat window to container
        container.appendChild(chatWindow);
        
        // Add quick suggestion buttons
        this.addQuickSuggestions(chatMessages);
        
        // Add styles
        this.addStyles();
    },
    
    addQuickSuggestions: function(chatMessages) {
        // Create quick suggestion buttons for common questions
        const suggestionsContainer = document.createElement('div');
        suggestionsContainer.classList.add('quick-suggestions');
        suggestionsContainer.innerHTML = `
            <p>Popular questions:</p>
            <div class="suggestion-buttons">
                <button class="suggestion-button">Services & Pricing</button>
                <button class="suggestion-button">Business Hours</button>
                <button class="suggestion-button">Book Appointment</button>
                <button class="suggestion-button">Take a Tour</button>
            </div>
        `;
        
        chatMessages.appendChild(suggestionsContainer);
        
        // Add event listeners to suggestion buttons
        const buttons = suggestionsContainer.querySelectorAll('.suggestion-button');
        buttons.forEach(button => {
            button.addEventListener('click', () => {
                const text = button.textContent;
                this.addMessage(text, 'user');
                this.processMessage(text);
            });
        });
    },
    
    addStyles: function() {
        // Add widget styles if not already added
        if (!document.getElementById('nailaide-styles')) {
            const styleSheet = document.createElement('style');
            styleSheet.id = 'nailaide-styles';
            styleSheet.innerHTML = `
                .nailaide-container {
                    position: relative;
                    width: 100%;
                    height: 100%;
                }
                
                .nailaide-chat-button {
                    position: absolute;
                    bottom: 20px;
                    right: 20px;
                    width: 60px;
                    height: 60px;
                    border-radius: 50%;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    cursor: pointer;
                    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
                    transition: all 0.3s ease;
                }
                
                .nailaide-chat-button:hover {
                    transform: scale(1.1);
                }
                
                .nailaide-chat-button-text {
                    margin-left: 8px;
                    font-size: 14px;
                    font-weight: bold;
                }
                
                .nailaide-chat-window {
                    position: absolute;
                    bottom: 90px;
                    right: 20px;
                    width: 320px;
                    height: 400px;
                    background-color: white;
                    border-radius: 10px;
                    overflow: hidden;
                    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
                    display: flex;
                    flex-direction: column;
                }
                
                .nailaide-chat-header {
                    padding: 15px;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }
                
                .nailaide-chat-title {
                    font-weight: bold;
                }
                
                .nailaide-chat-close {
                    cursor: pointer;
                    font-size: 24px;
                }
                
                .nailaide-chat-messages {
                    flex-grow: 1;
                    padding: 15px;
                    overflow-y: auto;
                    background-color: #f9f9f9;
                }
                
                .nailaide-message {
                    margin-bottom: 15px;
                    padding: 10px 15px;
                    border-radius: 18px;
                    max-width: 80%;
                    word-wrap: break-word;
                }
                
                .nailaide-assistant-message {
                    background-color: #e6e6e6;
                    margin-right: auto;
                }
                
                .nailaide-user-message {
                    background-color: #9333ea;
                    color: white;
                    margin-left: auto;
                }
                
                .nailaide-chat-input {
                    display: flex;
                    padding: 10px 15px;
                    border-top: 1px solid #e6e6e6;
                }
                
                .nailaide-chat-input input {
                    flex-grow: 1;
                    padding: 8px 12px;
                    border: 1px solid #ccc;
                    border-radius: 20px;
                    outline: none;
                }
                
                .nailaide-send-button {
                    width: 36px;
                    height: 36px;
                    border-radius: 50%;
                    background-color: #9333ea;
                    color: white;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    margin-left: 10px;
                    cursor: pointer;
                    border: none;
                }
                
                .voice-controls {
                    display: flex;
                    justify-content: space-between;
                    padding: 10px 15px;
                    border-top: 1px solid #e6e6e6;
                }
                
                .voice-button, .tour-button {
                    background-color: #9333ea;
                    color: white;
                    border: none;
                    border-radius: 50%;
                    width: 36px;
                    height: 36px;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    cursor: pointer;
                }
                
                .quick-suggestions {
                    margin-top: 10px;
                }
                
                .quick-suggestions p {
                    margin: 0;
                    font-weight: bold;
                }
                
                .suggestion-buttons {
                    display: flex;
                    flex-wrap: wrap;
                    gap: 10px;
                    margin-top: 5px;
                }
                
                .suggestion-button {
                    background-color: #9333ea;
                    color: white;
                    border: none;
                    border-radius: 20px;
                    padding: 5px 10px;
                    cursor: pointer;
                }
            `;
            document.head.appendChild(styleSheet);
        }
    },
    
    setupEventListeners: function() {
        const container = this.config.container;
        const chatButton = container.querySelector('.nailaide-chat-button');
        const chatWindow = container.querySelector('.nailaide-chat-window');
        const closeButton = container.querySelector('.nailaide-chat-close');
        const inputField = container.querySelector('.nailaide-chat-input input');
        const sendButton = container.querySelector('.nailaide-send-button');
        
        // Toggle chat window on button click
        chatButton.addEventListener('click', () => {
            this.toggleChat();
        });
        
        // Close chat window
        closeButton.addEventListener('click', () => {
            this.closeChat();
        });
        
        // Send message on button click
        sendButton.addEventListener('click', () => {
            this.sendMessage();
        });
        
        // Send message on Enter key
        inputField.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.sendMessage();
            }
        });
    },
    
    toggleChat: function() {
        if (this.isOpen) {
            this.closeChat();
        } else {
            this.openChat();
        }
    },
    
    openChat: function() {
        const chatWindow = this.config.container.querySelector('.nailaide-chat-window');
        chatWindow.style.display = 'flex';
        this.isOpen = true;
        
        // Focus input field
        setTimeout(() => {
            const inputField = this.config.container.querySelector('.nailaide-chat-input input');
            if (inputField) inputField.focus();
        }, 100);
    },
    
    closeChat: function() {
        const chatWindow = this.config.container.querySelector('.nailaide-chat-window');
        chatWindow.style.display = 'none';
        this.isOpen = false;
    },
    
    sendMessage: function() {
        const inputField = this.config.container.querySelector('.nailaide-chat-input input');
        const message = inputField.value.trim();
        
        if (message) {
            // Add user message
            this.addMessage(message, 'user');
            
            // Clear input field
            inputField.value = '';
            
            // Process message and get response
            this.processMessage(message);
        }
    },
    
    addMessage: function(text, sender) {
        const chatMessages = this.config.container.querySelector('.nailaide-chat-messages');
        const messageElement = document.createElement('div');
        
        messageElement.classList.add('nailaide-message');
        if (sender === 'user') {
            messageElement.classList.add('nailaide-user-message');
        } else {
            messageElement.classList.add('nailaide-assistant-message');
        }
        
        messageElement.textContent = text;
        chatMessages.appendChild(messageElement);
        
        // Scroll to bottom
        chatMessages.scrollTop = chatMessages.scrollHeight;
    },
    
    processMessage: function(message) {
        // Simple responses based on keywords
        setTimeout(() => {
            let response;
            
            const lowerMessage = message.toLowerCase();
            
            // Check if we're waiting for booking confirmation
            if (this.conversationState.awaitingBookingConfirmation && 
                (lowerMessage.includes('yes') || lowerMessage.includes('yeah') || lowerMessage === 'y')) {
                
                // User confirmed they want to book - open booking page
                this.addMessage("Great! I'm opening the booking page for you now.", 'assistant');
                this.openBookingPage();
                
                // Reset conversation state
                this.conversationState.awaitingBookingConfirmation = false;
                return;
            }
            
            if (lowerMessage.includes('book') || lowerMessage.includes('appointment') || lowerMessage.includes('schedule')) {
                response = `You can book an appointment through our online scheduling system. Would you like me to open the booking page for you?`;
                this.addBookingButton();
                
                // Set conversation state to await confirmation
                this.conversationState.awaitingBookingConfirmation = true;
                this.conversationState.lastQuestion = 'booking';
            } 
            else if (lowerMessage.includes('hour') || lowerMessage.includes('open')) {
                const hours = WebsiteContent.getHours();
                response = 'Our business hours are:\n';
                for (const [day, time] of Object.entries(hours)) {
                    response += `${day}: ${time}\n`;
                }
                this.conversationState.awaitingBookingConfirmation = false;
            }
            else if (lowerMessage.includes('service') || lowerMessage.includes('price')) {
                const services = WebsiteContent.getServices();
                response = 'Here are some of our services:\n';
                services.forEach(service => {
                    response += `${service.name}: ${service.price} (${service.duration})\n`;
                });
                this.conversationState.awaitingBookingConfirmation = false;
            }
            else if (lowerMessage.includes('contact') || lowerMessage.includes('phone') || lowerMessage.includes('email')) {
                const contactInfo = WebsiteContent.getContactInfo();
                response = `You can contact us at:\nPhone: ${contactInfo.phone}\nEmail: ${contactInfo.email}\nAddress: ${contactInfo.address}`;
                this.conversationState.awaitingBookingConfirmation = false;
            }
            else {
                response = "Thank you for your message. I'm here to help with booking appointments, answering questions about our services, hours, or providing general information about our nail care services. How can I assist you today?";
                this.conversationState.awaitingBookingConfirmation = false;
            }
            
            this.addMessage(response, 'assistant');
        }, 500);
    },
    
    openBookingPage: function() {
        // Open the booking URL in a new tab
        window.open(this.config.bookingUrl, '_blank');
    },
    
    addBookingButton: function() {
        const chatMessages = this.config.container.querySelector('.nailaide-chat-messages');
        const buttonContainer = document.createElement('div');
        buttonContainer.classList.add('nailaide-message', 'nailaide-assistant-message');
        
        const bookButton = document.createElement('button');
        bookButton.textContent = 'Book Appointment';
        bookButton.style.backgroundColor = this.config.theme.primaryColor;
        bookButton.style.color = this.config.theme.buttonTextColor;
        bookButton.style.padding = '8px 16px';
        bookButton.style.border = 'none';
        bookButton.style.borderRadius = '20px';
        bookButton.style.cursor = 'pointer';
        
        bookButton.addEventListener('click', () => {
            this.openBookingPage();
            this.addMessage("Opening booking page...", 'assistant');
        });
        
        buttonContainer.appendChild(bookButton);
        chatMessages.appendChild(buttonContainer);
        
        // Scroll to bottom
        chatMessages.scrollTop = chatMessages.scrollHeight;
    },
    
    showChatButton: function() {
        const chatButton = this.config.container.querySelector('.nailaide-chat-button');
        if (chatButton) {
            chatButton.style.display = 'flex';
            // Force repaint
            chatButton.getBoundingClientRect();
        } else {
            console.error('Chat button element not found');
        }
    },
    
    initVoiceAssistant: function() {
        console.log('Initializing voice assistant...');
        
        // Load voice assistant script if not already loaded
        if (typeof VoiceAssistant === 'undefined') {
            const script = document.createElement('script');
            script.src = 'js/voice-assistant.js';
            script.onload = () => {
                if (typeof VoiceAssistant !== 'undefined') {
                    VoiceAssistant.init(this);
                    this.setupVoiceControls();
                }
            };
            document.head.appendChild(script);
        } else {
            // Initialize existing VoiceAssistant
            VoiceAssistant.init(this);
            this.setupVoiceControls();
        }
    },
    
    setupVoiceControls: function() {
        const voiceButton = document.querySelector('.voice-button');
        if (voiceButton) {
            voiceButton.addEventListener('click', () => {
                if (typeof VoiceAssistant !== 'undefined') {
                    VoiceAssistant.toggleListening();
                }
            });
        }
        
        const tourButton = document.querySelector('.tour-button');
        if (tourButton) {
            tourButton.addEventListener('click', () => {
                if (typeof SiteNavigator !== 'undefined') {
                    this.addMessage("Starting a guided tour of this page...", 'assistant');
                    SiteNavigator.startTour();
                } else {
                    this.addMessage("I'm sorry, the tour feature is still loading. Please try again in a moment.", 'assistant');
                }
            });
        }
    },
    
    handleVoiceInput: function(transcript) {
        // Add the transcript to input and process
        const inputField = this.config.container.querySelector('.nailaide-chat-input input');
        inputField.value = transcript;
        this.sendMessage();
    },
    
    loadKnowledgeBase: function() {
        // Load knowledge base from external source
        fetch('/api/knowledge-base')
            .then(response => response.json())
            .then(data => {
                this.knowledgeBase = data;
                console.log('Knowledge base loaded:', data);
            })
            .catch(error => {
                console.error('Failed to load knowledge base:', error);
            });
    },
    
    loadResponses: function() {
        // Load predefined responses from external source
        fetch('/api/responses')
            .then(response => response.json())
            .then(data => {
                this.responses = data;
                console.log('Predefined responses loaded:', data);
            })
            .catch(error => {
                console.error('Failed to load predefined responses:', error);
            });
    }
};

// Make available globally
window.NailAide = NailAide;

// Fix AI communication issues
function initAIAgent() {
  // Ensure we're not in debug mode by default
  const isDebug = false;
  
  // Initialize communication channel
  const agentComm = {
    send: function(message) {
      // Remove any debug-related parameters
      const cleanedMessage = {
        ...message,
        debug: undefined
      };
      
      // Send message to AI backend
      return fetch('/api/agent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(cleanedMessage)
      })
      .then(response => response.json())
      .catch(error => {
        console.error('AI Agent communication error:', error);
        return { error: 'Communication failed', success: false };
      });
    }
  };
  
  // ... existing agent code ...
  
  return agentComm;
}
