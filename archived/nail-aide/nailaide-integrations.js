/**
 * NailAide Integration Script
 * This script can be included in any page without modifying the page structure
 */

// Load the NailAide script dynamically
function loadNailAide() {
    // Check if NailAide is already loaded
    if (window.NailAide) {
      console.log('NailAide already loaded');
      return;
    }
  
    console.log('Loading NailAide...');
  
    // Create script element
    const script = document.createElement('script');
    script.src = '/js/nailaide-web.js';
    script.async = true;
    script.onload = () => {
      console.log('NailAide loaded successfully');
    };
    script.onerror = () => {
      console.error('Failed to load NailAide');
    };
  
    // Append to document
    document.body.appendChild(script);
  }
  
  // Function to add NailAide to any existing website page
  function addNailAideToPage(buttonLabel = 'Chat with NailAide') {
    // Create a floating button to activate the chat
    const chatButton = document.createElement('button');
    chatButton.id = 'nailaide-activator';
    chatButton.textContent = buttonLabel;
    chatButton.style.cssText = `
      position: fixed;
      bottom: 20px;
      right: 20px;
      padding: 10px 15px;
      background-color: #f06292;
      color: white;
      border: none;
      border-radius: 30px;
      cursor: pointer;
      box-shadow: 0 2px 5px rgba(0,0,0,0.2);
      z-index: 999;
      font-weight: bold;
    `;
  
    // Add button to the page
    document.body.appendChild(chatButton);
  
    // Add event listener to open chat when clicked
    chatButton.addEventListener('click', () => {
      // Remove the button
      chatButton.remove();
      
      // Load NailAide if not already loaded
      loadNailAide();
    });
  }
  
  // Initialize when the DOM is fully loaded
  document.addEventListener('DOMContentLoaded', () => {
    // Check if we're on the demo page
    const isDemoPage = window.location.pathname.includes('nailaide-demo');
    
    if (isDemoPage) {
      // On demo page, load NailAide directly
      loadNailAide();
    } else {
      // On other pages, add the floating button
      addNailAideToPage();
    }
  });
  
  // Support for older browsers
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {});
  } else {
    // DOM already loaded, run immediately
    const isDemoPage = window.location.pathname.includes('nailaide-demo');
    if (isDemoPage) {
      loadNailAide();
    } else {
      addNailAideToPage();
    }
  }
  