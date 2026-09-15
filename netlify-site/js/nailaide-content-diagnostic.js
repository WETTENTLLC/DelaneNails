/**
 * NailAide Content Diagnostic
 * This script helps diagnose issues with WebsiteContent functionality
 */

(function() {
  console.log('Content diagnostic tool loaded');

  // Run diagnostics after page is fully loaded
  window.addEventListener('load', function() {
    runDiagnostics();
  });

  function runDiagnostics() {
    console.group('WebsiteContent Diagnostics');
    
    // Check if WebsiteContent object exists
    if (typeof window.WebsiteContent === 'undefined') {
      console.error('WebsiteContent global object is not defined!');
      fixWebsiteContent();
      console.groupEnd();
      return;
    }
    
    console.log('WebsiteContent global object exists');
    
    // Check if required methods exist
    const requiredMethods = ['getContent', 'searchContent', 'init', 'parseAllPages'];
    const missingMethods = [];
    
    requiredMethods.forEach(method => {
      if (typeof window.WebsiteContent[method] !== 'function') {
        console.error(`Missing required method: WebsiteContent.${method}`);
        missingMethods.push(method);
      } else {
        console.log(`Method exists: WebsiteContent.${method}`);
      }
    });
    
    if (missingMethods.length > 0) {
      console.error('WebsiteContent is missing required methods!');
      fixWebsiteContent();
      console.groupEnd();
      return;
    }
    
    // Check if content is loaded
    let content;
    try {
      content = window.WebsiteContent.getContent();
      console.log('Content retrieved:', content);
      
      if (!content) {
        console.error('Content is null or undefined');
      } else if (Object.keys(content.pages || {}).length === 0) {
        console.warn('No pages found in content');
        
        // Try to initialize the content
        console.log('Attempting to initialize WebsiteContent...');
        window.WebsiteContent.init()
          .then(() => {
            console.log('WebsiteContent initialized. New content:', window.WebsiteContent.getContent());
          })
          .catch(err => {
            console.error('Error initializing WebsiteContent:', err);
          });
      } else {
        console.log(`Found ${Object.keys(content.pages).length} pages in content`);
        
        // Test search with a simple query
        const searchResults = window.WebsiteContent.searchContent('about');
        console.log('Search results for "about":', searchResults);
      }
    } catch (err) {
      console.error('Error retrieving content:', err);
      fixWebsiteContent();
    }
    
    console.groupEnd();
  }
  
  function fixWebsiteContent() {
    console.log('Attempting to fix WebsiteContent...');
    
    // Create a minimal implementation if missing
    if (typeof window.WebsiteContent === 'undefined') {
      window.WebsiteContent = createMinimalWebsiteContent();
      console.log('Created minimal WebsiteContent implementation');
    }
    
    // Reload the content parser script
    const script = document.createElement('script');
    script.src = 'js/nailaide-content-parser.js';
    script.onload = function() {
      console.log('Content parser reloaded successfully');
      
      // Initialize after reload
      if (typeof window.WebsiteContent.init === 'function') {
        window.WebsiteContent.init()
          .then(() => console.log('WebsiteContent initialized after reload'))
          .catch(err => console.error('Failed to initialize after reload:', err));
      }
    };
    script.onerror = function() {
      console.error('Failed to reload content parser');
    };
    
    document.body.appendChild(script);
  }
  
  function createMinimalWebsiteContent() {
    // Create a minimal implementation to prevent errors
    return {
      _pages: {
        'about': {
          id: 'about',
          title: 'About Us',
          url: 'about.html',
          summary: 'Information about Delane\'s Natural Nail Care & Medi-Spa.'
        },
        'services': {
          id: 'services',
          title: 'Our Services',
          url: 'services.html',
          summary: 'Services offered by Delane\'s Natural Nail Care & Medi-Spa.'
        }
      },
      
      getContent: function() {
        return {
          pages: this._pages,
          sections: [],
          services: [],
          lastUpdated: new Date()
        };
      },
      
      searchContent: function(query) {
        query = query.toLowerCase();
        const results = [];
        
        // Simple search across page titles and summaries
        Object.values(this._pages).forEach(page => {
          if (page.title.toLowerCase().includes(query) ||
              page.summary.toLowerCase().includes(query)) {
            results.push({
              type: 'page',
              item: page,
              relevance: 5
            });
          }
        });
        
        return results;
      },
      
      init: async function() {
        console.log('Minimal WebsiteContent initialized');
        return Promise.resolve();
      },
      
      parseAllPages: async function() {
        console.log('Minimal parseAllPages called');
        return Promise.resolve(this.getContent());
      }
    };
  }
  
  // Add a function to manually refresh content
  window.refreshWebsiteContent = async function() {
    console.log('Manual refresh of WebsiteContent requested');
    
    if (typeof window.WebsiteContent === 'undefined') {
      console.error('WebsiteContent is not defined! Cannot refresh.');
      return false;
    }
    
    try {
      if (typeof window.WebsiteContent.parseAllPages === 'function') {
        console.log('Calling parseAllPages...');
        await window.WebsiteContent.parseAllPages();
        
        const content = window.WebsiteContent.getContent();
        console.log('Content after refresh:', content);
        return true;
      } else {
        console.error('parseAllPages method not available');
        return false;
      }
    } catch (err) {
      console.error('Error refreshing WebsiteContent:', err);
      return false;
    }
  };
})();
