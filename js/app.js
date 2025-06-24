/**
 * DelaneNails Frontend JavaScript
 */

document.addEventListener('DOMContentLoaded', function() {
    // Initialize UI components
    initNavigation();
    initChatAssistant();
});

/**
 * Mobile navigation toggle
 */
function initNavigation() {
    const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
    const navMenu = document.querySelector('.nav-menu');
    
    if (mobileMenuToggle && navMenu) {
        mobileMenuToggle.addEventListener('click', function() {
            navMenu.classList.toggle('active');
        });
    }
}

/**
 * Chat assistant functionality
 */
function initChatAssistant() {
    const chatForm = document.getElementById('chat-form');
    const userInput = document.getElementById('user-message');
    const chatMessages = document.getElementById('chat-messages');
    
    if (!chatForm || !userInput || !chatMessages) return;
    
    chatForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const question = userInput.value.trim();
        if (!question) return;
        
        // Add user message to chat
        addMessageToChat('user', question);
        
        // Clear input
        userInput.value = '';
        
        // Show typing indicator
        const typingIndicator = addMessageToChat('bot', '<em>Typing...</em>');
        
        try {
            // Send request to AI
            const response = await fetch('/api/query', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ question })
            });
            
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            
            const data = await response.json();
            
            // Replace typing indicator with actual response
            typingIndicator.innerHTML = data.response;
        } catch (error) {
            console.error('Error:', error);
            
            // Replace typing indicator with error message
            typingIndicator.innerHTML = 'Sorry, I encountered an error. Please try again.';
        }
    });
}

/**
 * Add message to chat window
 */
function addMessageToChat(type, content) {
    const chatMessages = document.getElementById('chat-messages');
    const message = document.createElement('div');
    message.classList.add('message', type);
    message.innerHTML = content;
    
    chatMessages.appendChild(message);
    
    // Scroll to bottom of chat
    chatMessages.scrollTop = chatMessages.scrollHeight;
    
    return message;
}
