/**
 * NailAide Widget - Standalone Version
 * Simple chatbot for DelaneNails with booking functionality
 */

(function() {
    console.log('NailAide Widget Initializing...');
    
    // Configuration
    const CONFIG = {
        primaryColor: '#9333ea',
        bookingUrl: 'https://booksy.com/en-us/512223_delanes-natural-nail-care_nail-salon_134763_greensboro',
        welcomeMessage: 'Hello! How can I help you today? Ask about our services or booking an appointment.',
        widgetTitle: 'Chat with DelaneNails',
        bookingButtonText: 'Book Appointment Now',
        debugMode: true // Set to true to see debugging info
    };
    
    // Initialize widget on DOM load
    document.addEventListener('DOMContentLoaded', function() {
        debugLog('DOM loaded, initializing widget');
        initializeWidget();
    });
    
    // Debug logging helper
    function debugLog(message) {
        if (CONFIG.debugMode) {
            console.log(`[NailAide Debug] ${message}`);
        }
    }
    
    // Initialize the widget
    function initializeWidget() {
        debugLog('Creating widget elements');
        
        // Create widget container if it doesn't exist
        let widgetRoot = document.getElementById('nailaide-root');
        if (!widgetRoot) {
            debugLog('Creating root element');
            widgetRoot = document.createElement('div');
            widgetRoot.id = 'nailaide-root';
            document.body.appendChild(widgetRoot);
        } else {
            debugLog('Root element already exists');
            widgetRoot.innerHTML = ''; // Clear existing content
        }
        
        // Create widget HTML
        createWidgetHTML(widgetRoot);
        
        // Set up event listeners
        setupEventListeners();
        
        debugLog('Widget initialized successfully');
    }
    
    // Create widget HTML structure
    function createWidgetHTML(container) {
        container.innerHTML = `
            <div class="nailaide-chat-button" style="background-color: ${CONFIG.primaryColor}">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                </svg>
                <span class="nailaide-chat-button-text">Chat with us</span>
            </div>
            
            <div class="nailaide-chat-window" style="display: none;">
                <div class="nailaide-header" style="background-color: ${CONFIG.primaryColor}">
                    <h3>${CONFIG.widgetTitle}</h3>
                    <button class="nailaide-close">&times;</button>
                </div>
                <div class="nailaide-chat-container">
                    <div class="nailaide-messages">
                        <!-- Messages will be added here -->
                    </div>
                </div>
                <div class="nailaide-input-area">
                    <input type="text" class="nailaide-input" placeholder="Type your message...">
                    <button class="nailaide-send" style="background-color: ${CONFIG.primaryColor}">
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <line x1="22" y1="2" x2="11" y2="13"></line>
                            <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                        </svg>
                    </button>
                </div>
            </div>
            
            <!-- Debug panel -->
            <div class="nailaide-debug-panel" style="display: ${CONFIG.debugMode ? 'block' : 'none'}; position: fixed; bottom: 80px; right: 20px; background: rgba(0,0,0,0.8); color: white; padding: 10px; border-radius: 5px; font-size: 12px; z-index: 10001;">
                <div>Status: <span id="nailaide-status">Initialized</span></div>
                <div>Last action: <span id="nailaide-last-action">None</span></div>
                <button onclick="resetNailAideWidget()" style="background: #f44336; border: none; color: white; padding: 5px; margin-top: 5px; border-radius: 3px; cursor: pointer;">Reset Widget</button>
            </div>
        `;
        
        // Add essential inline CSS
        const styleElement = document.createElement('style');
        styleElement.textContent = `
            #nailaide-root {
                position: fixed !important;
                bottom: 20px !important;
                right: 20px !important;
                z-index: 999999 !important;
                width: 350px !important;
                height: 500px !important;
                background: transparent !important;
                pointer-events: auto !important;
                font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
            }
            
            .nailaide-chat-button {
                position: absolute !important;
                bottom: 20px !important;
                right: 20px !important;
                width: auto !important;
                min-width: 60px !important;
                padding: 0 20px 0 15px !important;
                height: 60px !important;
                border-radius: 30px !important;
                background-color: #9333ea !important;
                color: white !important;
                display: flex !important;
                justify-content: center !important;
                align-items: center !important;
                cursor: pointer !important;
                box-shadow: 0 4px 8px rgba(0,0,0,0.2) !important;
                z-index: 999999 !important;
                transition: transform 0.3s ease;
            }
            
            .nailaide-chat-button-text {
                font-size: 16px;
                color: white;
                margin-left: 5px;
                white-space: nowrap;
            }
            
            .nailaide-chat-window {
                position: absolute !important;
                bottom: 90px !important;
                right: 20px !important;
                width: 350px !important;
                height: 500px !important;
                background: white !important;
                border-radius: 10px !important;
                box-shadow: 0 5px 20px rgba(0,0,0,0.15) !important;
                z-index: 999998 !important;
                overflow: hidden !important;
                display: flex !important;
                flex-direction: column !important;
                transition: all 0.3s ease;
            }
            
            .nailaide-header {
                padding: 15px;
                display: flex;
                justify-content: space-between;
                align-items: center;
                color: white;
                border-top-left-radius: 10px;
                border-top-right-radius: 10px;
            }
            
            .nailaide-header h3 {
                margin: 0;
                font-size: 18px;
            }
            
            .nailaide-close {
                background: none;
                border: none;
                color: white;
                font-size: 24px;
                cursor: pointer;
                padding: 0;
                line-height: 1;
            }
            
            .nailaide-chat-container {
                flex: 1;
                overflow: hidden;
                position: relative;
            }
            
            .nailaide-messages {
                height: 100%;
                overflow-y: auto;
                padding: 15px;
                background-color: #f9fafb;
            }
            
            .nailaide-message {
                margin-bottom: 15px;
                clear: both;
                max-width: 80%;
                word-break: break-word;
            }
            
            .nailaide-user-message {
                float: right;
            }
            
            .nailaide-ai-message {
                float: left;
            }
            
            .nailaide-bubble {
                padding: 12px 15px;
                border-radius: 18px;
                display: inline-block;
            }
            
            .nailaide-user-message .nailaide-bubble {
                background-color: #9333ea;
                color: white;
                border-bottom-right-radius: 4px;
            }
            
            .nailaide-ai-message .nailaide-bubble {
                background-color: white;
                color: #333;
                border: 1px solid #e0e0e0;
                border-bottom-left-radius: 4px;
            }
            
            .nailaide-input-area {
                padding: 15px;
                border-top: 1px solid #e5e7eb;
                display: flex;
            }
            
            .nailaide-input {
                flex: 1;
                padding: 10px 15px;
                border: 1px solid #d1d5db;
                border-radius: 20px;
                outline: none;
                font-size: 14px;
            }
            
            .nailaide-send {
                width: 36px;
                height: 36px;
                border: none;
                border-radius: 50%;
                margin-left: 10px;
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
                color: white;
            }
            
            /* Booking button style */
            .nailaide-booking-button {
                display: inline-block !important;
                background-color: #9333ea !important;
                color: white !important;
                padding: 12px 20px !important;
                border-radius: 25px !important;
                text-decoration: none !important;
                font-weight: bold !important;
                margin-top: 12px !important;
                text-align: center !important;
                transition: all 0.3s ease !important;
                box-shadow: 0 4px 8px rgba(147, 51, 234, 0.3) !important;
                border: none !important;
                cursor: pointer !important;
                font-size: 16px !important;
                width: 100% !important;
                max-width: 250px !important;
            }
            
            .nailaide-booking-button:hover {
                background-color: #7e22ce !important;
                transform: translateY(-2px) !important;
                box-shadow: 0 6px 12px rgba(147, 51, 234, 0.4) !important;
            }
        `;
        document.head.appendChild(styleElement);
    }
    
    // Set up event listeners for the widget
    function setupEventListeners() {
        const chatButton = document.querySelector('.nailaide-chat-button');
        const chatWindow = document.querySelector('.nailaide-chat-window');
        const closeButton = document.querySelector('.nailaide-close');
        const sendButton = document.querySelector('.nailaide-send');
        const inputField = document.querySelector('.nailaide-input');
        
        // Toggle chat window visibility
        chatButton.addEventListener('click', () => {
            debugLog('Chat button clicked');
            chatWindow.style.display = 'flex';
            chatButton.style.display = 'none';
            
            // Show welcome message if this is the first time
            const messages = document.querySelector('.nailaide-messages');
            if (messages && !messages.children.length) {
                addMessage('ai', CONFIG.welcomeMessage);
            }
            
            // Focus input field
            inputField.focus();
            
            updateDebugStatus('Chat opened');
        });
        
        // Close chat window
        closeButton.addEventListener('click', () => {
            debugLog('Close button clicked');
            chatWindow.style.display = 'none';
            chatButton.style.display = 'flex';
            updateDebugStatus('Chat closed');
        });
        
        // Send message when button is clicked
        sendButton.addEventListener('click', () => {
            sendUserMessage();
        });
        
        // Send message when Enter key is pressed
        inputField.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                sendUserMessage();
            }
        });
        
        debugLog('Event listeners set up');
    }
    
    // Send user message and get response
    function sendUserMessage() {
        const inputField = document.querySelector('.nailaide-input');
        const message = inputField.value.trim();
        
        if (!message) return;
        
        debugLog(`User message: ${message}`);
        updateDebugStatus('Processing message');
        
        // Clear input field
        inputField.value = '';
        
        // Add user message to chat
        addMessage('user', message);
        
        // Process message and get response
        processUserMessage(message);
    }
    
    // Add a message to the chat
    function addMessage(type, content) {
        const messagesContainer = document.querySelector('.nailaide-messages');
        
        const messageDiv = document.createElement('div');
        messageDiv.className = `nailaide-message nailaide-${type}-message`;
        
        const bubbleDiv = document.createElement('div');
        bubbleDiv.className = 'nailaide-bubble';
        
        // Handle AI messages that might contain HTML
        if (type === 'ai') {
            bubbleDiv.innerHTML = content;
        } else {
            bubbleDiv.textContent = content;
        }
        
        messageDiv.appendChild(bubbleDiv);
        messagesContainer.appendChild(messageDiv);
        
        // Scroll to bottom
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
        
        debugLog(`Added ${type} message`);
    }
    
    // Process user message and generate response
    function processUserMessage(message) {
        debugLog('Processing user message');
        
        // Add a small delay for natural feel
        setTimeout(() => {
            // Check if message is about booking
            if (isBookingRequest(message)) {
                debugLog('Booking request detected');
                updateDebugStatus('Generating booking response');
                const bookingResponse = generateBookingResponse();
                addMessage('ai', bookingResponse);
                return;
            }
            
            // Default response
            debugLog('Generic response');
            addMessage('ai', "I can help you with information about our nail salon services, booking appointments, or answering questions about our products. How can I assist you today?");
            updateDebugStatus('Ready');
        }, 500);
    }
    
    // Check if message is related to booking
    function isBookingRequest(message) {
        const bookingKeywords = ['book', 'booking', 'appointment', 'schedule', 'reservation', 'reserve'];
        const lowerMessage = message.toLowerCase();
        
        // Check each keyword
        for (const keyword of bookingKeywords) {
            if (lowerMessage.includes(keyword)) {
                debugLog(`Booking keyword found: ${keyword}`);
                return true;
            }
        }
        
        return false;
    }
    
    // Generate a response with booking link
    function generateBookingResponse() {
        debugLog('Generating booking response with URL: ' + CONFIG.bookingUrl);
        
        return `
            I'd be happy to help you book an appointment! You can use our online booking system.
            <br><br>
            <a href="${CONFIG.bookingUrl}" target="_blank" class="nailaide-booking-button">
                ${CONFIG.bookingButtonText}
            </a>
        `;
    }
    
    // Update debug panel status
    function updateDebugStatus(status) {
        if (!CONFIG.debugMode) return;
        
        const statusElement = document.getElementById('nailaide-status');
        const actionElement = document.getElementById('nailaide-last-action');
        
        if (statusElement) {
            statusElement.textContent = 'Ready';
        }
        
        if (actionElement) {
            actionElement.textContent = status;
        }
    }
    
    // Add global reset function
    window.resetNailAideWidget = function() {
        debugLog('Resetting widget');
        initializeWidget();
        updateDebugStatus('Widget reset');
    };
    
})();
