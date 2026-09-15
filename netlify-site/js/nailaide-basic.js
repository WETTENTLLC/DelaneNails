/**
 * Basic NailAide Widget Implementation
 * This is a simplified version for testing widget display issues
 */

// Create a simple global NailAide object
window.NailAide = {
    /**
     * Creates a widget instance
     * @param {Object} options - Widget configuration
     * @returns {Object} Widget instance
     */
    createWidget: function(options) {
        console.log('NailAide.createWidget called with options:', options);
        
        // Store options for later use
        this.options = options || {};
        
        // Return a widget instance with a mount method
        return {
            mount: function() {
                console.log('Widget.mount called');
                
                // Get the container
                const container = options.container;
                if (!container) {
                    console.error('No container provided for widget');
                    return;
                }
                
                // Apply some basic styling
                container.style.border = '2px solid #9333ea';
                container.style.borderRadius = '10px';
                container.style.overflow = 'hidden';
                container.style.backgroundColor = '#ffffff';
                container.style.boxShadow = '0 4px 8px rgba(0,0,0,0.1)';
                
                // Create a simple widget UI
                container.innerHTML = `
                    <div style="background-color: ${options.theme?.primaryColor || '#9333ea'}; color: white; padding: 15px; text-align: center; font-weight: bold;">
                        NailAide Chat
                    </div>
                    <div style="padding: 20px; height: calc(100% - 120px); overflow-y: auto;">
                        <div style="background-color: #f0f0f0; padding: 10px; border-radius: 10px; margin-bottom: 15px; display: inline-block;">
                            ${options.welcomeMessage || 'Hello! How can I help you today?'}
                        </div>
                    </div>
                    <div style="padding: 15px; border-top: 1px solid #eee; text-align: center;">
                        <input type="text" placeholder="Type your message..." 
                            style="width: 70%; padding: 8px; border: 1px solid #ddd; border-radius: 4px;">
                        <button style="
                            background-color: ${options.theme?.primaryColor || '#9333ea'}; 
                            color: white; 
                            border: none; 
                            padding: 8px 15px; 
                            border-radius: 4px; 
                            cursor: pointer;">
                            Send
                        </button>
                    </div>
                `;
                
                console.log('Basic widget UI created and mounted');
                
                // Add a book now button
                if (options.bookingUrl) {
                    const bookButton = document.createElement('a');
                    bookButton.href = options.bookingUrl;
                    bookButton.target = '_blank';
                    bookButton.style.display = 'inline-block';
                    bookButton.style.margin = '10px';
                    bookButton.style.backgroundColor = options.theme?.primaryColor || '#9333ea';
                    bookButton.style.color = 'white';
                    bookButton.style.padding = '8px 15px';
                    bookButton.style.borderRadius = '4px';
                    bookButton.style.textDecoration = 'none';
                    bookButton.textContent = 'Book Appointment';
                    
                    const footer = container.querySelector('div:last-child');
                    footer.appendChild(document.createElement('br'));
                    footer.appendChild(bookButton);
                }
            }
        };
    }
};

// Log when the file is loaded
console.log('Basic NailAide implementation loaded');
