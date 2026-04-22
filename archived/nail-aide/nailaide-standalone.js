/**
 * NailAide Standalone Chat Assistant
 * A simplified chat assistant for nail salons
 */

(function() {
    console.log('NailAide standalone script initializing...');
    
    // First, remove any existing instances
    const existingWidget = document.getElementById('nail-aide-widget');
    if (existingWidget) {
        console.log('Found existing widget, removing before creating new one');
        existingWidget.remove();
    }
    
    // Load configuration or use defaults
    const config = window.NAILAIDE_CONFIG || {};
    const primaryColor = config.primaryColor || '#f06292';
    const secondaryColor = config.secondaryColor || '#f8bbd0';
    const userBubbleColor = config.userBubbleColor || '#e1f5fe';
    const widgetTitle = config.widgetTitle || 'NailAide Assistant';
    const welcomeMessage = config.welcomeMessage || 'Hello! I\'m NailAide, your virtual assistant. How can I help you today?';
    const initiallyMinimized = config.hasOwnProperty('initiallyMinimized') ? config.initiallyMinimized : false;
    
    // Check if we should exclude chat from this page
    function shouldExcludeChat() {
        if (!config.excludedPages) return false;
        
        const currentPath = window.location.pathname;
        return config.excludedPages.some(page => currentPath.includes(page));
    }
    
    // Don't load on excluded pages
    if (shouldExcludeChat()) {
        console.log('NailAide: Skipping chat on excluded page');
        return;
    }
    
    // Don't load on mobile if disabled
    if (isMobileDevice() && config.enableOnMobile === false) {
        console.log('NailAide: Skipping chat on mobile device');
        return;
    }
    
    // Detect mobile devices
    function isMobileDevice() {
        return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    }
    
    // Create the chat widget with minimize/maximize functionality
    function createChatWidget() {
        console.log('Creating chat widget...');
        
        // Create widget container
        const widgetContainer = document.createElement('div');
        widgetContainer.id = 'nail-aide-widget';
        widgetContainer.style.position = 'fixed';
        widgetContainer.style.bottom = '20px';
        widgetContainer.style.right = '20px';
        widgetContainer.style.width = '350px';
        widgetContainer.style.height = initiallyMinimized ? '60px' : '450px';
        widgetContainer.style.backgroundColor = '#fff';
        widgetContainer.style.borderRadius = '10px';
        widgetContainer.style.boxShadow = '0 2px 10px rgba(0,0,0,0.2)';
        widgetContainer.style.display = 'flex';
        widgetContainer.style.flexDirection = 'column';
        widgetContainer.style.overflow = 'hidden';
        widgetContainer.style.zIndex = '999999'; // Higher z-index to ensure visibility
        widgetContainer.style.transition = 'height 0.3s ease';
        
        // Create header with toggle button
        const header = document.createElement('div');
        header.style.backgroundColor = primaryColor;
        header.style.color = '#fff';
        header.style.padding = '10px 15px';
        header.style.fontWeight = 'bold';
        header.style.display = 'flex';
        header.style.justifyContent = 'space-between';
        header.style.alignItems = 'center';
        header.style.cursor = 'pointer';
        
        const headerTitle = document.createElement('div');
        headerTitle.innerHTML = widgetTitle;
        header.appendChild(headerTitle);
        
        const toggleBtn = document.createElement('div');
        toggleBtn.innerHTML = initiallyMinimized ? '▲' : '▼';
        toggleBtn.style.transition = 'transform 0.3s';
        header.appendChild(toggleBtn);
        
        widgetContainer.appendChild(header);
        
        // Create chat area
        const chatArea = document.createElement('div');
        chatArea.id = 'chat-messages';
        chatArea.style.flex = '1';
        chatArea.style.padding = '10px';
        chatArea.style.overflowY = 'auto';
        chatArea.style.display = initiallyMinimized ? 'none' : 'flex';
        chatArea.style.flexDirection = 'column';
        widgetContainer.appendChild(chatArea);
        
        // Add welcome message
        const welcomeMessageEl = document.createElement('div');
        welcomeMessageEl.style.alignSelf = 'flex-start';
        welcomeMessageEl.style.backgroundColor = secondaryColor;
        welcomeMessageEl.style.padding = '10px';
        welcomeMessageEl.style.borderRadius = '10px';
        welcomeMessageEl.style.marginBottom = '10px';
        welcomeMessageEl.style.maxWidth = '80%';
        welcomeMessageEl.innerHTML = welcomeMessage;
        chatArea.appendChild(welcomeMessageEl);
        
        // Create input area
        const inputArea = document.createElement('div');
        inputArea.style.borderTop = '1px solid #eee';
        inputArea.style.padding = '10px';
        inputArea.style.display = initiallyMinimized ? 'none' : 'flex';
        
        const inputField = document.createElement('input');
        inputField.id = 'user-message';
        inputField.type = 'text';
        inputField.placeholder = 'Ask me anything...';
        inputField.style.flex = '1';
        inputField.style.padding = '8px';
        inputField.style.border = '1px solid #ddd';
        inputField.style.borderRadius = '4px';
        inputField.style.marginRight = '10px';
        
        const sendButton = document.createElement('button');
        sendButton.id = 'send-message';
        sendButton.innerHTML = 'Send';
        sendButton.style.backgroundColor = primaryColor;
        sendButton.style.color = '#fff';
        sendButton.style.border = 'none';
        sendButton.style.borderRadius = '4px';
        sendButton.style.padding = '8px 15px';
        sendButton.style.cursor = 'pointer';
        
        inputArea.appendChild(inputField);
        inputArea.appendChild(sendButton);
        widgetContainer.appendChild(inputArea);
        
        // Add event listeners
        sendButton.addEventListener('click', handleSendMessage);
        inputField.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                handleSendMessage();
            }
        });
        
        // Toggle chat open/closed
        header.addEventListener('click', function() {
            const isMinimized = widgetContainer.style.height === '60px';
            
            widgetContainer.style.height = isMinimized ? '450px' : '60px';
            chatArea.style.display = isMinimized ? 'flex' : 'none';
            inputArea.style.display = isMinimized ? 'flex' : 'none';
            toggleBtn.innerHTML = isMinimized ? '▼' : '▲';
            
            // Focus input when maximizing
            if (isMinimized) {
                setTimeout(() => inputField.focus(), 300);
            }
        });
        
        // Add to document
        document.body.appendChild(widgetContainer);
        
        console.log('Chat widget created successfully');
        
        // Special flag to indicate widget is loaded
        window.NAILAIDE_LOADED = true;
    }
    
    // Handle sending messages
    function handleSendMessage() {
        const inputField = document.getElementById('user-message');
        const message = inputField.value.trim();
        
        if (message) {
            displayUserMessage(message);
            processUserMessage(message);
            inputField.value = '';
        }
    }
    
    // Display user message in chat
    function displayUserMessage(message) {
        const chatArea = document.getElementById('chat-messages');
        const messageElement = document.createElement('div');
        messageElement.style.alignSelf = 'flex-end';
        messageElement.style.backgroundColor = userBubbleColor;
        messageElement.style.padding = '10px';
        messageElement.style.borderRadius = '10px';
        messageElement.style.marginBottom = '10px';
        messageElement.style.maxWidth = '80%';
        messageElement.innerHTML = message;
        chatArea.appendChild(messageElement);
        chatArea.scrollTop = chatArea.scrollHeight;
    }
    
    // Display bot message in chat
    function displayBotMessage(message) {
        const chatArea = document.getElementById('chat-messages');
        const messageElement = document.createElement('div');
        messageElement.style.alignSelf = 'flex-start';
        messageElement.style.backgroundColor = secondaryColor;
        messageElement.style.padding = '10px';
        messageElement.style.borderRadius = '10px';
        messageElement.style.marginBottom = '10px';
        messageElement.style.maxWidth = '80%';
        messageElement.innerHTML = message;
        chatArea.appendChild(messageElement);
        chatArea.scrollTop = chatArea.scrollHeight;
    }
    
    // Process user message and provide response
    function processUserMessage(message) {
        // Simulate typing indicator
        displayBotMessage('<em>Typing...</em>');
        
        // Get the last message element (typing indicator)
        const chatArea = document.getElementById('chat-messages');
        const typingIndicator = chatArea.lastChild;
        
        // Business info from meta tags
        const businessName = getMetaContent('business-name') || 'DelaneNails';
        const businessHours = getMetaContent('business-hours') || 'Mon-Sat: 9am-7pm, Sun: 10am-5pm';
        const businessPhone = getMetaContent('business-phone') || '(555) 123-4567';
        const businessEmail = getMetaContent('business-email') || 'info@delanenails.com';
        const businessAddress = getMetaContent('business-address') || '123 Beauty Lane, Anytown';
        
        // Simple response mapping based on keywords
        setTimeout(() => {
            let response;
            const lowerMessage = message.toLowerCase();
            
            if (lowerMessage.includes('hour') || lowerMessage.includes('open')) {
                response = `Our business hours are ${businessHours}. We hope to see you soon!`;
            }
            else if (lowerMessage.includes('service') || lowerMessage.includes('offer')) {
                response = `At ${businessName}, we offer a variety of services including manicures, pedicures, gel polish, nail extensions, nail art, and paraffin treatments. Would you like to know more about any specific service?`;
            }
            else if (lowerMessage.includes('book') || lowerMessage.includes('appointment')) {
                response = `You can book an appointment by calling us at ${businessPhone} or by sending an email to ${businessEmail}. We recommend booking at least 3 days in advance for regular services and 5 days for special occasions.`;
            }
            else if (lowerMessage.includes('product') || lowerMessage.includes('sell')) {
                response = `We sell a range of professional nail care products including strengthening treatments, cuticle oils, hand creams, and nail polishes from premium brands. Stop by our salon to check out our current inventory!`;
            }
            else if (lowerMessage.includes('gel') && (lowerMessage.includes('cost') || lowerMessage.includes('price'))) {
                response = `Our classic gel manicure starts at $35. This includes nail shaping, cuticle care, gel polish application, and a hand massage. Premium gel services with additional treatments start at $45.`;
            }
            else if (lowerMessage.includes('art')) {
                response = `Yes! We specialize in nail art! Our talented nail technicians can create anything from simple designs to elaborate artwork. Prices for nail art start at $5 per nail for simple designs and vary based on complexity.`;
            }
            else if (lowerMessage.includes('location') || lowerMessage.includes('address') || lowerMessage.includes('where')) {
                response = `We're located at ${businessAddress}. We have convenient parking available right in front of our salon.`;
            }
            else if (lowerMessage.includes('contact') || lowerMessage.includes('phone') || lowerMessage.includes('call')) {
                response = `You can reach us at ${businessPhone} or email us at ${businessEmail}. We typically respond to emails within 24 hours.`;
            }
            else {
                response = `Thank you for your message! If you have questions about our nail services, hours, or would like to book an appointment, please let me know. For immediate assistance, please call us at ${businessPhone}.`;
            }
            
            // Replace typing indicator with actual response
            typingIndicator.innerHTML = response;
            typingIndicator.style.backgroundColor = secondaryColor;
        }, 1000);
    }
    
    // Helper function to get meta tag content
    function getMetaContent(name) {
        const meta = document.querySelector(`meta[name="${name}"]`);
        return meta ? meta.getAttribute('content') : null;
    }
    
    // Initialize when the document is fully loaded
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', createChatWidget);
    } else {
        createChatWidget();
    }
})();
