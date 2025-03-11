/**
 * Basic WebsiteContent Module
 * Provides a simple implementation of the WebsiteContent module
 * Use this as a fallback if the main content parser isn't working
 */

(function() {
  console.log('Basic WebsiteContent module loaded');
  
  // Check if WebsiteContent is already defined
  if (typeof window.WebsiteContent !== 'undefined') {
    console.log('WebsiteContent already exists, not overriding');
    return;
  }
  
  // Define basic website information
  const basicSiteInfo = {
    pages: {
      'about': {
        id: 'about',
        title: 'About Us',
        url: 'about.html',
        summary: "At Delane's Natural Nail Care & Medi-Spa, we are dedicated to providing the highest quality nail care and wellness services in a relaxing, professional, and clean environment. Our team of experts is passionate about helping you look and feel your best."
      },
      'services': {
        id: 'services',
        title: 'Our Services',
        url: 'services.html',
        summary: "We offer a range of nail care services including manicures, pedicures, and specialized treatments. In 2025, we're expanding to include Medi Spa services, integrating beauty, health, and wellness into one cohesive experience."
      },
      'shop': {
        id: 'shop',
        title: 'Shop',
        url: 'shop.html',
        summary: "Browse our exclusive Truth & Freedom nail polish collection, featuring colors named in honor of famous women. A portion of the proceeds from every purchase supports our DNNC Steps to Success program."
      },
      'steps': {
        id: 'steps',
        title: 'Steps to Success',
        url: 'steps-to-success.html',
        summary: "DNNC Steps to Success is our nonprofit initiative empowering women through mentorship and career advancement programs."
      }
    },
    sections: [],
    services: [
      {
        id: 'manicure',
        title: 'Manicure',
        description: 'Our signature manicure includes nail shaping, cuticle care, hand massage, and polish application.',
        price: '$30'
      },
      {
        id: 'pedicure',
        title: 'Pedicure',
        description: 'Rejuvenating pedicure treatment includes foot soak, exfoliation, nail care, and massage.',
        price: '$45'
      },
      {
        id: 'gel-polish',
        title: 'Gel Polish Application',
        description: 'Long-lasting gel polish application that stays perfect for up to two weeks.',
        price: '$35'
      }
    ],
    lastUpdated: new Date()
  };
  
  // Create WebsiteContent implementation
  window.WebsiteContent = {
    getContent: function() {
      return basicSiteInfo;
    },
    
    searchContent: function(query) {
      query = query.toLowerCase();
      const results = [];
      
      // Check pages
      Object.values(basicSiteInfo.pages).forEach(page => {
        if (page.title.toLowerCase().includes(query) ||
            page.summary.toLowerCase().includes(query)) {
          results.push({
            type: 'page',
            item: page,
            relevance: 5
          });
        }
      });
      
      // Check services
      basicSiteInfo.services.forEach(service => {
        if (service.title.toLowerCase().includes(query) ||
            service.description.toLowerCase().includes(query)) {
          results.push({
            type: 'service',
            item: service,
            relevance: 5
          });
        }
      });
      
      return results;
    },
    
    init: async function() {
      console.log('Basic WebsiteContent initialized');
      return Promise.resolve();
    },
    
    parseAllPages: async function() {
      console.log('Basic WebsiteContent parsing (no-op)');
      return Promise.resolve(basicSiteInfo);
    }
  };
  
  console.log('Basic WebsiteContent module initialized');
})();
