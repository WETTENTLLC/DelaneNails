/**
 * Basic WebsiteContent Module
 * Provides current site information for the chat widget
 */

(function() {
  console.log('Basic WebsiteContent module loaded');
  
  if (typeof window.WebsiteContent !== 'undefined') {
    console.log('WebsiteContent already exists, not overriding');
    return;
  }
  
  // Current website information
  const basicSiteInfo = {
    business: {
      name: "Delane's Natural Nail Care & Medi-Spa",
      address: "333 Estudillo Ave, Suite 204, San Leandro, CA 94577",
      phone: "(510) 346-2457",
      email: "delane@delanesnails.com",
      hours: {
        wednesday: "11:00 AM - 7:00 PM",
        thursday: "11:00 AM - 7:00 PM", 
        friday: "11:00 AM - 7:00 PM",
        saturday: "9:00 AM - 3:00 PM",
        tuesday: "Mobile & At-Home Visits Only",
        sunday: "Closed",
        monday: "Closed"
      },
      bookingUrl: "https://booksy.com/en-us/195354_delane-s-natural-nail-care_nail-salon_101290_san-leandro#ba_s=seo",
      rating: "4.9 stars on Yelp with 500+ reviews"
    },
    services: [
      { id: 'mobile-pedicure', title: 'Mobile Pedicure', price: '$135+', duration: '2h' },
      { id: 'mobile-combo', title: 'Mobile Manicure and Pedicure', price: '$175+', duration: '3h' },
      { id: 'express-pedicure', title: 'Luxurious Express Pedicure', price: '$45', duration: '30min' },
      { id: 'spa-pedicure', title: 'Spa Pedicure', price: '$65', duration: '1h' },
      { id: 'specialized-pedicure-1', title: 'Specialized Pedicure I', price: '$75', duration: '1h' },
      { id: 'specialized-pedicure-2', title: 'Specialized Pedicure II', price: '$85', duration: '1h' },
      { id: 'keryflex', title: 'Keryflex (Prosthetic Nail Care)', price: '$200', duration: '1h 30min' },
      { id: 'gelish-manicure', title: 'Gelish Manicure', price: '$55-60', duration: '1h' },
      { id: 'ibx-manicure', title: 'IBX Restorative Manicure', price: '$50-55', duration: '1h' }
    ],
    products: [
      { id: 'dadi-oil', title: 'Dadi Oil & Anti-Fungal Oil', price: '$6-25' },
      { id: 'lotions', title: 'Luxury Lotions', price: '$18-28' },
      { id: 'sugar-scrub', title: 'Sugar Scrub', price: '$22' }
    ],
    lastUpdated: new Date()
  };
  
  window.WebsiteContent = {
    getContent: function() {
      return basicSiteInfo;
    },
    
    searchContent: function(query) {
      query = query.toLowerCase();
      const results = [];
      
      // Search services
      basicSiteInfo.services.forEach(service => {
        if (service.title.toLowerCase().includes(query)) {
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
    }
  };
  
  console.log('Basic WebsiteContent module initialized');
})();