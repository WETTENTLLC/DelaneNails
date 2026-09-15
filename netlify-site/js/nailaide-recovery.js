/**
 * NailAide Recovery Script
 * This script helps recover the NailAide widget if it fails to appear
 */

(function() {
  console.log('NailAide Recovery Script loaded');
  
  // Wait for all content to be loaded
  window.addEventListener('load', function() {
    console.log('Page fully loaded, checking NailAide status');
    
    // Give time for the normal initialization to happen
    setTimeout(checkAndRecoverWidget, 2000);
  });
  
  function checkAndRecoverWidget() {
    // Check if NailAide exists
    if (typeof window.NailAide === 'undefined') {
      console.error('NailAide not found, attempting recovery');
      attemptReloadScripts();
      return;
    }
    
    // Check if widget container exists
    const container = document.querySelector('.nailaide-container');
    const launcher = document.querySelector('.nailaide-launcher');
    
    if (!container && !launcher) {
      console.error('NailAide container and launcher not found, attempting to reinitialize');
      try {
        window.NailAide.init();
        setTimeout(() => window.NailAide.toggle(), 500);
      } catch (e) {
        console.error('Error reinitializing NailAide:', e);
        createEmergencyButton();
      }
      return;
    }
    
    // Check if widget is visible
    if (container && window.getComputedStyle(container).display === 'none' && 
        launcher && window.getComputedStyle(launcher).display === 'none') {
      console.error('NailAide exists but both container and launcher are hidden');
      createEmergencyButton();
    }
  }
  
  function attemptReloadScripts() {
    // Try to reload the required scripts
    const scripts = [
      'js/nailaide-config.js',
      'js/nailaide-shop-parser.js',
      'js/nailaide.js'
    ];
    
    let loaded = 0;
    
    scripts.forEach(src => {
      const script = document.createElement('script');
      script.src = src;
      script.onload = () => {
        loaded++;
        console.log(`Loaded ${src}, ${loaded}/${scripts.length} scripts loaded`);
        
        if (loaded === scripts.length) {
          console.log('All scripts reloaded, attempting to initialize NailAide');
          setTimeout(() => {
            if (typeof window.NailAide !== 'undefined') {
              window.NailAide.init();
              setTimeout(() => window.NailAide.toggle(), 500);
            } else {
              console.error('NailAide still not defined after script reload');
              createEmergencyButton();
            }
          }, 500);
        }
      };
      
      script.onerror = () => {
        console.error(`Failed to load ${src}`);
        createEmergencyButton();
      };
      
      document.body.appendChild(script);
    });
  }
  
  function createEmergencyButton() {
    console.log('Creating emergency recovery button');
    
    // Check if the button already exists
    if (document.getElementById('nailaide-emergency-button')) {
      return;
    }
    
    const button = document.createElement('button');
    button.id = 'nailaide-emergency-button';
    button.textContent = 'Recover NailAide';
    button.style.position = 'fixed';
    button.style.bottom = '20px';
    button.style.right = '20px';
    button.style.backgroundColor = '#ff0000';
    button.style.color = 'white';
    button.style.padding = '15px';
    button.style.borderRadius = '50%';
    button.style.border = 'none';
    button.style.cursor = 'pointer';
    button.style.zIndex = '999999';
    button.style.width = '80px';
    button.style.height = '80px';
    
    button.onclick = function() {
      console.log('Emergency recovery triggered');
      
      // Clean up any existing widgets
      document.querySelectorAll('.nailaide-container, .nailaide-launcher').forEach(el => el.remove());
      
      // Recreate the widget from scratch
      if (typeof window.NailAide !== 'undefined') {
        try {
          window.NailAide.init();
          setTimeout(() => window.NailAide.toggle(), 500);
          
          alert('NailAide recovery attempted. The widget should appear now.');
        } catch (e) {
          console.error('Error during recovery:', e);
          alert('Recovery failed. Please reload the page.');
        }
      } else {
        alert('NailAide not found. Please reload the page.');
      }
    };
    
    document.body.appendChild(button);
  }
})();
