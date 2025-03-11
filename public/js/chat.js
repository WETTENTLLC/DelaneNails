/**
 * NailAide Chat Interface
 * Client-side code for the AI chat assistant
 */
document.addEventListener('DOMContentLoaded', () => {
  // Chat elements
  const chatContainer = document.getElementById('chat-container');
  const messagesContainer = document.getElementById('chat-messages');
  const inputForm = document.getElementById('chat-input-form');
  const inputField = document.getElementById('chat-input');
  const sendButton = document.getElementById('chat-send');
  const toggleButton = document.getElementById('chat-toggle');
  
  // Generate a session ID for anonymous users
  const sessionId = localStorage.getItem('nailAideSessionId') || 
                   'session_' + Date.now() + Math.random().toString(36).substring(2, 10);
  localStorage.setItem('nailAideSessionId', sessionId);
  
  // Chat state
  let isChatOpen = false;
  let isWaitingForResponse = false;
  
  // Initialize chat
  function initChat() {
    // Show initial welcome message
    addBotMessage("Hello! I'm NailAide, your nail salon assistant. How can I help you today?");
    
    // Setup event listeners
    inputForm.addEventListener('submit', handleSubmit);
    toggleButton.addEventListener('click', toggleChat);
    
    // Enable auto-resize for input field
    inputField.addEventListener('input', () => {
      inputField.style.height = 'auto';
      inputField.style.height = inputField.scrollHeight + 'px';
    });
  }
  
  // Toggle chat open/closed
  function toggleChat() {
    if (isChatOpen) {
      chatContainer.classList.remove('open');
      toggleButton.innerHTML = '💅 Chat with NailAide';
    } else {
      chatContainer.classList.add('open');
      toggleButton.innerHTML = '✖ Close Chat';
      inputField.focus();
    }
    isChatOpen = !isChatOpen;
  }
  
  // Handle form submission
  function handleSubmit(e) {
    e.preventDefault();
    
    const message = inputField.value.trim();
    if (!message || isWaitingForResponse) return;
    
    // Add user message to chat
    addUserMessage(message);
    
    // Clear input field
    inputField.value = '';
    inputField.style.height = 'auto';
    
    // Send message to AI
    sendMessageToAI(message);
  }
  
  // Add user message to chat
  function addUserMessage(message) {
    const messageElement = document.createElement('div');
    messageElement.className = 'chat-message user-message';
    messageElement.innerHTML = `
      <div class="message-content">${escapeHtml(message)}</div>
      <div class="message-timestamp">${getCurrentTime()}</div>
    `;
    
    messagesContainer.appendChild(messageElement);
    scrollToBottom();
  }
  
  // Add bot message to chat
  function addBotMessage(message, actions = []) {
    const messageElement = document.createElement('div');
    messageElement.className = 'chat-message bot-message';
    
    // Process message for links and simple formatting
    message = processMessageText(message);
    
    messageElement.innerHTML = `
      <div class="bot-avatar">💅</div>
      <div class="message-content">${message}</div>
      <div class="message-timestamp">${getCurrentTime()}</div>
    `;
    
    // If there are actions, add action buttons
    if (actions && actions.length > 0) {
      const actionsContainer = document.createElement('div');
      actionsContainer.className = 'message-actions';
      
      actions.forEach(action => {
        const actionButton = document.createElement('button');
        actionButton.className = 'action-button';
        actionButton.textContent = action.label;
        actionButton.addEventListener('click', () => handleAction(action));
        actionsContainer.appendChild(actionButton);
      });
      
      messageElement.appendChild(actionsContainer);
    }
    
    messagesContainer.appendChild(messageElement);
    scrollToBottom();
  }
  
  // Handle action button clicks
  function handleAction(action) {
    switch (action.type) {
      case 'show_services_list':
        fetchServices();
        break;
        
      case 'show_service_details':
        displayServiceDetails(action.data);
        break;
        
      case 'show_booking_form':
        displayBookingForm(action.data);
        break;
        
      case 'link':
        window.open(action.url, '_blank');
        break;
        
      default:
        console.log('Unknown action type:', action.type);
    }
  }
  
  // Send message to AI API
  async function sendMessageToAI(message) {
    isWaitingForResponse = true;
    showTypingIndicator();
    
    try {
      const response = await fetch('/api/v1/ai/message', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message }),
        credentials: 'same-origin'
      });
      
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      
      const data = await response.json();
      
      // Remove typing indicator
      hideTypingIndicator();
      
      // Add bot response
      addBotMessage(data.data.text, formatActions(data.data.actions));
      
      // Handle any automatic actions if needed
      handleAutomaticActions(data.data);
      
    } catch (error) {
      console.error('Error:', error);
      hideTypingIndicator();
      addBotMessage("I'm sorry, I'm having trouble connecting. Please try again later.");
    } finally {
      isWaitingForResponse = false;
    }
  }
  
  // Format API actions into UI actions
  function formatActions(actions) {
    if (!actions || !Array.isArray(actions) || actions.length === 0) return [];
    
    return actions.map(action => {
      switch (action.type) {
        case 'show_services_list':
          return {
            type: action.type,
            label: 'View Services',
            data: action.data
          };
          
        case 'show_service_details':
          return {
            type: action.type,
            label: `See ${action.data.name} Details`,
            data: action.data
          };
          
        case 'show_booking_form':
          return {
            type: action.type,
            label: 'Book Appointment',
            data: action.data
          };
          
        case 'show_availability':
          return {
            type: 'show_booking_form', // Reuse booking form
            label: 'Check Availability',
            data: action.data
          };
          
        default:
          return {
            type: action.type,
            label: 'View Details',
            data: action.data
          };
      }
    });
  }
  
  // Fetch services from API
  async function fetchServices() {
    showTypingIndicator();
    
    try {
      const response = await fetch('/api/v1/ai/services');
      if (!response.ok) throw new Error('Network response was not ok');
      
      const data = await response.json();
      hideTypingIndicator();
      
      // Display services
      displayServices(data.data.services);
      
    } catch (error) {
      console.error('Error fetching services:', error);
      hideTypingIndicator();
      addBotMessage("I'm sorry, I couldn't retrieve our services list. Please try again later.");
    }
  }
  
  // Display services list
  function displayServices(services) {
    if (!services || services.length === 0) {
      addBotMessage("I couldn't find any services to display.");
      return;
    }
    
    const categories = new Set(services.map(service => service.category));
    
    let message = "<strong>Our Services:</strong><br><br>";
    
    categories.forEach(category => {
      const categoryServices = services.filter(service => service.category === category);
      
      message += `<strong>${category}</strong><br>`;
      categoryServices.forEach(service => {
        message += `• ${service.name} - $${service.price}`;
        if (service.popular) message += " <span class='popular-tag'>Popular</span>";
        message += "<br>";
      });
      message += "<br>";
    });
    
    addBotMessage(message);
  }
  
  // Display service details
  function displayServiceDetails(service) {
    if (!service) {
      addBotMessage("Sorry, I couldn't find details for this service.");
      return;
    }
    
    let message = `<strong>${service.name}</strong><br>`;
    message += `<strong>Price:</strong> $${service.price}`;
    if (service.priceNote) message += ` (${service.priceNote})`;
    message += `<br>`;
    
    message += `<strong>Duration:</strong> ${service.duration} minutes`;
    if (service.durationNote) message += ` (${service.durationNote})`;
    message += `<br><br>`;
    
    message += service.description;
    
    addBotMessage(message, [
      {
        type: 'show_booking_form',
        label: 'Book This Service',
        data: { prefilledService: service.name }
      }
    ]);
  }
  
  // Display booking form
  function displayBookingForm(data = {}) {
    const servicesList = document.createElement('div');
    servicesList.className = 'booking-form';
    
    servicesList.innerHTML = `
      <h3>Book an Appointment</h3>
      <form id="booking-form">
        <div class="form-group">
          <label for="service">Service</label>
          <select id="service" name="service" required>
            <option value="">Select a service</option>
            <!-- To be populated dynamically -->
          </select>
        </div>
        
        <div class="form-group">
          <label for="date">Date</label>
          <input type="date" id="date" name="date" required min="${formatDateForInput(new Date())}">
        </div>
        
        <div class="form-group">
          <label for="time">Time</label>
          <select id="time" name="time" required>
            <option value="">Select a time</option>
            <!-- To be populated dynamically -->
          </select>
        </div>
        
        <div class="form-group">
          <label for="name">Name</label>
          <input type="text" id="name" name="name" required placeholder="Your name">
        </div>
        
        <div class="form-group">
          <label for="email">Email</label>
          <input type="email" id="email" name="email" required placeholder="Your email">
        </div>
        
        <div class="form-group">
          <label for="phone">Phone</label>
          <input type="tel" id="phone" name="phone" required placeholder="Your phone number">
        </div>
        
        <div class="form-group">
          <label for="notes">Notes (Optional)</label>
          <textarea id="notes" name="notes" placeholder="Any special requests or information"></textarea>
        </div>
        
        <button type="submit" class="submit-button">Book Appointment</button>
      </form>
    `;
    
    const messageElement = document.createElement('div');
    messageElement.className = 'chat-message bot-message';
    messageElement.innerHTML = `
      <div class="bot-avatar">💅</div>
      <div class="message-content"></div>
    `;
    
    messageElement.querySelector('.message-content').appendChild(servicesList);
    messagesContainer.appendChild(messageElement);
    scrollToBottom();
    
    // Fetch services to populate dropdown
    fetch('/api/v1/ai/services')
      .then(response => response.json())
      .then(data => {
        const selectElement = document.getElementById('service');
        
        // Group services by category
        const servicesByCategory = {};
        data.data.services.forEach(service => {
          if (!servicesByCategory[service.category]) {
            servicesByCategory[service.category] = [];
          }
          servicesByCategory[service.category].push(service);
        });
        
        // Add options to select element
        Object.keys(servicesByCategory).forEach(category => {
          const optgroup = document.createElement('optgroup');
          optgroup.label = category;
          
          servicesByCategory[category].forEach(service => {
            const option = document.createElement('option');
            option.value = service.i