/**
 * NailAide Walk-In Integration
 * Connects the NailAide chat widget with the Walk-In Manager
 */

(function() {
  // Keep track of whether we've patched NailAide
  let isNailAidePatched = false;

  // Function to patch NailAide with walk-in support
  function patchNailAide() {
    if (isNailAidePatched || !window.NailAide) {
      return;
    }
    
    console.log('Patching NailAide with walk-in support...');

    // Store the original NailAide functions we'll modify
    const originalProcessUserMessage = window.NailAide.processUserMessage;

    // Add a handleSystemAction function to NailAide if it doesn't exist
    if (typeof window.NailAide.handleSystemAction !== 'function') {
      window.NailAide.handleSystemAction = function(action, data) {
        console.log('System action received:', action, data);
        
        // Add message to chat function (use the one from NailAide if available)
        const addMessageToChat = function(message, isHtml = false) {
          if (typeof window.NailAide.addMessageToChat === 'function') {
            window.NailAide.addMessageToChat('bot', message, isHtml);
          } else {
            console.error('Cannot add message to chat - addMessageToChat not available');
          }
        };
        
        switch (action) {
          case 'timeSelected':
            if (window.WalkInManager) {
              window.WalkInManager.handleTimeSelection(data, addMessageToChat);
            }
            break;
            
          case 'serviceSelected':
            if (window.WalkInManager) {
              window.WalkInManager.handleServiceSelection(data, addMessageToChat);
            }
            break;
            
          case 'walkInConfirmed':
            if (window.WalkInManager) {
              window.WalkInManager.handleWalkInConfirmation(addMessageToChat);
            }
            break;
            
          case 'walkInCancelled':
            if (window.WalkInManager) {
              window.WalkInManager.handleWalkInCancellation(addMessageToChat);
            }
            break;
            
          default:
            console.warn('Unknown system action:', action);
        }
      };
    }
    
    // Add walk-in detection to NailAide's process message
    if (typeof window.NailAide.processUserMessage === 'function') {
      window.NailAide.processUserMessage = function(message) {
        // Check if this is a walk-in request
        if (isWalkInQuery(message)) {
          handleWalkInRequest(message);
        } else {
          // Otherwise pass to original handler
          if (originalProcessUserMessage) {
            originalProcessUserMessage.call(window.NailAide, message);
          }
        }
      };
    }
    
    // Mark as patched
    isNailAidePatched = true;
    console.log('NailAide patched with walk-in support');
  }
  
  // Function to detect walk-in queries
  function isWalkInQuery(message) {
    const walkInKeywords = [
      'walk in', 'walk-in', 'walkin', 'walk ins', 
      'without appointment', 'no appointment',
      'today availability', 'available today', 'availability today',
      'come in today', 'open today', 'today\'s openings',
      'can i come in', 'drop in', 'drop by'
    ];
    
    message = message.toLowerCase();
    
    // Direct pattern matches
    if (message.includes('walk') && (message.includes('in') || message.includes('ins'))) {
      console.log('Walk-in query detected: walk-in pattern');
      return true;
    }
    
    // Check for specific patterns
    if (walkInKeywords.some(keyword => message.includes(keyword))) {
      console.log('Walk-in query detected: keyword match');
      return true;
    }
    
    // Check for questions about availability today
    if ((message.includes('today') || message.includes('now') || message.includes('this afternoon') || 
         message.includes('this morning') || message.includes('this evening') || message.includes('tonight')) && 
        (message.includes('available') || message.includes('availability') || 
         message.includes('fit me in') || message.includes('slot') || message.includes('time') ||
         message.includes('open') || message.includes('free') || message.includes('come in'))) {
      console.log('Walk-in query detected: availability pattern');
      return true;
    }
    
    // Additional patterns that imply walk-ins
    if ((message.includes('appointment') || message.includes('book')) && 
        (message.includes('today') || message.includes('now') || message.includes('asap') || 
         message.includes('soon') || message.includes('immediately'))) {
      console.log('Walk-in query detected: appointment today pattern');
      return true;
    }
    
    return false;
  }
  
  // Function to handle walk-in requests
  function handleWalkInRequest(message) {
    console.log('Handling walk-in request:', message);
    
    // Check if WalkInManager is available
    if (!window.WalkInManager) {
      console.error('WalkInManager is not available to handle walk-in requests');
      
      // Use NailAide's message function if available
      if (typeof window.NailAide.addMessageToChat === 'function') {
        window.NailAide.addMessageToChat('bot', "I'm sorry, but our walk-in system is not available right now. Please call our salon directly to check walk-in availability.");
      }
      return;
    }
    
    // Create a function to add messages to the chat
    const addMessageToChat = function(message, isHtml = false) {
      if (typeof window.NailAide.addMessageToChat === 'function') {
        window.NailAide.addMessageToChat('bot', message, isHtml);
      } else {
        console.error('Cannot add message to chat - addMessageToChat not available');
      }
    };
    
    // Start the walk-in flow
    window.WalkInManager.handleWalkInQuery(addMessageToChat);
  }
  
  // Add NailAide's internal addMessageToChat function to the window for testing
  function exposeAddMessageToChat() {
    if (window.NailAide && !window.addMessageToChat) {
      window.addMessageToChat = function(message, isHtml = false) {
        window.NailAide.addMessageToChat('bot', message, isHtml);
      };
    }
  }
  
  // Try to patch NailAide when the script loads
  if (window.NailAide) {
    patchNailAide();
  }
  
  // Otherwise wait for NailAide to load
  window.addEventListener('nailaide:loaded', function() {
    patchNailAide();
  });
  
  // Also try again after a delay to be sure
  setTimeout(function() {
    patchNailAide();
    exposeAddMessageToChat();
  }, 1500);
})();
