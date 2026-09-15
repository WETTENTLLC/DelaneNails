/**
 * NailAide Standalone Widget - Enhanced with Booksy Availability
 */

(function() {
    console.log('NailAide Enhanced Standalone Widget Initializing...');
    
    // Configuration (hardcoded for reliability)
    const CONFIG = {
        primaryColor: '#9333ea',
        bookingUrl: 'https://booksy.com/en-us/512223_delanes-natural-nail-care_nail-salon_134763_greensboro',
        welcomeMessage: 'Hello! How can I help you today? Ask about our services, availability, or booking an appointment.',
        widgetTitle: 'Chat with DelaneNails',
        bookingButtonText: 'Book Appointment Now',
        debugMode: true
    };
    
    // Initialize as soon as possible
    initWidget();
    
    function initWidget() {
        try {
            console.log('Creating enhanced widget');
            
            // Create root element if it doesn't exist
            let root = document.getElementById('nailaide-root');
            if (!root) {
                console.log('Creating root element');
                root = document.createElement('div');
                root.id = 'nailaide-root';
                document.body.appendChild(root);
            } else {
                console.log('Root element already exists, clearing it');
                root.innerHTML = '';
            }
            
            // Add styles
            addStyles();
            
            // Create widget HTML
            createHTML(root);
            
            // Load dependencies
            loadDependencies()
                .then(() => {
                    // Set up event handlers
                    setupEvents();
                    console.log('Enhanced widget created successfully');
                })
                .catch(error => {
                    console.error('Error loading dependencies:', error);
                    // Fall back to basic functionality
                    setupEvents();
                    console.log('Widget created with basic functionality');
                });
        } catch (error) {
            console.error('Failed to initialize widget:', error);
            
            // Create visible error message
            showErrorMessage('Widget initialization failed: ' + error.message);
        }
    }
    
    function loadDependencies() {
        return new Promise((resolve, reject) => {
            // Load Booksy integration
            const booksyScript = document.createElement('script');
            booksyScript.src = 'js/booksy-integration.js';
            booksyScript.onload = () => {
                // Load availability module after Booksy integration
                const availabilityScript = document.createElement('script');
                availabilityScript.src = 'js/nailaide-availability.js';
                availabilityScript.onload = resolve;
                availabilityScript.onerror = reject;
                document.body.appendChild(availabilityScript);
            };
            booksyScript.onerror = reject;
            document.body.appendChild(booksyScript);
        });
    }
    
    function showErrorMessage(message) {
        const errorDiv = document.createElement('div');
        errorDiv.style.position = 'fixed';
        errorDiv.style.bottom = '80px';
        errorDiv.style.right = '20px';
        errorDiv.style.padding = '10px';
        errorDiv.style.background = '#ff4444';
        errorDiv.style.color = 'white';
        errorDiv.style.borderRadius = '5px';
        errorDiv.style.zIndex = '999999';
        errorDiv.style.boxShadow = '0 2px 10px rgba(0,0,0,0.2)';
        errorDiv.textContent = message;
        document.body.appendChild(errorDiv);
    }
    
    // Rest of the functions (addStyles, createHTML, setupEvents) remain similar to before
    
    function addStyles() {
        // Same CSS as before
        const styleEl = document.createElement('style');
        styleEl.textContent = `
            /* Base widget styles */
            #nailaide-root {
                position: fixed !important;
                bottom: 20px !important;
                right: 20px !important;
                z-index: 999999 !important;
                font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif !important;
                box-sizing: border-box !important;
                color: #333 !important;
            }
            
            #nailaide-root * {
                box-sizing: border-box !important;
            }
            
            /* Chat button */
            .nailaide-chat-button {
                position: fixed !important;
                bottom: 20px !important;
                right: 20px !important;
                width: auto !important;
                min-width: 60px !important;
                padding: 0 20px 0 15px !important;
                height: 60px !important;
                border-radius: 30px !important;
                background-color: ${CONFIG.primaryColor} !important;
                color: white !important;
                display: flex !important;
                justify-content: center !important;
                align-items: center !important;
                cursor: pointer !important;
                box-shadow: 0 4px 8px rgba(0,0,0,0.2) !important;
                z-index: 999999 !important;
                transition: transform 0.3s ease !important;
                font-family: inherit !important;
            }
            
            .nailaide-chat-button:hover {
                transform: scale(1.05) !important;
            }
            
            .nailaide-chat-button-text {
                font-size: 16px !important;
                color: white !important;
                margin-left: 8px !important;
                font-weight: normal !important;
            }
            
            /* Chat window */
            .nailaide-chat-window {
                position: fixed !important;
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
                transition: all 0.3s ease !important;
                font-family: inherit !important;
            }
            
            .nailaide-header {
                padding: 15px !important;
                display: flex !important;
                justify-content: space-between !important;
                align-items: center !important;
                color: white !important;
                background-color: ${CONFIG.primaryColor} !important;
            }
            
            .nailaide-header h3 {
                margin: 0 !important;
                font-size: 18px !important;
                font-weight: bold !important;
            }
            
            .nailaide-close {
                background: none !important;
                border: none !important;
                color: white !important;
                font-size: 24px !important;
                cursor: pointer !important;
                padding: 0 !important;
                line-height: 1 !important;
            }
            
            .nailaide-chat-container {
                flex: 1 !important;
                overflow: hidden !important;
                position: relative !important;
            }
            
            .nailaide-messages {
                height: 100% !important;
                overflow-y: auto !important;
                padding: 15px !important;
                background-color: #f9fafb !important;
            }
            
            .nailaide-message {
                margin-bottom: 15px !important;
                clear: both !important;
                max-width: 80% !important;
                word-break: break-word !important;
            }
            
            .nailaide-user-message {
                float: right !important;
            }
            
            .nailaide-ai-message {
                float: left !important;
            }
            
            .nailaide-bubble {
                padding: 12px 15px !important;
                border-radius: 18px !important;
                display: inline-block !important;
                line-height: 1.4 !important;
            }
            
            .nailaide-user-message .nailaide-bubble {
                background-color: ${CONFIG.primaryColor} !important;
                color: white !important;
                border-bottom-right-radius: 4px !important;
            }
            
            .nailaide-ai-message .nailaide-bubble {
                background-color: white !important;
                color: #333 !important;
                border: 1px solid #e0e0e0 !important;
                border-bottom-left-radius: 4px !important;
            }
            
            .nailaide-input-area {
                padding: 15px !important;
                border-top: 1px solid #e5e7eb !important;
                display: flex !important;
                background-color: white !important;
            }
            
            .nailaide-input {
                flex: 1 !important;
                padding: 10px 15px !important;
                border: 1px solid #d1d5db !important;
                border-radius: 20px !important;
                outline: none !important;
                font-size: 14px !important;
                font-family: inherit !important;
            }
            
            .nailaide-send {
                width: 36px !important;
                height: 36px !important;
                border: none !important;
                border-radius: 50% !important;
                margin-left: 10px !important;
                background-color: ${CONFIG.primaryColor} !important;
                cursor: pointer !important;
                display: flex !important;
                align-items: center !important;
                justify-content: center !important;
                color: white !important;
            }
            
            /* Booking button */
            .nailaide-booking-button {
                display: inline-block !important;
                background-color: ${CONFIG.primaryColor} !important;
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
            }
            
            /* Debug panel */
            .nailaide-debug-panel {
                position: fixed !important;
                bottom: 90px !important;
                right: 390px !important;
                background: rgba(0,0,0,0.8) !important;
                color: white !important;
                padding: 10px !important;
                border-radius: 5px !important;
                font-size: 12px !important;
                z-index: 10001 !important;
                font-family: monospace !important;
            }
            
            /* Mobile adjustments */
            @media (max-width: 480px) {
                .nailaide-chat-window {
                    width: calc(100% - 40px) !important;
                }
            }

            /* Availability list styling */
            .nailaide-availability-list {
                margin: 10px 0 !important;
                padding: 0 !important;
                list-style: none !important;
            }
            
            .nailaide-availability-list li {
                padding: 5px 0 !important;
                border-bottom: 1px solid #eee !important;
            }
            
            .nailaide-time-slot {
                display: inline-block !important;
                background: #f0f0f0 !important;
                border-radius: 12px !important;
                padding: 2px 8px !important;
                margin: 2px !important;
                font-size: 12px !important;
            }
        `;
        document.head.appendChild(styleEl);
    }
    
    function createHTML(container) {
        // Chat button
        const chatButton = document.createElement('div');
        chatButton.className = 'nailaide-chat-button';
        chatButton.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
            </svg>
            <span class="nailaide-chat-button-text">Chat with us</span>
        `;
        container.appendChild(chatButton);
        
        // Chat window (initially hidden)
        const chatWindow = document.createElement('div');
        chatWindow.className = 'nailaide-chat-window';
        chatWindow.style.display = 'none';
        
        chatWindow.innerHTML = `
            <div class="nailaide-header">
                <h3>${CONFIG.widgetTitle}</h3>
                <button class="nailaide-close">&times;</button>
            </div>
            <div class="nailaide-chat-container">
                <div class="nailaide-messages">
                    <!-- Messages will appear here -->
                </div>
            </div>
            <div class="nailaide-input-area">
                <input type="text" class="nailaide-input" placeholder="Type your message...">
                <button class="nailaide-send">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <line x1="22" y1="2" x2="11" y2="13"></line>
                        <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                    </svg>
                </button>
            </div>
        `;
        container.appendChild(chatWindow);
        
        if (CONFIG.debugMode) {
            // Create debug panel
            const debugPanel = document.createElement('div');
            debugPanel.className = 'nailaide-debug-panel';
            debugPanel.innerHTML = `
                <div>Widget Status: <span id="nailaide-status">Active</span></div>
                <div>Last Action: <span id="nailaide-last-action">Initialized</span></div>
                <button onclick="resetNailAideStandaloneWidget()" style="background: #f44336; border: none; color: white; padding: 5px; margin-top: 5px; border-radius: 3px; cursor: pointer;">Reset Widget</button>
            `;
            document.body.appendChild(debugPanel);
        }
    }
    
    function setupEvents() {
        // Get elements
        const chatButton = document.querySelector('.nailaide-chat-button');
        const chatWindow = document.querySelector('.nailaide-chat-window');
        const closeButton = document.querySelector('.nailaide-close');
        const sendButton = document.querySelector('.nailaide-send');
        const inputField = document.querySelector('.nailaide-input');
        
        // Open chat when button is clicked
        chatButton.addEventListener('click', function() {
            chatWindow.style.display = 'flex';
            chatButton.style.display = 'none';
            
            // Add welcome message if this is first time
            const messages = document.querySelector('.nailaide-messages');
            if (messages && !messages.children.length) {
                addMessage('ai', CONFIG.welcomeMessage);
            }
            
            // Focus on input field
            setTimeout(() => {
                inputField.focus();
            }, 100);
            
            updateDebugStatus('Chat opened');
        });
        
        // Close chat when close button is clicked
        closeButton.addEventListener('click', function() {
            chatWindow.style.display = 'none';
            chatButton.style.display = 'flex';
            updateDebugStatus('Chat closed');
        });
        
        // Send message when button is clicked
        sendButton.addEventListener('click', function() {
            sendMessage();
        });
        
        // Send message when Enter is pressed
        inputField.addEventListener('keypress', function(event) {
            if (event.key === 'Enter') {
                sendMessage();
            }
        });
        
        console.log('Event listeners set up');
    }
    
    function sendMessage() {
        const inputField = document.querySelector('.nailaide-input');
        const message = inputField.value.trim();
        
        if (!message) return;
        
        console.log('User sent message:', message);
        updateDebugStatus('Processing message: ' + message);
        
        // Clear input field
        inputField.value = '';
        
        // Add user message to chat
        addMessage('user', message);
        
        // Process message and get response
        processUserMessage(message)
            .then(response => {
                addMessage('ai', response);
                updateDebugStatus('Message processed');
            })
            .catch(error => {
                console.error('Error processing message:', error);
                addMessage('ai', "I'm sorry, I encountered an error processing your message. Please try again.");
                updateDebugStatus('Error processing message');
            });
    }
    
    function addMessage(type, content) {
        const messagesContainer = document.querySelector('.nailaide-messages');
        
        // Create message element
        const messageDiv = document.createElement('div');
        messageDiv.className = `nailaide-message nailaide-${type}-message`;
        
        // Create bubble element
        const bubbleDiv = document.createElement('div');
        bubbleDiv.className = 'nailaide-bubble';
        
        // Set content (using innerHTML for AI messages that may have HTML)
        if (type === 'ai') {
            bubbleDiv.innerHTML = content;
        } else {
            bubbleDiv.textContent = content;
        }
        
        messageDiv.appendChild(bubbleDiv);
        messagesContainer.appendChild(messageDiv);
        
        // Scroll to bottom
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }
    
    function processUserMessage(message) {
        // Try to use enhanced availability detection if available
        if (window.NailAideAvailability) {
            const availabilityQuestion = NailAideAvailability.detectAvailabilityQuestion(message);
            
            if (availabilityQuestion) {
                return NailAideAvailability.generateAvailabilityResponse(availabilityQuestion);
            }
        }
        
        // Check for basic booking patterns
        if (isBookingRequest(message)) {
            return Promise.resolve(generateBookingResponse());
        }
        
        // Default response for other messages
        return Promise.resolve("I can help you with information about our nail salon services, booking appointments, or answering questions about our products. How can I assist you today?");
    }
    
    function isBookingRequest(message) {
        const bookingKeywords = ['book', 'booking', 'appointment', 'schedule', 'reservation', 'reserve'];
        const lowerMessage = message.toLowerCase();
        
        for (const keyword of bookingKeywords) {
            if (lowerMessage.includes(keyword)) {
                return true;
            }
        }
        
        return false;
    }
    
    function generateBookingResponse() {
        return `
            I'd be happy to help you book an appointment! You can use our online booking system.
            <br><br>
            <a href="${CONFIG.bookingUrl}" target="_blank" class="nailaide-booking-button">
                ${CONFIG.bookingButtonText}
            </a>
        `;
    }
    
    function updateDebugStatus(action) {
        if (!CONFIG.debugMode) return;
        
        const actionElement = document.getElementById('nailaide-last-action');
        if (actionElement) {
            actionElement.textContent = action;
        }
    }
    
    // Make reset function globally available
    window.resetNailAideStandaloneWidget = function() {
        console.log('Resetting NailAide widget...');
        
        // Remove existing elements
        const root = document.getElementById('nailaide-root');
        if (root) {
            root.innerHTML = '';
        }
        
        const debugPanel = document.querySelector('.nailaide-debug-panel');
        if (debugPanel) {
            debugPanel.remove();
        }
        
        // Reinitialize
        initWidget();
    };
})();
