/**
 * NailAide Core - Main functionality for the NailAide chatbot
 */

(function() {
    // Initialize NailAide when DOM is loaded
    document.addEventListener('DOMContentLoaded', function() {
        initializeNailAide();
    });

    function initializeNailAide() {
        console.log('Initializing NailAide core functionality...');
        
        // Get configuration
        const config = window.NAILAIDE_CONFIG || {};
        
        // Set up chat widget
        setupChatWidget();
        
        // Set up event listeners
        setupEventListeners();
    }
    
    function setupChatWidget() {
        // Check if widget root exists, if not create it
        let widgetRoot = document.getElementById('nailaide-root');
        if (!widgetRoot) {
            widgetRoot = document.createElement('div');
            widgetRoot.id = 'nailaide-root';
            document.body.appendChild(widgetRoot);
        }
        
        // Create widget structure if it doesn't exist
        if (!document.querySelector('.nailaide-chat-button')) {
            createChatWidgetStructure();
        }
    }
    
    function createChatWidgetStructure() {
        const config = window.NAILAIDE_CONFIG || {};
        const widgetRoot = document.getElementById('nailaide-root');
        
        // Create chat button
        const chatButton = document.createElement('div');
        chatButton.className = 'nailaide-chat-button';
        chatButton.style.backgroundColor = config.primaryColor || '#9333ea';
        
        // Add chat icon and text
        chatButton.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
            </svg>
            <span class="nailaide-chat-button-text">Chat with us</span>
        `;
        
        // Create chat window (initially hidden)
        const chatWindow = document.createElement('div');
        chatWindow.className = 'nailaide-chat-window';
        chatWindow.style.display = 'none';
        chatWindow.innerHTML = `
            <div class="nailaide-header" style="background-color: ${config.primaryColor || '#9333ea'}">
                <h3>${config.widgetTitle || 'Chat with us'}</h3>
                <button class="nailaide-close">&times;</button>
            </div>
            <div class="nailaide-chat-container">
                <div class="nailaide-messages"></div>
            </div>
            <div class="nailaide-input-area">
                <input type="text" class="nailaide-input" placeholder="Type your message...">
                <button class="nailaide-send" style="background-color: ${config.primaryColor || '#9333ea'}">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <line x1="22" y1="2" x2="11" y2="13"></line>
                        <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                    </svg>
                </button>
            </div>
        `;
        
        // Append elements to widget root
        widgetRoot.appendChild(chatButton);
        widgetRoot.appendChild(chatWindow);
    }
    
    function setupEventListeners() {
        // Toggle chat window when button is clicked
        const chatButton = document.querySelector('.nailaide-chat-button');
        const chatWindow = document.querySelector('.nailaide-chat-window');
        
        if (chatButton && chatWindow) {
            chatButton.addEventListener('click', function() {
                if (chatWindow.style.display === 'none') {
                    chatWindow.style.display = 'flex';
                    chatButton.style.display = 'none';
                    
                    // Show welcome message if this is the first open
                    const messages = document.querySelector('.nailaide-messages');
                    if (messages && !messages.children.length) {
                        showWelcomeMessage();
                    }
                }
            });
            
            // Close button
            const closeButton = chatWindow.querySelector('.nailaide-close');
            if (closeButton) {
                closeButton.addEventListener('click', function() {
                    chatWindow.style.display = 'none';
                    chatButton.style.display = 'flex';
                });
            }
            
            // Send message on button click
            const sendButton = chatWindow.querySelector('.nailaide-send');
            if (sendButton) {
                sendButton.addEventListener('click', sendMessage);
            }
            
            // Send message on Enter key
            const inputField = chatWindow.querySelector('.nailaide-input');
            if (inputField) {
                inputField.addEventListener('keypress', function(e) {
                    if (e.key === 'Enter') {
                        sendMessage();
                    }
                });
            }
        }
    }
    
    function showWelcomeMessage() {
        const config = window.NAILAIDE_CONFIG || {};
        const welcomeMessage = config.welcomeMessage || "Hello! How can I help you today?";
        
        addMessage('ai', welcomeMessage);
    }
    
    function sendMessage() {
        const inputField = document.querySelector('.nailaide-input');
        if (!inputField || !inputField.value.trim()) return;
        
        const userMessage = inputField.value.trim();
        inputField.value = '';
        
        // Add user message to chat
        addMessage('user', userMessage);
        
        // Process the message and get response
        const response = processMessage(userMessage);
        
        // Add AI response to chat
        setTimeout(() => {
            addMessage('ai', response);
        }, 500); // Small delay for natural feeling
    }
    
    function addMessage(type, content) {
        const messages = document.querySelector('.nailaide-messages');
        if (!messages) return;
        
        const messageDiv = document.createElement('div');
        messageDiv.className = `nailaide-message nailaide-${type}-message`;
        
        const bubbleDiv = document.createElement('div');
        bubbleDiv.className = 'nailaide-bubble';
        
        // For AI messages, we might have HTML content
        if (type === 'ai') {
            bubbleDiv.innerHTML = content;
        } else {
            bubbleDiv.textContent = content;
        }
        
        messageDiv.appendChild(bubbleDiv);
        messages.appendChild(messageDiv);
        
        // Scroll to bottom
        messages.scrollTop = messages.scrollHeight;
    }
    
    function processMessage(message) {
        console.log('Processing message:', message);
        
        // Check if message is about booking
        if (isBookingRequest(message)) {
            return generateBookingResponse();
        }
        
        // Default response if no specific handler matches
        return "I can help you with information about our nail salon services, booking appointments, or answering questions about our products. How can I assist you today?";
    }
    
    function isBookingRequest(message) {
        const bookingKeywords = [
            'book', 'booking', 'appointment', 'schedule', 'reservation', 
            'reserve', 'book appointment', 'make appointment', 'set up appointment'
        ];
        
        message = message.toLowerCase();
        return bookingKeywords.some(keyword => message.includes(keyword));
    }
    
    function generateBookingResponse() {
        const config = window.NAILAIDE_CONFIG || {};
        
        // Check if booking is configured
        if (!config.booking || !config.booking.enabled || !config.booking.bookingUrl) {
            return "I'm sorry, our online booking system is currently unavailable. Please call us to schedule an appointment.";
        }
        
        // Create response with a prominent booking button
        return `
            I'd be happy to help you book an appointment! You can use our online booking system.
            <br><br>
            <a href="${config.booking.bookingUrl}" target="_blank" class="nailaide-booking-button">
                ${config.booking.buttonText || 'Book Appointment'}
            </a>
        `;
    }
    
    // Helper for debugging
    window.resetNailAide = function() {
        const widgetRoot = document.getElementById('nailaide-root');
        if (widgetRoot) {
            widgetRoot.innerHTML = '';
            setupChatWidget();
            setupEventListeners();
        }
    };
})();
