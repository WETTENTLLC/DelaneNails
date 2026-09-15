/**
 * Debug Manager - Controls visibility of debug elements
 */
const DebugManager = {
  // Default to false to hide debug elements in production
  isDebugMode: false,
  
  // Elements that should only be visible in debug mode
  debugElements: [],
  
  // Initialize the debug manager
  init: function() {
    // Find all elements with debug classes
    this.debugElements = document.querySelectorAll('.debug-control, .debug-border, .debug-toggle');
    
    // Apply initial visibility
    this.updateDebugVisibility();
    
    // Add listener for debug keyboard shortcut (Ctrl+Shift+D)
    document.addEventListener('keydown', function(e) {
      if (e.ctrlKey && e.shiftKey && e.key === 'D') {
        DebugManager.toggleDebugMode();
      }
    });

    // Add conversation state logger if NailAide exists
    this.setupConversationLogger();
  },
  
  // Toggle debug mode on/off
  toggleDebugMode: function() {
    this.isDebugMode = !this.isDebugMode;
    this.updateDebugVisibility();
    console.log('Debug mode:', this.isDebugMode ? 'ON' : 'OFF');
    
    if (this.isDebugMode) {
      this.logConversationState();
    }
  },
  
  // Update visibility of debug elements
  updateDebugVisibility: function() {
    this.debugElements.forEach(element => {
      element.style.display = this.isDebugMode ? '' : 'none';
    });
  },
  
  // Set up conversation state logger
  setupConversationLogger: function() {
    if (typeof NailAide !== 'undefined') {
      // Create a debug conversation state display
      const debugStateElement = document.createElement('div');
      debugStateElement.className = 'debug-control conversation-state-debug';
      debugStateElement.style.position = 'fixed';
      debugStateElement.style.top = '40px';
      debugStateElement.style.right = '10px';
      debugStateElement.style.padding = '10px';
      debugStateElement.style.backgroundColor = 'rgba(255, 200, 200, 0.9)';
      debugStateElement.style.color = 'black';
      debugStateElement.style.zIndex = '99999';
      debugStateElement.style.fontSize = '12px';
      debugStateElement.style.fontFamily = 'monospace';
      debugStateElement.style.display = 'none';
      document.body.appendChild(debugStateElement);
      
      this.debugStateElement = debugStateElement;
      
      // Periodically update the state display if in debug mode
      setInterval(() => {
        if (this.isDebugMode && typeof NailAide !== 'undefined') {
          this.logConversationState();
        }
      }, 1000);
    }
  },
  
  // Log the current conversation state
  logConversationState: function() {
    if (this.debugStateElement && typeof NailAide !== 'undefined') {
      const state = NailAide.conversationState || {};
      this.debugStateElement.innerHTML = `
        <strong>NailAide Conversation State</strong><br>
        awaitingBookingConfirmation: ${state.awaitingBookingConfirmation}<br>
        lastQuestion: ${state.lastQuestion}<br>
      `;
    }
  }
};

// Initialize when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', function() {
  DebugManager.init();
});
