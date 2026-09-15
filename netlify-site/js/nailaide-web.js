/**
 * NailAide Web Integration
 * Web-friendly version of NailAide for the DelaneNails website
 */

// Configuration - respect external debug flag if set
const DEBUG = window.NAILAIDE_DEBUG || true;
const debugLog = message => {
  if (DEBUG) console.log(`[NailAide Web] ${message}`);
};

debugLog('NailAide script loaded');

// Initialize conversation history from localStorage if available
let conversationHistory = [];
try {
  const savedHistory = localStorage.getItem('nailaide_history');
  if (savedHistory) {
    conversationHistory = JSON.parse(savedHistory);
    debugLog(`Loaded ${conversationHistory.length} conversation items from storage`);
  }
} catch (error) {
  console.error("Failed to load conversation history:", error);
}

// Save conversation to localStorage
const saveConversation = () => {
  try {
    localStorage.setItem('nailaide_history', JSON.stringify(conversationHistory));
  } catch (error) {
    console.error("Failed to save conversation history:", error);
  }
};

// Salon information loaded from meta tags
const salonInfo = {
  name: document.querySelector('meta[name="business-name"]')?.content || "DelaneNails",
  phone: document.querySelector('meta[name="business-phone"]')?.content || "(555) 123-4567",
  email: document.querySelector('meta[name="business-email"]')?.content || "info@delanenails.com",
  address: document.querySelector('meta[name="business-address"]')?.content || "123 Beauty Lane",
  hours: document.querySelector('meta[name="business-hours"]')?.content || "Mon-Sat: 9am-7pm, Sun: 10am-5pm"
};

debugLog(`Loaded salon info: ${salonInfo.name}, ${salonInfo.phone}`);

// Products cache
let productsCache = null;

// Load products from JSON file
async function loadProducts() {
  if (productsCache) return productsCache;
  
  debugLog("Loading products data...");
  try {
    const response = await fetch('/data/products.json');
    if (!response.ok) {
      throw new Error(`Failed to fetch products: ${response.status}`);
    }
    const data = await response.json();
    productsCache = data.products;
    debugLog(`Loaded ${productsCache.length} products`);
    return productsCache;
  } catch (error) {
    console.error("Error loading products:", error);
    return [];
  }
}

// Extract services from the website
function extractServices() {
  const services = [];
  
  // Try to find services in the DOM
  document.querySelectorAll('.service-item, .service-name, .service').forEach(el => {
    services.push(el.textContent.trim());
  });
  
  // If no services found, use default
  if (services.length === 0) {
    return ["Manicures", "Pedicures", "Nail Art", "Gel Polish", "Acrylic Extensions"];
  }
  
  return services;
}

/**
 * Handle user query
 */
async function handleUserQuery(query) {
  debugLog(`Handling query: "${query}"`);
  
  // Add to conversation history
  conversationHistory.push({ role: "user", content: query });
  if (conversationHistory.length > 10) {
    conversationHistory.splice(0, 2);
  }
  
  let response = "";
  const queryLower = query.toLowerCase();
  
  // Check for products query
  if (queryLower.includes('product')) {
    debugLog('Product query detected');
    const products = await loadProducts();
    
    if (products && products.length > 0) {
      response = "Here are our products:\n";
      products.forEach(product => {
        response += `- ${product.name}: ${product.description} - ${product.price}\n`;
      });
    } else {
      response = "I'm sorry, our product information is currently unavailable.";
    }
  }
  // Check for services query
  else if (queryLower.includes('service') || queryLower.includes('offer')) {
    debugLog('Service query detected');
    const services = extractServices();
    
    response = "We offer these services:\n";
    services.forEach(service => {
      response += `- ${service}\n`;
    });
  }
  // Check for hours query
  else if (queryLower.includes('hour') || queryLower.includes('open') || queryLower.includes('time')) {
    response = `Our hours are: ${salonInfo.hours}`;
  }
  // Check for contact info query
  else if (queryLower.includes('contact') || queryLower.includes('phone') || queryLower.includes('call') || queryLower.includes('email')) {
    response = `You can contact us at:\nPhone: ${salonInfo.phone}\nEmail: ${salonInfo.email}\nAddress: ${salonInfo.address}`;
  }
  // Check for price/cost query
  else if (queryLower.includes('price') || queryLower.includes('cost') || queryLower.includes('how much')) {
    if (queryLower.includes('gel')) {
      response = "Our gel manicures start at $35. The price may vary based on additional nail art or treatments.";
    } else if (queryLower.includes('pedicure')) {
      response = "Our pedicures range from $30 for a basic pedicure to $50 for a deluxe spa pedicure.";
    } else if (queryLower.includes('acrylic') || queryLower.includes('extension')) {
      response = "Full acrylic sets start at $45. Fill-ins are $30.";
    } else if (queryLower.includes('nail art')) {
      response = "Simple nail art starts at $5 per nail. Complex designs range from $10-20 per nail.";
    } else {
      response = "Our prices vary depending on the service. Basic manicures start at $25, gel manicures at $35, and pedicures at $30. Please call us for specific pricing details.";
    }
  }
  // Generate response using pre-defined responses for common questions
  else {
    // Simple response mapping for common questions
    const responseMap = {
      'appointment': `To book an appointment, please call us at ${salonInfo.phone} or use our online booking system on the website.`,
      'cancel': `To cancel or reschedule an appointment, please call us at ${salonInfo.phone} at least 24 hours in advance.`,
      'hello': `Hello! Welcome to ${salonInfo.name}. How can I help you today?`,
      'hi': `Hi there! Welcome to ${salonInfo.name}. How can I assist you?`,
      'nail art': 'Yes, we specialize in various nail art designs! Our nail artists can create anything from simple patterns to complex hand-painted artwork.',
      'parking': 'We have free parking available in front of our salon for all customers.',
      'gift card': `Yes, we offer gift cards in any denomination. They can be purchased in-person at the salon or by calling us at ${salonInfo.phone}.`
    };
    
    // Check for matching keywords
    let matched = false;
    for (const [keyword, resp] of Object.entries(responseMap)) {
      if (queryLower.includes(keyword)) {
        response = resp;
        matched = true;
        break;
      }
    }
    
    // Default response if no match
    if (!matched) {
      response = `Thank you for your message. For specific information about ${salonInfo.name}, please call us at ${salonInfo.phone} or browse our website for more details.`;
    }
  }
  
  // Add to conversation history and save
  conversationHistory.push({ role: "assistant", content: response });
  saveConversation();
  
  return response;
}

/**
 * Initialize the chat widget when the page is loaded
 */
function initChatWidget() {
  debugLog('Initializing chat widget');
  const chatWidget = document.getElementById('nail-aide-widget');
  if (!chatWidget) {
    debugLog('Chat widget not found, creating one...');
    
    // Create chat widget elements
    const widget = document.createElement('div');
    widget.id = 'nail-aide-widget';
    widget.innerHTML = `
      <div class="chat-header">
        <span>Chat with NailAide</span>
        <button class="close-button" id="close-chat">&times;</button>
      </div>
      <div class="chat-messages" id="chat-messages"></div>
      <div class="chat-input">
        <input type="text" id="user-message" placeholder="Ask about our services...">
        <button id="send-message">Send</button>
      </div>
    `;
    
    // Add styles
    const styles = document.createElement('style');
    styles.textContent = `
      #nail-aide-widget {
        position: fixed;
        bottom: 20px;
        right: 20px;
        width: 300px;
        border: 1px solid #ddd;
        border-radius: 10px;
        background: white;
        box-shadow: 0 0 10px rgba(0,0,0,0.1);
        z-index: 1000;
        display: flex;
        flex-direction: column;
        max-height: 400px;
        overflow: hidden;
      }
      .chat-header {
        background: #f06292;
        color: white;
        padding: 10px;
        border-top-left-radius: 10px;
        border-top-right-radius: 10px;
        display: flex;
        justify-content: space-between;
        align-items: center;
      }
      .chat-header .close-button {
        background: none;
        border: none;
        color: white;
        font-size: 20px;
        cursor: pointer;
      }
      .chat-messages {
        padding: 10px;
        height: 250px;
        overflow-y: auto;
        flex-grow: 1;
      }
      .chat-input {
        display: flex;
        padding: 10px;
        border-top: 1px solid #ddd;
      }
      .chat-input input {
        flex-grow: 1;
        padding: 8px;
        border: 1px solid #ddd;
        border-radius: 4px;
      }
      .chat-input button {
        margin-left: 8px;
        background: #f06292;
        color: white;
        border: none;
        padding: 8px 12px;
        border-radius: 4px;
        cursor: pointer;
      }
      .user-message, .bot-message {
        margin-bottom: 10px;
        padding: 8px 12px;
        border-radius: 16px;
        max-width: 80%;
        word-wrap: break-word;
      }
      .user-message {
        background: #e3f2fd;
        margin-left: auto;
        border-bottom-right-radius: 4px;
      }
      .bot-message {
        background: #f1f1f1;
        margin-right: auto;
        border-bottom-left-radius: 4px;
      }
      .typing-indicator {
        background: #f1f1f1;
        margin-right: auto;
        border-bottom-left-radius: 4px;
        opacity: 0.7;
      }
    `;
    
    // Append to body
    document.head.appendChild(styles);
    document.body.appendChild(widget);
    
    // Add welcome message
    setTimeout(() => {
      addMessage(`Hi there! I'm NailAide, your virtual assistant for ${salonInfo.name}. How can I help you today?`, 'bot');
    }, 300);
    
    // Add event listeners
    document.getElementById('send-message').addEventListener('click', sendMessage);
    document.getElementById('user-message').addEventListener('keypress', e => {
      if (e.key === 'Enter') sendMessage();
    });
    document.getElementById('close-chat').addEventListener('click', () => {
      widget.remove();
      
      // Show activation button again
      setTimeout(() => {
        if (typeof addNailAideToPage === 'function') {
          addNailAideToPage();
        }
      }, 100);
    });
    
    debugLog('Chat widget created and initialized');
    
    // Expose a global event to notify any listeners that NailAide is ready
    const nailAideReadyEvent = new CustomEvent('nailAideReady');
    document.dispatchEvent(nailAideReadyEvent);
  }
}

/**
 * Add a message to the chat window
 */
function addMessage(text, sender) {
  const messagesDiv = document.getElementById('chat-messages');
  if (!messagesDiv) {
    debugLog('ERROR: chat-messages element not found when trying to add message');
    return;
  }
  
  const messageElement = document.createElement('div');
  messageElement.className = sender === 'user' ? 'user-message' : 'bot-message';
  
  // Convert line breaks to <br> elements for better formatting
  text = text.replace(/\n/g, '<br>');
  messageElement.innerHTML = text;
  
  messagesDiv.appendChild(messageElement);
  messagesDiv.scrollTop = messagesDiv.scrollHeight;
}

/**
 * Send a message from the user
 */
async function sendMessage() {
  const inputField = document.getElementById('user-message');
  if (!inputField) {
    debugLog('ERROR: user-message input field not found');
    return;
  }
  
  const userMessage = inputField.value.trim();
  
  if (userMessage) {
    // Add user message to chat
    addMessage(userMessage, 'user');
    inputField.value = '';
    
    // Show typing indicator
    const typingIndicator = document.createElement('div');
    typingIndicator.className = 'bot-message typing-indicator';
    typingIndicator.textContent = '...';
    const messagesDiv = document.getElementById('chat-messages');
    if (messagesDiv) {
      messagesDiv.appendChild(typingIndicator);
      messagesDiv.scrollTop = messagesDiv.scrollHeight;
    }
    
    // Get response from NailAide
    try {
      debugLog('Processing query and generating response');
      const response = await handleUserQuery(userMessage);
      
      // Remove typing indicator
      if (typingIndicator.parentNode) {
        typingIndicator.remove();
      }
      
      // Add bot response
      addMessage(response, 'bot');
    } catch (error) {
      console.error('Error getting response:', error);
      if (typingIndicator.parentNode) {
        typingIndicator.remove();
      }
      addMessage("I'm sorry, I encountered an issue while processing your request.", 'bot');
    }
  }
}

// Initialize when document is ready
debugLog('Setting up initialization handlers');
if (document.readyState === 'complete' || document.readyState === 'interactive') {
  debugLog('Document already ready, initializing immediately');
  setTimeout(initChatWidget, 100);
} else {
  debugLog('Waiting for document to be ready');
  window.addEventListener('DOMContentLoaded', () => {
    debugLog('DOM content loaded, initializing');
    setTimeout(initChatWidget, 100);
  });
}

// Make sure we initialize even if other events don't fire
setTimeout(initChatWidget, 500);

// Export functions for potential use by other scripts
window.NailAide = {
  handleUserQuery,
  initChatWidget,
  addMessage,
  sendMessage
};

// Announce that NailAide is loaded
debugLog('NailAide script fully loaded and ready');
