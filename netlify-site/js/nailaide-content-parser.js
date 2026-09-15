/**
 * NailAide Content Parser
 * Extracts website content for use in the chat widget
 */

const WebsiteContent = (function() {
  // Storage for parsed content
  const contentStore = {
    pages: {},
    sections: [],
    services: [],
    lastUpdated: null
  };
  
  // Page definitions - which pages to fetch and how to extract content
  const pageDefinitions = [
    {
      id: 'about',
      url: 'about.html',
      title: 'About Us',
      keywords: ['about', 'about us', 'company', 'story', 'history', 'mission', 'who we are'],
      selectors: {
        content: '.about-container, main, #about-section',
        sections: 'section, .section, .content-section'
      }
    },
    {
      id: 'services',
      url: 'services.html',
      title: 'Our Services',
      keywords: ['services', 'treatments', 'offerings', 'what we do', 'nail services', 'spa services', 'procedures', 'manicure', 'pedicure'],
      selectors: {
        content: '.services-container, main, #services-section',
        services: '.service-item, .service, .service-card'
      }
    },
    {
      id: 'news',
      url: 'news.html',
      title: 'News & Updates',
      keywords: ['news', 'updates', 'articles', 'blog', 'posts', 'events', 'announcements'],
      selectors: {
        content: '.news-container, main, #news-section',
        articles: '.news-item, .post, article, .article'
      }
    },
    {
      id: 'steps',
      url: 'steps-to-success.html',
      title: 'Steps To Success',
      keywords: ['steps to success', 'program', 'initiative', 'foundation', 'charity'],
      selectors: {
        content: '.steps-container, main, #steps-section',
        steps: '.step-item, .step, .success-step'
      }
    }
  ];
  
  // Parse all defined pages
  async function parseAllPages() {
    console.log('WebsiteContent: Starting to parse all pages...');
    
    for (const pageDef of pageDefinitions) {
      try {
        await parsePage(pageDef);
      } catch (error) {
        console.error(`Error parsing page ${pageDef.id}:`, error);
      }
    }
    
    contentStore.lastUpdated = new Date();
    console.log('WebsiteContent: All pages parsed');
    
    // Save to session storage for persistence
    saveToStorage();
    
    return contentStore;
  }
  
  // Parse a single page based on its definition
  async function parsePage(pageDef) {
    console.log(`WebsiteContent: Parsing page ${pageDef.id} - ${pageDef.url}`);
    
    try {
      // Fetch HTML content from the page
      const response = await fetch(pageDef.url);
      if (!response.ok) {
        throw new Error(`Failed to fetch ${pageDef.url}: ${response.status}`);
      }
      
      const html = await response.text();
      
      // Create a temporary DOM element to parse the HTML
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, 'text/html');
      
      // Extract page content
      const pageContent = {
        id: pageDef.id,
        title: pageDef.title,
        url: pageDef.url,
        summary: extractPageSummary(doc, pageDef),
        sections: extractSections(doc, pageDef),
        keywords: pageDef.keywords || []
      };
      
      // Extract additional content specific to page type
      if (pageDef.id === 'services') {
        pageContent.services = extractServices(doc, pageDef);
        contentStore.services = pageContent.services;
      }
      
      // Store the page content
      contentStore.pages[pageDef.id] = pageContent;
      
      // Add sections to global sections list
      if (pageContent.sections && pageContent.sections.length > 0) {
        pageContent.sections.forEach(section => {
          contentStore.sections.push({
            ...section,
            pageId: pageDef.id,
            pageTitle: pageDef.title,
            pageUrl: pageDef.url
          });
        });
      }
      
      console.log(`WebsiteContent: Successfully parsed ${pageDef.id}`);
      return pageContent;
      
    } catch (error) {
      console.error(`WebsiteContent: Error parsing ${pageDef.url}:`, error);
      return null;
    }
  }
  
  // Extract a summary of the page
  function extractPageSummary(doc, pageDef) {
    // Try to find main content area
    const contentElement = doc.querySelector(pageDef.selectors.content);
    
    if (!contentElement) {
      // Fallback to basic content extraction
      const paragraphs = Array.from(doc.querySelectorAll('p')).slice(0, 2);
      return paragraphs.map(p => p.textContent.trim()).join(' ');
    }
    
    // Get the first few paragraphs
    const paragraphs = Array.from(contentElement.querySelectorAll('p')).slice(0, 2);
    return paragraphs.map(p => p.textContent.trim()).join(' ');
  }
  
  // Extract sections from a page
  function extractSections(doc, pageDef) {
    const sections = [];
    
    // Try to find sections using the selector
    const sectionElements = doc.querySelectorAll(pageDef.selectors.sections);
    
    if (sectionElements && sectionElements.length > 0) {
      sectionElements.forEach((section, index) => {
        // Get section title
        let title = '';
        const headingElement = section.querySelector('h1, h2, h3, h4, h5, h6');
        if (headingElement) {
          title = headingElement.textContent.trim();
        } else {
          title = `Section ${index + 1}`;
        }
        
        // Get section content (paragraphs)
        const paragraphs = Array.from(section.querySelectorAll('p'));
        const content = paragraphs.map(p => p.textContent.trim()).join(' ');
        
        // Check if section has enough content
        if (content.length > 10) {
          sections.push({
            id: slugify(title),
            title: title,
            content: content
          });
        }
      });
    } else {
      // Fallback to extracting headings and their following paragraphs
      const headings = doc.querySelectorAll('h1, h2, h3, h4');
      headings.forEach(heading => {
        const title = heading.textContent.trim();
        
        // Get next paragraphs
        let content = '';
        let nextElement = heading.nextElementSibling;
        
        // Gather content until the next heading or max 3 paragraphs
        let paragraphCount = 0;
        while (nextElement && paragraphCount < 3 && 
              !['H1', 'H2', 'H3', 'H4'].includes(nextElement.tagName)) {
          if (nextElement.tagName === 'P') {
            content += ' ' + nextElement.textContent.trim();
            paragraphCount++;
          }
          nextElement = nextElement.nextElementSibling;
        }
        
        if (content.length > 10) {
          sections.push({
            id: slugify(title),
            title: title,
            content: content.trim()
          });
        }
      });
    }
    
    return sections;
  }
  
  // Extract services from the services page
  function extractServices(doc, pageDef) {
    const services = [];
    
    // Try to find service items using the selector
    const serviceElements = doc.querySelectorAll(pageDef.selectors.services);
    
    if (serviceElements && serviceElements.length > 0) {
      serviceElements.forEach(service => {
        // Get service title
        let title = '';
        const headingElement = service.querySelector('h1, h2, h3, h4, h5, h6, .title, .service-title');
        if (headingElement) {
          title = headingElement.textContent.trim();
        }
        
        // Get service description
        let description = '';
        const descElement = service.querySelector('p, .description, .service-description');
        if (descElement) {
          description = descElement.textContent.trim();
        }
        
        // Get service price
        let price = '';
        const priceElement = service.querySelector('.price, .service-price');
        if (priceElement) {
          price = priceElement.textContent.trim();
        } else {
          // Try to find price in the text
          const priceRegex = /\$\d+(\.\d{2})?/;
          const priceMatch = service.textContent.match(priceRegex);
          if (priceMatch) {
            price = priceMatch[0];
          }
        }
        
        // Only add if we have at least a title
        if (title) {
          services.push({
            id: slugify(title),
            title: title,
            description: description,
            price: price
          });
        }
      });
    } else {
      // Fallback: Try to find services in a more general way
      // Look for headings with price information nearby
      const headings = doc.querySelectorAll('h2, h3, h4');
      headings.forEach(heading => {
        const title = heading.textContent.trim();
        
        // Check if this looks like a service heading
        if (isServiceHeading(title)) {
          let description = '';
          let price = '';
          
          // Look for price in the heading text
          const priceRegex = /\$\d+(\.\d{2})?/;
          const priceMatch = heading.textContent.match(priceRegex);
          if (priceMatch) {
            price = priceMatch[0];
          }
          
          // Get description from next paragraph
          const nextP = heading.nextElementSibling;
          if (nextP && nextP.tagName === 'P') {
            description = nextP.textContent.trim();
          }
          
          // Look for price in nearby elements if not found in heading
          if (!price) {
            let nextEl = heading.nextElementSibling;
            let count = 0;
            while (nextEl && count < 3) {
              const elPriceMatch = nextEl.textContent.match(priceRegex);
              if (elPriceMatch) {
                price = elPriceMatch[0];
                break;
              }
              nextEl = nextEl.nextElementSibling;
              count++;
            }
          }
          
          services.push({
            id: slugify(title),
            title: title,
            description: description,
            price: price
          });
        }
      });
    }
    
    return services;
  }
  
  // Determine if a heading looks like a service heading
  function isServiceHeading(text) {
    const serviceKeywords = [
      'manicure', 'pedicure', 'nail', 'polish', 'gel', 'acrylic',
      'treatment', 'massage', 'facial', 'waxing', 'service', 'package'
    ];
    
    text = text.toLowerCase();
    
    // Check for service keywords
    if (serviceKeywords.some(keyword => text.includes(keyword))) {
      return true;
    }
    
    // Check for price indicators
    if (text.includes('$') || text.includes('price')) {
      return true;
    }
    
    return false;
  }
  
  // Helper function to create URL-friendly slug from text
  function slugify(text) {
    return text.toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }
  
  // Store content in session storage for reuse
  function saveToStorage() {
    try {
      sessionStorage.setItem('nailaide_content', JSON.stringify(contentStore));
      console.log('WebsiteContent: Saved to session storage');
    } catch (error) {
      console.error('WebsiteContent: Error saving to session storage', error);
    }
  }
  
  // Load content from session storage
  function loadFromStorage() {
    try {
      const storedContent = sessionStorage.getItem('nailaide_content');
      if (storedContent) {
        Object.assign(contentStore, JSON.parse(storedContent));
        console.log('WebsiteContent: Loaded from session storage');
        return true;
      }
    } catch (error) {
      console.error('WebsiteContent: Error loading from session storage', error);
    }
    return false;
  }
  
  // Search for content across all pages
  function searchContent(query) {
    query = query.toLowerCase();
    const results = [];
    
    // Search in pages
    Object.values(contentStore.pages).forEach(page => {
      if (page.title.toLowerCase().includes(query) ||
          page.summary.toLowerCase().includes(query) ||
          page.keywords.some(k => k.includes(query))) {
        results.push({
          type: 'page',
          item: page,
          relevance: calculateRelevance(query, page)
        });
      }
    });
    
    // Search in sections
    contentStore.sections.forEach(section => {
      if (section.title.toLowerCase().includes(query) ||
          section.content.toLowerCase().includes(query)) {
        results.push({
          type: 'section',
          item: section,
          relevance: calculateRelevance(query, section)
        });
      }
    });
    
    // Search in services
    contentStore.services.forEach(service => {
      if (service.title.toLowerCase().includes(query) ||
          (service.description && service.description.toLowerCase().includes(query))) {
        results.push({
          type: 'service',
          item: service,
          relevance: calculateRelevance(query, service)
        });
      }
    });
    
    // Sort by relevance (highest first)
    results.sort((a, b) => b.relevance - a.relevance);
    
    return results;
  }
  
  // Calculate relevance score of a result to the query
  function calculateRelevance(query, item) {
    let score = 0;
    query = query.toLowerCase();
    
    // Title match is very relevant
    if (item.title && item.title.toLowerCase().includes(query)) {
      score += 10;
      // Exact title match or close
      if (item.title.toLowerCase() === query || 
          item.title.toLowerCase().replace(/^(the|a|an) /, '') === query) {
        score += 10;
      }
    }
    
    // Content match
    if (item.content && item.content.toLowerCase().includes(query)) {
      score += 5;
    }
    
    // Description match (for services)
    if (item.description && item.description.toLowerCase().includes(query)) {
      score += 5;
    }
    
    // Summary match (for pages)
    if (item.summary && item.summary.toLowerCase().includes(query)) {
      score += 5;
    }
    
    // Keyword match (for pages)
    if (item.keywords && item.keywords.some(k => k.includes(query))) {
      score += 7;
    }
    
    return score;
  }
  
  // Initialize the content parser
  async function init() {
    console.log('WebsiteContent: Initializing...');
    
    // First try to load from session storage
    const loaded = loadFromStorage();
    
    // If not loaded or it's been more than 1 hour, parse pages
    if (!loaded || 
        !contentStore.lastUpdated || 
        (new Date() - new Date(contentStore.lastUpdated) > 60 * 60 * 1000)) {
      await parseAllPages();
    }
    
    return contentStore;
  }
  
  // Public API
  return {
    init: init,
    getContent: () => contentStore,
    searchContent: searchContent,
    parsePage: parsePage,
    parseAllPages: parseAllPages
  };
})();

// Auto-initialize if NailAide is loaded
document.addEventListener('DOMContentLoaded', function() {
  WebsiteContent.init();
  
  // Make sure we update NailAide when it loads
  window.addEventListener('nailaide:loaded', function() {
    console.log("NailAide loaded event detected, updating with website content");
    WebsiteContent.init();
  });
});

// Export to global scope
window.WebsiteContent = WebsiteContent;
