/**
 * NailAide Chat Widget
 * A simple chat interface for salon websites
 */

const NailAide = (function() {
  // Config with defaults that will be overridden by NAILAIDE_CONFIG
  let config = {
    primaryColor: '#9333ea',
    secondaryColor: '#f3f4f6',
    userBubbleColor: '#e1f5fe',
    widgetTitle: 'Chat with Us',
    enableOnMobile: true,
    initiallyMinimized: true,
    welcomeMessage: "Hello! How may I help you today?",
    excludedPages: []
  };

  // DOM elements
  let chatContainer;
  let chatBody;
  let inputField;
  let launcherButton;
  let isWidgetVisible = false;

  function init() {
    console.log('NailAide initializing...');
    
    // Override defaults with custom configuration
    if (window.NAILAIDE_CONFIG) {
      config = {...config, ...window.NAILAIDE_CONFIG};
      console.log('Configuration loaded:', config);
    } else {
      console.warn('No NAILAIDE_CONFIG found, using defaults');
    }
    
    // Check if we should show the widget on this page
    const currentPath = window.location.pathname;
    if (config.excludedPages.some(path => currentPath.includes(path))) {
      console.log('Page excluded, not initializing widget');
      return; // Don't initialize on excluded pages
    }
    
    // Check mobile visibility
    if (!config.enableOnMobile && window.innerWidth < 768) {
      console.log('Mobile disabled, not initializing widget');
      return; // Don't initialize on mobile if disabled
    }
    
    // Check for shop parser and integrate it
    if (window.ShopParser) {
      console.log('ShopParser detected, integrating shop products...');
      window.ShopParser.init();
    }
    
    createWidgetDOM();
    attachEventListeners();
    
    // Set CSS variables for styling
    document.documentElement.style.setProperty('--primary-color', config.primaryColor);
    document.documentElement.style.setProperty('--secondary-color', config.secondaryColor);
    document.documentElement.style.setProperty('--user-bubble-color', config.userBubbleColor);
    
    // Show welcome message
    if (config.welcomeMessage) {
      setTimeout(() => {
        addMessageToChat('bot', config.welcomeMessage);
      }, 500);
    }
    
    // Dispatch event that NailAide is loaded
    const event = new Event('nailaide:loaded');
    window.dispatchEvent(event);
    
    console.log('NailAide initialization complete');
    
    // Reset recently shown products every 5 minutes
    setInterval(() => {
      recentlyShownProducts = [];
    }, 5 * 60 * 1000);
  }
  
  function createWidgetDOM() {
    console.log('Creating widget DOM...');
    
    // Create main container
    chatContainer = document.createElement('div');
    chatContainer.classList.add('nailaide-container');
    if (config.initiallyMinimized) {
      chatContainer.classList.add('minimized');
    }
    
    chatContainer.innerHTML = `
      <div class="nailaide-header" style="background-color: ${config.primaryColor}">
        <div class="nailaide-title">${config.widgetTitle}</div>
        <div class="nailaide-controls">
          <button class="nailaide-minimize">&minus;</button>
          <button class="nailaide-close">&times;</button>
        </div>
      </div>
      <div class="nailaide-body"></div>
      <div class="nailaide-input">
        <textarea placeholder="Type your message here..." rows="1"></textarea>
        <button class="nailaide-send" style="background-color: ${config.primaryColor}">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
        </button>
      </div>
    `;
    
    // Create launcher button
    launcherButton = document.createElement('button');
    launcherButton.classList.add('nailaide-launcher');
    launcherButton.style.backgroundColor = config.primaryColor;
    launcherButton.innerHTML = `
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M21 11.5C21.0034 12.8199 20.6951 14.1219 20.1 15.3C19.3944 16.7118 18.3098 17.8992 16.9674 18.7293C15.6251 19.5594 14.0782 19.9994 12.5 20C11.1801 20.0034 9.87812 19.6951 8.7 19.1L3 21L4.9 15.3C4.30493 14.1219 3.99656 12.8199 4 11.5C4.00061 9.92179 4.44061 8.37488 5.27072 7.03258C6.10083 5.69028 7.28825 4.6056 8.7 3.90001C9.87812 3.30494 11.1801 2.99659 12.5 3.00001H13C15.0843 3.11502 17.053 3.99479 18.5291 5.47089C20.0052 6.94699 20.885 8.91568 21 11V11.5Z" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
    `;
    
    // Hide widget initially
    chatContainer.style.display = 'none';
    isWidgetVisible = false;
    
    // Append elements to body
    document.body.appendChild(chatContainer);
    document.body.appendChild(launcherButton);
    
    console.log('Widget DOM created');
  }
  
  function attachEventListeners() {
    console.log('Attaching event listeners...');
    
    const minimizeButton = chatContainer.querySelector('.nailaide-minimize');
    const closeButton = chatContainer.querySelector('.nailaide-close');
    const sendButton = chatContainer.querySelector('.nailaide-send');
    inputField = chatContainer.querySelector('.nailaide-input textarea');
    chatBody = chatContainer.querySelector('.nailaide-body');
    
    // CRITICAL FIX: Check if inputField exists and properly initialize it
    if (!inputField) {
      console.error('Input field not found! Creating a new one...');
      const inputContainer = chatContainer.querySelector('.nailaide-input');
      if (inputContainer) {
        // Create a new textarea if the original one is somehow missing
        inputField = document.createElement('textarea');
        inputField.placeholder = 'Type your message here...';
        inputField.rows = 1;
        
        // Add the new textarea to the input container
        inputContainer.prepend(inputField);
      } else {
        console.error('Input container not found! Widget may be broken.');
      }
    }
    
    // Ensure input field is properly set up
    if (inputField) {
      // Force enable the input
      inputField.disabled = false;
      inputField.readOnly = false;
      
      // Force pointer events
      inputField.style.pointerEvents = 'auto';
      
      // Clear any existing event listeners to avoid duplicates
      inputField.removeEventListener('keypress', handleKeyPress);
      
      // Add the event listener for Enter key
      inputField.addEventListener('keypress', handleKeyPress);
      
      // Add click and focus handlers for debugging
      inputField.addEventListener('click', () => {
        console.log('Input field clicked');
      });
      
      inputField.addEventListener('focus', () => {
        console.log('Input field focused');
        // Scroll to bottom when field gets focus
        setTimeout(() => {
          chatBody.scrollTop = chatBody.scrollHeight;
        }, 300);
      });
      
      console.log('Input field configured:', inputField);
    }
    
    // Toggle widget visibility when launcher is clicked
    launcherButton.addEventListener('click', () => {
      if (isWidgetVisible) {
        chatContainer.classList.add('minimized');
        setTimeout(() => {
          chatContainer.style.display = 'none';
          isWidgetVisible = false;
        }, 300);
      } else {
        chatContainer.style.display = 'flex';
        setTimeout(() => {
          chatContainer.classList.remove('minimized');
          isWidgetVisible = true;
        }, 10);
      }
    });
    
    minimizeButton.addEventListener('click', () => {
      chatContainer.classList.add('minimized');
      setTimeout(() => {
        chatContainer.style.display = 'none';
        isWidgetVisible = false;
      }, 300);
    });
    
    closeButton.addEventListener('click', () => {
      chatContainer.classList.add('minimized');
      setTimeout(() => {
        chatContainer.style.display = 'none';
        isWidgetVisible = false;
      }, 300);
    });
    
    sendButton.addEventListener('click', sendMessage);
    
    inputField.addEventListener('keypress', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
      }
    });
    
    // Make sure sendButton uses updated reference
    if (sendButton) {
      sendButton.removeEventListener('click', sendMessage);
      sendButton.addEventListener('click', sendMessage);
    }
    
    console.log('Event listeners attached');
  }
  
  // Separate function for keypress handling for better maintainability
  function handleKeyPress(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  }
  
  function sendMessage() {
    // Make sure we have the current input field reference
    if (!inputField) {
      inputField = chatContainer.querySelector('.nailaide-input textarea');
      if (!inputField) {
        console.error('Input field not found in sendMessage!');
        return;
      }
    }
    
    const message = inputField.value.trim();
    if (message) {
      addMessageToChat('user', message);
      
      // Clear input field properly
      inputField.value = '';
      
      // Process the message
      processUserMessage(message);
      
      // Focus back on input for better UX
      setTimeout(() => {
        inputField.focus();
      }, 100);
    }
  }
  
  function processUserMessage(message) {
    // Simple response system - can be enhanced later
    setTimeout(() => {
      const messageLower = message.toLowerCase();
      
      // Check if it's a question about website content
      if (isWebsiteContentQuery(message)) {
        handleWebsiteContentQuery(message);
        return;
      }
  
      // Check for explicit requests to see more products or shop page
      if (messageLower.includes('see more products') || 
          messageLower.includes('show more products') || 
          messageLower.includes('go to shop') ||
          messageLower.includes('shop page') ||
          messageLower === 'shop') {
        
        // Direct link to shop page
        const shopUrl = 'shop.html';
        addMessageToChat('bot', `You can browse all our products on our shop page:`);
        
        // Add shop button in a separate message
        setTimeout(() => {
          addMessageToChat('bot', `<a href="${shopUrl}" target="_blank" class="nailaide-shop-button" style="display: inline-block; background-color: ${config.primaryColor}; color: white; padding: 10px 20px; border-radius: 4px; text-decoration: none; margin-top: 10px;">${config.responseTemplates?.shopButtonText || 'Browse All Products'}</a>`, true);
        }, 300);
        return;
      }
      
      if (message.toLowerCase().includes('book') || message.toLowerCase().includes('appointment')) {
        // Handle booking requests
        const bookingResponse = config.responseTemplates?.booking || 
          "I'd be happy to help you book an appointment!";
        
        // Add the booking response
        addMessageToChat('bot', bookingResponse);
        
        // Add booking button in a separate message
        setTimeout(() => {
          const bookingUrl = config.booking?.bookingUrl || 'https://delanesnaturalnailcare.booksy.com/';
          // Use a special flag to indicate this is HTML content
          addMessageToChat('bot', `<a href="${bookingUrl}" target="_blank" class="booking-button" style="display: inline-block; background-color: ${config.primaryColor}; color: white; padding: 10px 20px; border-radius: 4px; text-decoration: none; margin-top: 10px;">Book Appointment Now</a>`, true);
        }, 500);
      } else if (message.toLowerCase().includes('hour') || message.toLowerCase().includes('open')) {
        // Handle hours request
        addMessageToChat('bot', `Our hours are: ${config.businessInfo?.hours || "Mon-Sat: 9am-5pm"}`);
      } else if (message.toLowerCase().includes('location') || message.toLowerCase().includes('address')) {
        // Handle location request
        addMessageToChat('bot', `We're located at: ${config.businessInfo?.address || "333 Estudillo Ave, Suite 100, San Leandro, CA"}`);
      } else if (message.toLowerCase().includes('walk') && (message.toLowerCase().includes('in') || message.toLowerCase().includes('ins'))) {
        // Handle walk-in requests
        const walkInResponse = config.responseTemplates?.walkIn || 
          `Yes, we do accept walk-ins based on availability! Our hours are ${config.businessInfo?.hours || "Mon-Sat: 9am-5pm"}. For guaranteed service, we recommend booking an appointment.`;
        
        addMessageToChat('bot', walkInResponse);
        
        // Add booking option as follow-up
        setTimeout(() => {
          const bookingUrl = config.booking?.bookingUrl || 'https://delanesnaturalnailcare.booksy.com/';
          addMessageToChat('bot', `<a href="${bookingUrl}" target="_blank" class="booking-button" style="display: inline-block; background-color: ${config.primaryColor}; color: white; padding: 10px 20px; border-radius: 4px; text-decoration: none; margin-top: 10px;">Book Appointment Now</a>`, true);
        }, 500);
      } else if (isProductQuery(message)) {
        // Handle product requests
        handleProductQuery(message);
      } else {
        // Default response
        addMessageToChat('bot', "Thank you for your message. How else can I help you today?");
      }
    }, 1000);
  }
  
  // Function to detect website content queries
  function isWebsiteContentQuery(message) {
    const contentKeywords = [
      'about', 'tell me about', 'who are you', 'company', 
      'services', 'what services', 'treatments', 'offerings',
      'news', 'updates', 'recent', 'latest', 'events',
      'steps to success', 'steps', 'success', 'program', 'initiative', 'foundation', // Added explicit keywords
      'nonprofit', 'charity', 'mission', 'empowerment', 'mentorship', 'career'
    ];
    
    const questionWords = ['what', 'who', 'where', 'when', 'how', 'tell me', 'show me', 'explain'];
    const messageLower = message.toLowerCase();
    
    // Check for explicit page references
    const pageReferences = [
      'about page', 'services page', 'news page', 'steps to success page', 'steps page',
      'learn more about', 'read about'
    ];
    
    // Special case for Steps to Success
    if (messageLower.includes('step') && messageLower.includes('success')) {
      console.log('Direct match for Steps to Success detected');
      return true;
    }
    
    // Check for direct page mentions
    if (pageReferences.some(ref => messageLower.includes(ref))) {
      return true;
    }
    
    // Check for question about content
    if (questionWords.some(word => messageLower.includes(word)) &&
        contentKeywords.some(keyword => messageLower.includes(keyword))) {
      return true;
    }
    
    return false;
  }
  
  // Function to handle website content queries - Add improved error handling and logging
  function handleWebsiteContentQuery(message) {
    console.log('Processing website content query:', message);
    
    try {
      // Special case for Steps to Success
      if (message.toLowerCase().includes('steps to success') || 
          (message.toLowerCase().includes('step') && message.toLowerCase().includes('success'))) {
        
        console.log('Special handling for Steps to Success');
        
        const stepsInfo = {
          title: 'Steps To Success',
          summary: "DNNC Steps to Success is our nonprofit initiative empowering women through mentorship and career advancement programs. Our goal is to provide support, education, and opportunities for women to achieve their professional goals in the beauty industry and beyond.",
          url: 'steps-to-success.html'
        };
        
        addMessageToChat('bot', `Here's information about our ${stepsInfo.title} program:`);
        
        setTimeout(() => {
          addMessageToChat('bot', stepsInfo.summary);
          
          // Add link to the page
          setTimeout(() => {
            addMessageToChat('bot', `<a href="${stepsInfo.url}" target="_blank" class="nailaide-content-button" style="display: inline-block; background-color: ${config.primaryColor}; color: white; padding: 10px 20px; border-radius: 4px; text-decoration: none; margin-top: 10px;">Learn More About ${stepsInfo.title}</a>`, true);
          }, 500);
        }, 300);
        
        return;
      }

      if (typeof window.WebsiteContent === 'undefined') {
        console.error('WebsiteContent is not defined');
        addMessageToChat('bot', "I'm sorry, I don't have information about that yet. Please visit our website for more details.");
        return;
      }
      
      // Get website content
      let content;
      try {
        content = window.WebsiteContent.getContent();
        console.log('Content retrieved:', content);
      } catch (e) {
        console.error('Error getting content:', e);
        addMessageToChat('bot', "I'm having trouble accessing website information right now. Please try again later.");
        return;
      }
      
      if (!content) {
        console.error('Content is null or undefined');
        addMessageToChat('bot', "I'm still loading information about our website. Please ask again in a moment.");
        
        // Try to initialize content
        if (typeof window.WebsiteContent.init === 'function') {
          window.WebsiteContent.init()
            .then(() => console.log('Content initialized after query failure'))
            .catch(err => console.error('Failed to initialize content:', err));
        }
        return;
      }
      
      if (!content.pages || Object.keys(content.pages).length === 0) {
        console.warn('No pages found in content');
        addMessageToChat('bot', "I'm still loading information about our website. Please ask again in a moment.");
        return;
      }
      
      console.log('Content is available, searching for:', message);
      
      // Search for relevant content
      let results;
      try {
        results = window.WebsiteContent.searchContent(message);
        console.log('Search results:', results);
      } catch (e) {
        console.error('Error searching content:', e);
        addMessageToChat('bot', "I encountered an error while searching for that information. Please try a different question.");
        return;
      }
      
      if (!results || results.length === 0) {
        addMessageToChat('bot', "I'm sorry, I couldn't find specific information about that. Is there something else you'd like to know?");
        return;
      }
      
      // Get the most relevant result
      const topResult = results[0];
      
      // Format response based on result type
      if (topResult.type === 'page') {
        const page = topResult.item;
        addMessageToChat('bot', `Here's information about our ${page.title}:`);
        
        setTimeout(() => {
          addMessageToChat('bot', page.summary);
          
          // Add link to the page
          setTimeout(() => {
            addMessageToChat('bot', `<a href="${page.url}" target="_blank" class="nailaide-content-button" style="display: inline-block; background-color: ${config.primaryColor}; color: white; padding: 10px 20px; border-radius: 4px; text-decoration: none; margin-top: 10px;">Visit ${page.title} Page</a>`, true);
          }, 500);
        }, 300);
      } 
      else if (topResult.type === 'section') {
        const section = topResult.item;
        addMessageToChat('bot', `From our ${section.pageTitle}, about "${section.title}":`);
        
        setTimeout(() => {
          // Trim content if it's very long
          let content = section.content;
          if (content.length > 300) {
            content = content.substring(0, 297) + '...';
          }
          
          addMessageToChat('bot', content);
          
          // Add link to the page
          setTimeout(() => {
            addMessageToChat('bot', `<a href="${section.pageUrl}" target="_blank" class="nailaide-content-button" style="display: inline-block; background-color: ${config.primaryColor}; color: white; padding: 10px 20px; border-radius: 4px; text-decoration: none; margin-top: 10px;">Read More</a>`, true);
          }, 500);
        }, 300);
      }
      else if (topResult.type === 'service') {
        const service = topResult.item;
        addMessageToChat('bot', `We offer ${service.title}:`);
        
        setTimeout(() => {
          let responseText = '';
          if (service.description) {
            responseText += service.description;
          }
          
          if (service.price) {
            responseText += `\n\nPrice: ${service.price}`;
          }
          
          addMessageToChat('bot', responseText);
          
          // Add booking suggestion
          setTimeout(() => {
            const bookingUrl = config.booking?.bookingUrl || 'https://delanesnaturalnailcare.booksy.com/';
            addMessageToChat('bot', `<a href="${bookingUrl}" target="_blank" class="booking-button" style="display: inline-block; background-color: ${config.primaryColor}; color: white; padding: 10px 20px; border-radius: 4px; text-decoration: none; margin-top: 10px;">Book This Service</a>`, true);
          }, 500);
        }, 300);
      }
      else {
        console.warn('Unknown result type:', topResult.type);
        addMessageToChat('bot', "I found information but I'm not sure how to display it. Please try asking in a different way.");
      }
    } catch (e) {
      console.error('Unexpected error in handleWebsiteContentQuery:', e);
      addMessageToChat('bot', "I encountered an unexpected error. Please try again later.");
    }
  }
  
  // Function to detect if a message is a product query - Enhanced with fix for syntax errors
  function isProductQuery(message) {
    const productKeywords = [
      'product', 'buy', 'purchase', 'polish', 'nail polish', 'color', 
      'truth', 'freedom', 'collection', 'shop', 'nail', 'sale', 'price',
      'how much', 'cost', 'sell', 'oil', 'cream', 'file', 'buffer', 'kit',
      'treatment', 'lotion', 'daddi', 'dadi', 'what about', 'tell me about',
      'other products', 'more products' // Added these patterns
    ];
    
    message = message.toLowerCase();
    
    // Direct checks for common product query patterns
    if (message.includes('what about') || 
        message.includes('tell me about') || 
        message.includes('do you have') || 
        message.includes('do you sell') ||
        message.includes('what other') || 
        message.includes('other products') ||
        message.includes('more products') ||
        (message.includes('what else') && message.includes('sell'))) {
      return true;
    }
    
    // Check for specific product keywords
    return productKeywords.some(keyword => message.includes(keyword));
  }
  
  // Function to handle product queries
  function handleProductQuery(message) {
    if (!config.products || !config.products.enabled) {
      addMessageToChat('bot', "I'm sorry, we don't have product information available at the moment. Please visit our shop page.");
      return;
    }
    
    // Initialize items array if it doesn't exist
    if (!config.products.items) {
      config.products.items = [];
    }
    
    // Check for requests about other/more products
    const morePatternsLower = message.toLowerCase();
    const isMoreProductsQuery = 
      morePatternsLower.includes('what other products') ||
      morePatternsLower.includes('other products') ||
      morePatternsLower.includes('more products') ||
      morePatternsLower.includes('see more') ||
      morePatternsLower.includes('show more') ||
      morePatternsLower.includes('what else do you sell');
    
    if (isMoreProductsQuery) {
      // Show different products than the ones recently shown
      addMessageToChat('bot', config.responseTemplates?.productMoreIntro || "Here are some other products we offer:");
      
      // Get all products
      const allProducts = config.products.items;
      
      // Get a different set of products than what was shown before
      // First try to get products from a different category
      const shownProducts = getRecentlyShownProducts();
      
      let otherProducts;
      if (shownProducts.length > 0) {
        // Try to get products from different categories
        const shownCategories = [...new Set(shownProducts.map(p => p.category))];
        otherProducts = allProducts.filter(p => !shownCategories.includes(p.category));
        
        // If no different categories, get different products
        if (otherProducts.length === 0) {
          const shownIds = shownProducts.map(p => p.id);
          otherProducts = allProducts.filter(p => !shownIds.includes(p.id));
        }
        
        // If still no products, just use all products
        if (otherProducts.length === 0) {
          otherProducts = allProducts;
        }
      } else {
        // If no recently shown products, just use all products
        otherProducts = allProducts;
      }
      
      // Show up to 3 products
      setTimeout(() => {
        displayProducts(otherProducts.slice(0, 3));
      }, 500);
      
      return;
    }
    
    // First check if this is a general product inquiry rather than a specific product
    const generalProductTerms = [
      'product', 'products', 'items', 'merchandise', 
      'things', 'stuff', 'goods', 'inventory'
    ];
    
    const messageLower = message.toLowerCase();
    const isGeneralProductQuery = generalProductTerms.some(term => 
      messageLower === term || messageLower === `${term}?` || 
      messageLower === `what ${term}` || messageLower === `what ${term}?` ||
      messageLower.includes(`what ${term} do you`) || 
      messageLower.includes(`show me your ${term}`)
    );
    
    if (isGeneralProductQuery) {
      // Return all products for general queries
      addMessageToChat('bot', "Here are some of our featured products:");
      setTimeout(() => {
        displayProducts(config.products.items.slice(0, 3));
      }, 500);
      return;
    }
    
    // Check if this is a followup question about a specific product
    const specificProductName = extractSpecificProductName(message);
    
    if (specificProductName) {
      // Try to find the specific product
      const product = findProductByName(specificProductName);
      
      if (product) {
        // Show information about the specific product
        addMessageToChat('bot', `Here's information about ${product.name}:`);
        setTimeout(() => {
          displayProducts([product]);  // Show just this product
        }, 300);
        return;
      }
      
      // If product wasn't found in our database but we have a name
      addMessageToChat('bot', `I don't have detailed information about ${specificProductName} in my database. You might find more information on our shop page or by contacting us directly.`);
      
      // Add a link to the shop page
      setTimeout(() => {
        const shopUrl = 'shop.html';
        addMessageToChat('bot', `<a href="${shopUrl}" target="_blank" style="display: inline-block; background-color: ${config.primaryColor}; color: white; padding: 10px 20px; border-radius: 4px; text-decoration: none; margin-top: 10px;">Browse All Products</a>`, true);
      }, 500);
      return;
    }
    
    // Continue with regular product display logic
    const productsToShow = findRelevantProducts(message);
    if (productsToShow.length > 0) {
      setTimeout(() => {
        displayProducts(productsToShow.slice(0, 3));
      }, 500);
    } else {
      addMessageToChat('bot', "I'm sorry, I couldn't find any products matching your query. Please visit our shop page for more options.");
    }
  }
  
  // New function to extract specific product names from queries
  function extractSpecificProductName(message) {
    message = message.toLowerCase();
    
    // Check for patterns like "what about X" or "tell me about X"
    const aboutPattern = /(?:what|tell me) about\s+(.+)(?:\?|$)/i;
    const aboutMatch = message.match(aboutPattern);
    if (aboutMatch && aboutMatch[1]) {
      return aboutMatch[1].trim();
    }
    
    // Check for patterns like "do you have X" or "do you sell X"
    const havePattern = /do you (?:have|sell)\s+(.+)(?:\?|$)/i;
    const haveMatch = message.match(havePattern);
    if (haveMatch && haveMatch[1]) {
      return haveMatch[1].trim();
    }
    
    // List of general product terms that should not be treated as specific products
    const generalProductTerms = [
      'product', 'products', 'items', 'merchandise', 
      'things', 'stuff', 'goods', 'inventory'
    ];
    
    // Check if the message is a general product inquiry
    if (generalProductTerms.some(term => message.includes(term))) {
      return null;
    }
    
    // If no specific patterns matched, return null
    return null;
  }
  
  // Function to find a product by name
  function findProductByName(productName) {
    if (!config.products || !config.products.items) return null;
    
    const products = config.products.items;
    productName = productName.toLowerCase();
    
    // Try direct match first
    let match = products.find(product => 
      product.name.toLowerCase() === productName
    );
    
    // If no direct match, try contains
    if (!match) {
      match = products.find(product => 
        product.name.toLowerCase().includes(productName) ||
        (product.keywords && product.keywords.includes(productName))
      );
    }
    
    // If still no match, try partial word matches
    if (!match) {
      const productWords = productName.split(/\s+/);
      if (productWords.length > 0) {
        for (const word of productWords) {
          if (word.length < 3) continue; // Skip very short words
          match = products.find(product => 
            product.name.toLowerCase().includes(word) ||
            (product.keywords && product.keywords.some(k => k.includes(word)))
          );
          if (match) break;
        }
      }
    }
    
    return match;
  }
  
  // Function to find relevant products based on the message
  function findRelevantProducts(message) {
    if (!config.products || !config.products.items) return [];
    
    message = message.toLowerCase();
    const products = config.products.items;
    
    // Check for specific phrases about browsing all products
    if (message.includes('what products do you have') || 
        message.includes('what do you sell') || 
        message.includes('show me your products') ||
        message.includes('what can i buy')) {
      // Return all products for "show all" queries
      return products;
    }
    
    // If the message is a general product inquiry but not "show all"
    if (message.includes('product') || message.includes('buy') || 
        message.includes('shop') || message.includes('purchase')) {
      // First try to match by category
      const category = getCategoryFromMessage(message);
      if (category) {
        const categoryProducts = products.filter(product => 
          product.category.toLowerCase() === category.toLowerCase()
        );
        
        if (categoryProducts.length > 0) {
          return categoryProducts;
        }
      }
      
      // If no category match, check for keywords in product names/descriptions
      const keywords = message
        .replace(/[.,?!;:]/g, '')
        .split(/\s+/)
        .filter(word => word.length > 3);
      
      if (keywords.length > 0) {
        const matchingProducts = products.filter(product => {
          return keywords.some(keyword => 
            product.name.toLowerCase().includes(keyword) || 
            (product.description && product.description.toLowerCase().includes(keyword)) ||
            (product.keywords && product.keywords.some(k => k.includes(keyword)))
          );
        });
        
        if (matchingProducts.length > 0) {
          return matchingProducts;
        }
      }
      
      // If no specific matches, return all products
      return products;
    }
    
    // Check for category matches
    const category = getCategoryFromMessage(message);
    if (category) {
      const categoryProducts = products.filter(product => 
        product.category.toLowerCase() === category.toLowerCase()
      );
      
      if (categoryProducts.length > 0) {
        return categoryProducts;
      }
    }
    
    // Check for specific product mentions
    const specificProducts = products.filter(product => {
      return message.includes(product.name.toLowerCase()) || 
             message.includes(product.id.toLowerCase()) || 
             (product.keywords && product.keywords.some(keyword => message.includes(keyword.toLowerCase())));
    });
    
    if (specificProducts.length > 0) {
      return specificProducts;
    }
    
    // If no specific match, return all products
    return products;
  }
  
  // Function to extract category from message
  function getCategoryFromMessage(message) {
    message = message.toLowerCase();
    
    if (!config.products || !config.products.categories) return null;
    
    for (const category of config.products.categories) {
      if (message.includes(category.toLowerCase())) {
        return category;
      }
    }
    
    // Special cases
    if (message.includes('truth') || message.includes('freedom') || 
        message.includes('color') || message.includes('colour')) {
      return 'polish';
    }
    
    return null;
  }
  
  // Track which products have been shown recently
  let recentlyShownProducts = [];

  // Helper function to get recently shown products
  function getRecentlyShownProducts() {
    return recentlyShownProducts;
  }

  // Function to display products in the chat (updated to include shop link)
  function displayProducts(products) {
    if (!products || products.length === 0) return;
    
    // Update the recently shown products
    recentlyShownProducts = products;
    
    // Create a product gallery element with improved styling
    const galleryHtml = `
      <div class="nailaide-product-gallery">
        ${products.map(product => {
          // Check if the product has an image, otherwise use a placeholder
          const imageSrc = product.image || 'https://via.placeholder.com/90x90?text=Product';
          return `
            <div class="nailaide-product-card">
              <img src="${imageSrc}" alt="${product.name}" class="nailaide-product-image" onerror="this.src='https://via.placeholder.com/90x90?text=Product';">
              <div class="nailaide-product-info">
                <div class="nailaide-product-name">${product.name}</div>
                <div class="nailaide-product-price">${product.price}</div>
                <a href="${product.url}" target="_blank" class="nailaide-buy-button">Buy Now</a>
              </div>
            </div>
          `;
        }).join('')}
      </div>
    `;
    
    // Add the gallery to chat (ensure isHtml is true)
    addMessageToChat('bot', galleryHtml, true);
    
    // Add follow-up message and shop link
    setTimeout(() => {
      addMessageToChat('bot', "Would you like more information about any of these products?");
      
      // Add shop link for browsing more products
      setTimeout(() => {
        const shopUrl = 'shop.html';
        const shopLinkText = config.responseTemplates?.shopLinkText || 'You can see our complete collection in our online shop.';
        addMessageToChat('bot', shopLinkText);
        
        setTimeout(() => {
          addMessageToChat('bot', `<a href="${shopUrl}" target="_blank" class="nailaide-shop-button" style="display: inline-block; background-color: ${config.primaryColor}; color: white; padding: 10px 20px; border-radius: 4px; text-decoration: none; margin-top: 10px;">${config.responseTemplates?.shopButtonText || 'Browse All Products'}</a>`, true);
        }, 400);
      }, 800);
    }, 1000);
  }
  
  // Update the function to accept an isHtml parameter
  function addMessageToChat(sender, message, isHtml = false) {
    const messageElement = document.createElement('div');
    messageElement.classList.add('nailaide-message', sender);
    
    // Check if it's HTML content or has markdown-like links
    if (isHtml || (message.includes('[') && message.includes('](')) || message.includes('<a ')) {
      if (message.includes('[') && message.includes('](')) {
        // Convert markdown links to HTML
        const linkPattern = /\[(.*?)\]\((.*?)\)/g;
        message = message.replace(linkPattern, '<a href="$2" target="_blank">$1</a>');
      }
      messageElement.innerHTML = message; // Use innerHTML for HTML content
    } else {
      messageElement.textContent = message; // Use textContent for plain text
    }
    
    chatBody.appendChild(messageElement);
    chatBody.scrollTop = chatBody.scrollHeight;
  }
  
  // The toggle function properly defined inside the module scope
  function toggle() {
    console.log('Toggle function called', isWidgetVisible);
    
    if (chatContainer) {
      if (isWidgetVisible) {
        console.log('Hiding widget');
        chatContainer.classList.add('minimized');
        setTimeout(() => {
          chatContainer.style.display = 'none';
          isWidgetVisible = false;
        }, 300);
      } else {
        console.log('Showing widget');
        chatContainer.style.display = 'flex';
        setTimeout(() => {
          chatContainer.classList.remove('minimized');
          isWidgetVisible = true;
          
          // Critical: Focus on input field after showing widget
          const input = chatContainer.querySelector('.nailaide-input textarea');
          if (input) {
            try {
              // Force enable the input field
              input.disabled = false;
              input.readOnly = false;
              
              // Force pointer-events and visibility
              input.style.pointerEvents = 'auto';
              input.style.visibility = 'visible';
              input.style.display = 'block';
              
              // Try to focus after a slight delay to ensure DOM is ready
              setTimeout(() => {
                input.focus();
                console.log('Input field focused');
              }, 500);
            } catch (e) {
              console.error('Error focusing input:', e);
            }
          } else {
            console.error('Input field not found when toggling widget');
          }
        }, 10);
      }
    } else {
      console.error('Chat container not found. Widget may not be initialized.');
    }
  }
  
  // Public API
  return {
    init: function() {
      // Only initialize once
      if (!chatContainer) {
        init();
        console.log('NailAide initialized successfully');
      } else {
        console.warn('NailAide already initialized');
        // Refresh event listeners in case they were broken
        attachEventListeners();
      }
    },
    toggle: function() {
      console.log('Toggle function called', isWidgetVisible);
      
      if (chatContainer) {
        if (isWidgetVisible) {
          console.log('Hiding widget');
          chatContainer.classList.add('minimized');
          setTimeout(() => {
            chatContainer.style.display = 'none';
            isWidgetVisible = false;
          }, 300);
        } else {
          console.log('Showing widget');
          chatContainer.style.display = 'flex';
          setTimeout(() => {
            chatContainer.classList.remove('minimized');
            isWidgetVisible = true;
            
            // Critical: Focus on input field after showing widget
            const input = chatContainer.querySelector('.nailaide-input textarea');
            if (input) {
              try {
                // Force enable the input field
                input.disabled = false;
                input.readOnly = false;
                
                // Force pointer-events and visibility
                input.style.pointerEvents = 'auto';
                input.style.visibility = 'visible';
                input.style.display = 'block';
                
                // Try to focus after a slight delay to ensure DOM is ready
                setTimeout(() => {
                  input.focus();
                  console.log('Input field focused');
                }, 500);
              } catch (e) {
                console.error('Error focusing input:', e);
              }
            } else {
              console.error('Input field not found when toggling widget');
            }
          }, 10);
        }
      } else {
        console.error('Chat container not found. Widget may not be initialized.');
      }
    },
    // ...rest of existing methods...
    debugWidget: function() {
      console.log('Running NailAide widget debug...');
      if (!chatContainer) {
        console.error('Chat container is not initialized!');
        return { initialized: false, error: 'Not initialized' };
      }
      
      const status = {
        initialized: true,
        visible: isWidgetVisible,
        containerExists: !!chatContainer,
        launcherExists: !!launcherButton,
        containerStyle: chatContainer ? {
          display: chatContainer.style.display,
          height: chatContainer.offsetHeight,
          width: chatContainer.offsetWidth,
          classes: chatContainer.className
        } : null
      };
      
      console.log('Widget debug status:', status);
      return status;
    },
    forceShow: function() {
      if (!chatContainer) {
        console.error('Cannot force show - widget not initialized');
        return false;
      }
      
      // Force show regardless of current state
      chatContainer.style.display = 'flex';
      chatContainer.classList.remove('minimized');
      isWidgetVisible = true;
      
      // Make doubly sure it's visible by setting important styles
      chatContainer.style.opacity = '1';
      chatContainer.style.visibility = 'visible';
      chatContainer.style.height = '500px';
      chatContainer.style.transform = 'none';
      
      console.log('Widget forced to show');
      return true;
    }
  };
})();

// Make available globally
window.NailAide = NailAide;

// Add a DOMContentLoaded handler for better init reliability
document.addEventListener('DOMContentLoaded', function() {
  console.log('DOM loaded, checking for NailAide...');
  
  // Add a slight delay to ensure everything is ready
  setTimeout(() => {
    if (typeof NailAide !== 'undefined') {
      console.log('Initializing NailAide from DOMContentLoaded handler');
      NailAide.init();
      
      // Show the widget after initialization
      setTimeout(() => {
        console.log('Showing widget after init');
        NailAide.toggle();
      }, 500);
    } else {
      console.error('NailAide not found after DOM load');
    }
  }, 100);
});
