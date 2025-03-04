/**
 * Emergency Widget Implementation
 * This is a simplified standalone widget that will display regardless of other issues
 */
(function() {
    console.log('🚨 Emergency widget initializing...');
    
    // Function to create the widget container if it doesn't exist
    function ensureContainer() {
        let container = document.getElementById('nailaide-root');
        if (!container) {
            console.log('Creating missing container');
            container = document.createElement('div');
            container.id = 'nailaide-root';
            document.body.appendChild(container);
        }
        
        // Apply essential styles directly to ensure visibility
        Object.assign(container.style, {
            position: 'fixed',
            bottom: '20px',
            right: '20px',
            width: '350px',
            height: '500px',
            zIndex: '999999',
            pointerEvents: 'auto',
            background: 'transparent'
        });
        
        return container;
    }
    
    // Create a simple chat button
    function createChatButton(container) {
        const chatButton = document.createElement('div');
        chatButton.id = 'emergency-chat-button';
        chatButton.innerHTML = '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M21 11.5C21.0034 12.8199 20.6951 14.1219 20.1 15.3C19.3944 16.7118 18.3098 17.8992 16.9674 18.7293C15.6251 19.5594 14.0782 19.9994 12.5 20C11.1801 20.0034 9.87812 19.6951 8.7 19.1L3 21L4.9 15.3C4.30493 14.1219 3.99656 12.8199 4 11.5C4.00061 9.92179 4.44061 8.37488 5.27072 7.03258C6.10083 5.69028 7.28825 4.6056 8.7 3.90001C9.87812 3.30494 11.1801 2.99659 12.5 3.00001H13C15.0843 3.11502 17.053 3.99479 18.5291 5.47089C20.0052 6.94699 20.885 8.91568 21 11V11.5Z" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>';
        
        // Apply essential styles directly
        Object.assign(chatButton.style, {
            position: 'absolute',
            bottom: '20px',
            right: '20px',
            width: '60px',
            height: '60px',
            borderRadius: '50%',
            backgroundColor: '#9333ea',
            color: 'white',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            cursor: 'pointer',
            boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
            zIndex: '999999'
        });
        
        // Add click event to show the chat window
        chatButton.addEventListener('click', function() {
            toggleChatWindow(container);
        });
        
        container.appendChild(chatButton);
        return chatButton;
    }
    
    // Create simple chat window
    function createChatWindow(container) {
        const chatWindow = document.createElement('div');
        chatWindow.id = 'emergency-chat-window';
        
        // Apply essential styles directly
        Object.assign(chatWindow.style, {
            position: 'absolute',
            bottom: '90px',
            right: '20px',
            width: '320px',
            height: '400px',
            backgroundColor: 'white',
            borderRadius: '10px',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
            display: 'none',
            flexDirection: 'column',
            zIndex: '999999',
            overflow: 'hidden'
        });
        
        // Add header
        const header = document.createElement('div');
        Object.assign(header.style, {
            padding: '15px',
            backgroundColor: '#9333ea',
            color: 'white',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
        });
        header.innerHTML = '<div style="font-weight: bold;">NailAide Assistant</div><div style="cursor: pointer; font-size: 24px;">&times;</div>';
        
        // Add close button event
        header.querySelector('div:last-child').addEventListener('click', function() {
            chatWindow.style.display = 'none';
        });
        
        // Add messages container
        const messagesContainer = document.createElement('div');
        Object.assign(messagesContainer.style, {
            flexGrow: '1',
            padding: '15px',
            overflowY: 'auto',
            backgroundColor: '#f9f9f9'
        });
        
        // Add welcome message
        const welcomeMessage = document.createElement('div');
        Object.assign(welcomeMessage.style, {
            marginBottom: '15px',
            padding: '10px 15px',
            borderRadius: '18px',
            maxWidth: '80%',
            backgroundColor: '#e6e6e6',
            marginRight: 'auto',
            wordWrap: 'break-word'
        });
        welcomeMessage.textContent = 'Hello! How can I help you today?';
        messagesContainer.appendChild(welcomeMessage);
        
        // Add input area
        const inputArea = document.createElement('div');
        Object.assign(inputArea.style, {
            display: 'flex',
            padding: '10px 15px',
            borderTop: '1px solid #e6e6e6'
        });
        
        // Add input field
        const inputField = document.createElement('input');
        Object.assign(inputField.style, {
            flexGrow: '1',
            padding: '8px 12px',
            border: '1px solid #ccc',
            borderRadius: '20px',
            outline: 'none'
        });
        inputField.placeholder = 'Type your question here...';
        
        // Add send button
        const sendButton = document.createElement('button');
        Object.assign(sendButton.style, {
            width: '36px',
            height: '36px',
            borderRadius: '50%',
            backgroundColor: '#9333ea',
            color: 'white',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            marginLeft: '10px',
            cursor: 'pointer',
            border: 'none'
        });
        sendButton.innerHTML = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M22 2L11 13" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M22 2L15 22L11 13L2 9L22 2Z" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>';
        
        // Add send functionality
        const sendMessage = function() {
            const message = inputField.value.trim();
            if (message) {
                // Add user message
                const userMessage = document.createElement('div');
                Object.assign(userMessage.style, {
                    marginBottom: '15px',
                    padding: '10px 15px',
                    borderRadius: '18px',
                    maxWidth: '80%',
                    backgroundColor: '#9333ea',
                    color: 'white',
                    marginLeft: 'auto',
                    wordWrap: 'break-word'
                });
                userMessage.textContent = message;
                messagesContainer.appendChild(userMessage);
                
                // Clear input field
                inputField.value = '';
                
                // Scroll to bottom
                messagesContainer.scrollTop = messagesContainer.scrollHeight;
                
                // Add AI response (after a delay to simulate thinking)
                setTimeout(function() {
                    const aiMessage = document.createElement('div');
                    Object.assign(aiMessage.style, {
                        marginBottom: '15px',
                        padding: '10px 15px',
                        borderRadius: '18px',
                        maxWidth: '80%',
                        backgroundColor: '#e6e6e6',
                        marginRight: 'auto',
                        wordWrap: 'break-word'
                    });
                    
                    let response;
                    const lowerMessage = message.toLowerCase();
                    
                    if (lowerMessage.includes('book') || lowerMessage.includes('appointment') || lowerMessage.includes('schedule')) {
                        response = 'You can book an appointment through our online scheduling system. Would you like me to open the booking page for you?';
                        
                        // Add booking button
                        setTimeout(function() {
                            const buttonContainer = document.createElement('div');
                            Object.assign(buttonContainer.style, {
                                marginBottom: '15px',
                                padding: '10px 15px',
                                borderRadius: '18px',
                                maxWidth: '80%',
                                backgroundColor: '#e6e6e6',
                                marginRight: 'auto'
                            });
                            
                            const bookButton = document.createElement('button');
                            Object.assign(bookButton.style, {
                                backgroundColor: '#9333ea',
                                color: 'white',
                                padding: '8px 16px',
                                border: 'none',
                                borderRadius: '20px',
                                cursor: 'pointer'
                            });
                            bookButton.textContent = 'Book Appointment';
                            
                            bookButton.addEventListener('click', function() {
                                window.open('https://delanesnaturalnailcare.booksy.com/', '_blank');
                            });
                            
                            buttonContainer.appendChild(bookButton);
                            messagesContainer.appendChild(buttonContainer);
                            messagesContainer.scrollTop = messagesContainer.scrollHeight;
                        }, 500);
                    } 
                    else if (lowerMessage.includes('hour') || lowerMessage.includes('open')) {
                        response = 'Our business hours are:\nMonday: 9:00 AM - 6:00 PM\nTuesday: 9:00 AM - 6:00 PM\nWednesday: 9:00 AM - 6:00 PM\nThursday: 9:00 AM - 6:00 PM\nFriday: 9:00 AM - 6:00 PM\nSaturday: 9:00 AM - 5:00 PM\nSunday: Closed';
                    }
                    else if (lowerMessage.includes('service') || lowerMessage.includes('price')) {
                        response = 'Here are some of our services:\nNatural Nail Manicure: $35 (45 min)\nGel Manicure: $45 (60 min)\nSpa Pedicure: $50 (50 min)\nDeluxe Pedicure: $65 (75 min)';
                    }
                    else if (lowerMessage.includes('contact') || lowerMessage.includes('phone') || lowerMessage.includes('email')) {
                        response = 'You can contact us at:\nPhone: (123) 456-7890\nEmail: info@delanesnailcare.com\nAddress: 123 Spa Lane, Beauty City, USA';
                    }
                    else {
                        response = "Thank you for your message. I'm here to help with booking appointments, answering questions about our services, hours, or providing general information about our nail care services. How can I assist you today?";
                    }
                    
                    aiMessage.textContent = response;
                    messagesContainer.appendChild(aiMessage);
                    
                    // Scroll to bottom
                    messagesContainer.scrollTop = messagesContainer.scrollHeight;
                }, 1000);
            }
        };
        
        // Add event listeners for sending messages
        sendButton.addEventListener('click', sendMessage);
        inputField.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                sendMessage();
            }
        });
        
        // Assemble the chat window
        inputArea.appendChild(inputField);
        inputArea.appendChild(sendButton);
        chatWindow.appendChild(header);
        chatWindow.appendChild(messagesContainer);
        chatWindow.appendChild(inputArea);
        
        container.appendChild(chatWindow);
        return chatWindow;
    }
    
    // Toggle chat window visibility
    function toggleChatWindow(container) {
        const chatWindow = container.querySelector('#emergency-chat-window');
        if (chatWindow.style.display === 'none') {
            chatWindow.style.display = 'flex';
            // Focus the input field
            setTimeout(function() {
                const inputField = chatWindow.querySelector('input');
                if (inputField) inputField.focus();
            }, 100);
        } else {
            chatWindow.style.display = 'none';
        }
    }
    
    // Initialize the emergency widget
    function initEmergencyWidget() {
        const container = ensureContainer();
        
        // Check if widget button already exists from other implementations
        if (!document.querySelector('.nailaide-chat-button') && !document.querySelector('#emergency-chat-button')) {
            console.log('Creating emergency chat button');
            createChatButton(container);
        }
        
        // Check if chat window already exists from other implementations
        if (!document.querySelector('.nailaide-chat-window') && !document.querySelector('#emergency-chat-window')) {
            console.log('Creating emergency chat window');
            createChatWindow(container);
        }
        
        console.log('🚨 Emergency widget initialized');
    }
    
    // Check for widget visibility and run the emergency init if needed
    function checkWidgetVisibility() {
        const anyWidgetButtonVisible = document.querySelector('.nailaide-chat-button:not([style*="display: none"]):not([style*="visibility: hidden"]):not([style*="opacity: 0"])') || 
                                       document.querySelector('#emergency-chat-button:not([style*="display: none"]):not([style*="visibility: hidden"]):not([style*="opacity: 0"])');
        
        if (!anyWidgetButtonVisible) {
            console.log('No visible widget button found, initializing emergency widget');
            initEmergencyWidget();
        } else {
            console.log('Widget button found and is visible');
        }
    }
    
    // Run check when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function() {
            setTimeout(checkWidgetVisibility, 1000);
        });
    } else {
        setTimeout(checkWidgetVisibility, 1000);
    }
    
    // Run another check after window is fully loaded
    window.addEventListener('load', function() {
        setTimeout(checkWidgetVisibility, 2000);
    });
    
})();
