/**
 * Input testing and diagnostic script for NailAide
 */

(function() {
  console.log('Input test script loaded');
  
  function testInputField() {
    // Find the input field
    const inputField = document.querySelector('.nailaide-input textarea');
    
    if (!inputField) {
      console.error('Input field not found!');
      return false;
    }
    
    console.log('Input field found:', inputField);
    
    // Check if input field is focusable
    const focusable = document.activeElement !== inputField && inputField.focus(); 
    console.log('Can focus input field:', focusable !== false);
    
    // Check computed styles
    const styles = window.getComputedStyle(inputField);
    console.log('Input field styles:', {
      display: styles.display,
      visibility: styles.visibility,
      opacity: styles.opacity,
      pointerEvents: styles.pointerEvents,
      zIndex: styles.zIndex
    });
    
    // Test event handling
    inputField.addEventListener('test-event', () => console.log('Test event received'));
    
    const testEvent = new CustomEvent('test-event');
    inputField.dispatchEvent(testEvent);
    
    // Create a test input field
    const testInput = document.createElement('div');
    testInput.innerHTML = `
      <textarea id="test-input" 
                style="position: fixed; bottom: 200px; right: 20px; width: 200px; height: 50px; 
                       z-index: 10000000; background-color: white; border: 2px solid red;">
      </textarea>
    `;
    document.body.appendChild(testInput);
    
    setTimeout(() => {
      document.getElementById('test-input').focus();
      console.log('Test input field created and should be focused');
    }, 500);
    
    return true;
  }
  
  // Run the test after a delay to ensure the widget is ready
  setTimeout(() => {
    testInputField();
  }, 2000);
  
  // Make available globally
  window.testNailAideInput = testInputField;
})();
