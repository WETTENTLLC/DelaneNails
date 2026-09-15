/**
 * NailAide Global Integration
 * Include this file on all pages where you want the chat assistant to appear
 */

(function() {
    console.log('NailAide global script initializing...');
    
    // Helper function to check if NailAide is already loaded (prevents duplicate instances)
    function isNailAideLoaded() {
        return document.getElementById('nail-aide-widget') !== null;
    }
    
    // Only load if not already present
    if (!isNailAideLoaded()) {
        // Load standalone version with fallback options
        function loadNailAide() {
            console.log('Loading NailAide for site-wide access...');
            
            // Ensure cleanup has run
            if (!window.NAILAIDE_CLEANUP_COMPLETE) {
                console.log('Running cleanup before loading NailAide...');
                const cleanupScript = document.createElement('script');
                cleanupScript.src = '/js/nailaide-cleanup.js';
                cleanupScript.onload = () => {
                    console.log('Cleanup completed, now loading NailAide...');
                    loadNailAideScript();
                };
                cleanupScript.onerror = () => {
                    console.warn('Failed to load cleanup script, attempting to load NailAide anyway...');
                    loadNailAideScript();
                };
                document.body.appendChild(cleanupScript);
            } else {
                loadNailAideScript();
            }
        }
        
        function loadNailAideScript() {
            // Try to load from different possible locations
            loadScriptWithFallbacks([
                '/nail-aide/nailaide-standalone.js',
                '/js/nailaide-standalone.js',
                '../nail-aide/nailaide-standalone.js',
                '../js/nailaide-standalone.js'
            ]);
        }
        
        // Try multiple script paths
        function loadScriptWithFallbacks(scriptUrls, currentIndex = 0) {
            if (currentIndex >= scriptUrls.length) {
                console.error('Failed to load NailAide from all known locations');
                return;
            }
            
            const scriptUrl = scriptUrls[currentIndex];
            console.log(`Attempting to load NailAide from: ${scriptUrl}`);
            
            const script = document.createElement('script');
            script.src = scriptUrl;
            
            script.onload = () => {
                console.log(`Successfully loaded NailAide from: ${scriptUrl}`);
            };
            
            script.onerror = () => {
                console.warn(`Failed to load NailAide from: ${scriptUrl}, trying next location...`);
                loadScriptWithFallbacks(scriptUrls, currentIndex + 1);
            };
            
            document.body.appendChild(script);
        }
        
        // Load NailAide when page is ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', loadNailAide);
        } else {
            loadNailAide();
        }
    }
    
    // Enhanced message processor that detects booking requests
    function processMessage(message) {
        // Check if message is related to booking
        if (isBookingRequest(message)) {
            return generateBookingResponse();
        }
    }
    
    // Function to detect if a message is about booking
    function isBookingRequest(message) {
        const bookingKeywords = [
            'book', 'booking', 'appointment', 'schedule', 'reservation', 
            'reserve', 'book appointment', 'make appointment', 'set up appointment'
        ];
        
        message = message.toLowerCase();
        return bookingKeywords.some(keyword => message.includes(keyword));
    }
    
    // Function to generate a booking response with clickable link
    function generateBookingResponse() {
        const config = window.NAILAIDE_CONFIG;
        if (!config || !config.booking || !config.booking.enabled) {
            return "I'm sorry, our booking system is currently unavailable.";
        }
        
        // Create booking message with a clickable link
        let responseTemplate = config.responseTemplates.bookingQuestion || 
            "You can book an appointment online. [Click here to book now]({bookingUrl}).";
        
        // Replace placeholder with actual booking URL
        const response = responseTemplate.replace('{bookingUrl}', config.booking.bookingUrl);
        
        // Convert markdown-style links to HTML
        return convertMarkdownLinksToHtml(response);
    }
    
    // Function to convert markdown links to HTML
    function convertMarkdownLinksToHtml(text) {
        return text.replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" target="_blank" class="nailaide-link">$1</a>');
    }
    
    // Enhanced reply handler to process HTML content
    function displayReply(reply) {
        // If the reply contains HTML links, ensure they're rendered properly
        const messageElement = document.createElement('div');
        messageElement.className = 'nailaide-message nailaide-ai-message';
        messageElement.innerHTML = reply; // Use innerHTML to render HTML links
    }
    
    // Add styling for links in chat
    const linkStyle = document.createElement('style');
    linkStyle.textContent = `
        .nailaide-link {
            color: #9333ea;
            text-decoration: underline;
            font-weight: bold;
            cursor: pointer;
        }
        .nailaide-link:hover {
            text-decoration: none;
        }
    `;
    document.head.appendChild(linkStyle);
})();
