/**
 * Walk-In Test Helper
 * This script helps test the walk-in functionality from the console
 */

(function() {
  console.log('Walk-In Test Helper loaded');
  
  // Helper function to test the walk-in flow
  window.testWalkIn = function() {
    console.log('Testing walk-in flow');
    
    if (!window.NailAide) {
      console.error('NailAide not found. Cannot test walk-in flow.');
      return false;
    }
    
    // Simulate a user asking about walk-ins
    if (typeof window.NailAide.processUserMessage === 'function') {
      // First open the widget if it's not visible
      if (typeof window.NailAide.toggle === 'function') {
        window.NailAide.toggle();
      }
      
      // Add a user message about walk-ins
      if (typeof window.NailAide.addMessageToChat === 'function') {
        window.NailAide.addMessageToChat('user', 'Do you accept walk-ins today?');
      }
      
      // Process the message
      setTimeout(() => {
        window.NailAide.processUserMessage('Do you accept walk-ins today?');
      }, 500);
      
      return true;
    } else {
      console.error('NailAide.processUserMessage function not found');
      return false;
    }
  };
  
  // Helper function to get the current state of the walk-in flow
  window.getWalkInStatus = function() {
    if (window.WalkInManager && typeof window.WalkInManager.getState === 'function') {
      return window.WalkInManager.getState();
    } else {
      return { error: 'WalkInManager not available or getState function not found' };
    }
  };
  
  // Test if all required modules are loaded
  window.checkWalkInRequirements = function() {
    const requirements = {
      'NailAide': !!window.NailAide,
      'BooksyService': !!window.BooksyService,
      'NotificationService': !!window.NotificationService,
      'WalkInManager': !!window.WalkInManager,
      'NAILAIDE_CONFIG': !!window.NAILAIDE_CONFIG,
      'NAILAIDE_CONFIG.availability': !!(window.NAILAIDE_CONFIG && window.NAILAIDE_CONFIG.availability)
    };
    
    console.table(requirements);
    
    return Object.values(requirements).every(Boolean);
  };
  
  // Add a button to test walk-ins
  setTimeout(() => {
    const buttonContainer = document.createElement('div');
    buttonContainer.style.position = 'fixed';
    buttonContainer.style.bottom = '100px';
    buttonContainer.style.right = '20px';
    buttonContainer.style.zIndex = '1000000';
    
    const walkInButton = document.createElement('button');
    walkInButton.textContent = 'Test Walk-In';
    walkInButton.style.backgroundColor = '#FF9800';
    walkInButton.style.color = 'white';
    walkInButton.style.border = 'none';
    walkInButton.style.borderRadius = '4px';
    walkInButton.style.padding = '8px 12px';
    walkInButton.style.cursor = 'pointer';
    walkInButton.onclick = window.testWalkIn;
    
    buttonContainer.appendChild(walkInButton);
    document.body.appendChild(buttonContainer);
  }, 2000);
})();
