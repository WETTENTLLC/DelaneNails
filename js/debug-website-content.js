/**
 * WebsiteContent Debug and Repair
 * This script diagnoses and fixes issues with the WebsiteContent module
 */

(function() {
  console.log('WebsiteContent debugger loaded');

  // Run immediate check to see if content is available
  function checkContentAvailability() {
    console.group('WebsiteContent Check');
    
    if (typeof window.WebsiteContent === 'undefined') {
      console.error('WebsiteContent is undefined!');
      console.groupEnd();
      return false;
    }
    
    try {
      const content = window.WebsiteContent.getContent();
      console.log('Content retrieved:', content);
      
      if (!content) {
        console.error('Content is null or undefined');
        return false;
      }
      
      if (!content.pages || Object.keys(content.pages).length === 0) {
        console.warn('No pages in content');
        return false;
      }
      
      // Check if Steps to Success page exists
      const stepsPage = content.pages.steps;
      if (!stepsPage) {
        console.warn('Steps to Success page not found in content');
      } else {
        console.log('Steps to Success page found:', stepsPage);
      }
      
      // Test search functionality
      const testQuery = 'steps to success';
      console.log(`Testing search for: "${testQuery}"`);
      const searchResults = window.WebsiteContent.searchContent(testQuery);
      console.log('Search results:', searchResults);
      
      if (!searchResults || searchResults.length === 0) {
        console.warn('Search returned no results');
        return false;
      }
      
      console.log('WebsiteContent check passed');
      console.groupEnd();
      return true;
    } catch (error) {
      console.error('Error checking WebsiteContent:', error);
      console.groupEnd();
      return false;
    }
  }
  
  // Fix common issues with WebsiteContent
  function repairWebsiteContent() {
    console.log('Repairing WebsiteContent...');
    
    // If WebsiteContent doesn't exist, create a minimal version
    if (typeof window.WebsiteContent === 'undefined') {
      console.log('Creating minimal WebsiteContent...');
      createMinimalWebsiteContent();
      return;
    }
    
    // Fix search function if it's broken
    if (typeof window.WebsiteContent.searchContent !== 'function') {
      console.log('Patching searchContent function...');
      window.WebsiteContent.searchContent = function(query) {
        console.log('Using patched searchContent function for:', query);
        query = query.toLowerCase();
        const results = [];
        
        // Check in pages
        const pages = window.WebsiteContent.getContent().pages || {};
        Object.values(pages).forEach(page => {
          // Make search more flexible
          if (page.title.toLowerCase().includes(query) ||
              page.url.toLowerCase().includes(query) ||
              page.id.toLowerCase().includes(query) ||
              (page.summary && page.summary.toLowerCase().includes(query)) ||
              (page.keywords && page.keywords.some(k => k.toLowerCase().includes(query) || query.includes(k.toLowerCase())))) {
            
            results.push({
              type: 'page',
              item: page,
              relevance: 10
            });
          }
        });
        
        return results;
      };
    }
    
    // Fix the content if the "steps" page is missing
    const content = window.WebsiteContent.getContent();
    if (!content.pages.steps) {
      console.log('Adding missing Steps to Success page...');
      content.pages.steps = {
        id: 'steps',
        title: 'Steps To Success',
        url: 'steps-to-success.html',
        summary: "DNNC Steps to Success is our nonprofit initiative empowering women through mentorship and career advancement programs. Our goal is to provide support, education, and opportunities for women to achieve their professional goals in the beauty industry and beyond.",
        keywords: ['steps to success', 'program', 'initiative', 'foundation', 'nonprofit', 'empowerment']
      };
    }
  }
  
  // Create a minimal WebsiteContent if it's missing
  function createMinimalWebsiteContent() {
    window.WebsiteContent = {
      _content: {
        pages: {
          'about': {
            id: 'about',
            title: 'About Us',
            url: 'about.html',
            summary: "At Delane's Natural Nail Care & Medi-Spa, we are dedicated to providing the highest quality nail care and wellness services in a relaxing, professional, and clean environment."
          },
          'steps': {
            id: 'steps',
            title: 'Steps To Success',
            url: 'steps-to-success.html',
            summary: "DNNC Steps to Success is our nonprofit initiative empowering women through mentorship and career advancement programs."
          },
          'services': {
            id: 'services',
            title: 'Our Services',
            url: 'services.html',
            summary: "We offer a range of nail care services including manicures, pedicures, and specialized treatments."
          }
        },
        sections: [],
        services: [],
        lastUpdated: new Date()
      },
      
      getContent: function() {
        return this._content;
      },
      
      searchContent: function(query) {
        console.log('Searching for:', query);
        query = query.toLowerCase();
        const results = [];
        
        // Check in pages
        Object.values(this._content.pages).forEach(page => {
          // Normalize comparison terms
          const pageTitle = page.title.toLowerCase();
          const pageSummary = (page.summary || '').toLowerCase();
          const pageUrl = page.url.toLowerCase();
          const pageId = page.id.toLowerCase();
          
          // Check if query matches any part of the page
          if (pageTitle.includes(query) || 
              query.includes(pageTitle) ||
              pageId.includes(query) || 
              query.includes(pageId) ||
              pageSummary.includes(query) ||
              pageUrl.includes(query)) {
            
            results.push({
              type: 'page',
              item: page,
              relevance: 10
            });
          }
        });
        
        console.log('Search results:', results);
        return results;
      },
      
      init: function() {
        console.log('Minimal WebsiteContent initialized');
        return Promise.resolve(this._content);
      }
    };
    
    console.log('Minimal WebsiteContent created');
  }

  // Run a check and repair if needed
  const isContentWorking = checkContentAvailability();
  if (!isContentWorking) {
    console.warn('WebsiteContent is not working properly, attempting repairs...');
    repairWebsiteContent();
    
    // Check again after repair
    setTimeout(() => {
      const isFixed = checkContentAvailability();
      if (isFixed) {
        console.log('WebsiteContent successfully repaired!');
      } else {
        console.error('WebsiteContent repair failed.');
      }
    }, 500);
  }
  
  // Add to window for debugging
  window.debugWebsiteContent = {
    check: checkContentAvailability,
    repair: repairWebsiteContent,
    createMinimal: createMinimalWebsiteContent
  };
  
  // Fix common issues with query normalization in NailAide
  if (window.NailAide) {
    console.log('Checking NailAide website content handling...');
    
    // Patch the content query detection function
    if (typeof window.NailAide.isWebsiteContentQuery === 'function') {
      const originalFn = window.NailAide.isWebsiteContentQuery;
      window.NailAide.isWebsiteContentQuery = function(message) {
        // Log the query for debugging
        console.log('Checking if query is for website content:', message);
        
        // Always consider "tell me about X" as a content query
        if (message.toLowerCase().includes('tell me about')) {
          console.log('Matched "tell me about" pattern, treating as content query');
          return true;
        }
        
        return originalFn(message);
      };
    }
  }
})();
