/**
 * Website Content Parser
 * Extracts relevant content from the website for the AI assistant
 */
const WebsiteContent = {
    services: [],
    hours: {},
    contactInfo: {},
    
    initialize: async function() {
        console.log('Initializing WebsiteContent parser...');
        
        try {
            // Extract services
            this.extractServices();
            
            // Extract business hours
            this.extractHours();
            
            // Extract contact information
            this.extractContactInfo();
            
            console.log('WebsiteContent parser initialized successfully');
            return Promise.resolve();
        } catch (error) {
            console.error('Error initializing WebsiteContent:', error);
            return Promise.reject(error);
        }
    },
    
    extractServices: function() {
        // Extract service information from the page or use predefined info
        this.services = [
            { name: 'Natural Nail Manicure', price: '$35', duration: '45 min' },
            { name: 'Gel Manicure', price: '$45', duration: '60 min' },
            { name: 'Spa Pedicure', price: '$50', duration: '50 min' },
            { name: 'Deluxe Pedicure', price: '$65', duration: '75 min' }
        ];
    },
    
    extractHours: function() {
        // Extract business hours from the page or use predefined info
        this.hours = {
            Monday: '9:00 AM - 6:00 PM',
            Tuesday: '9:00 AM - 6:00 PM',
            Wednesday: '9:00 AM - 6:00 PM',
            Thursday: '9:00 AM - 6:00 PM',
            Friday: '9:00 AM - 6:00 PM',
            Saturday: '9:00 AM - 5:00 PM',
            Sunday: 'Closed'
        };
    },
    
    extractContactInfo: function() {
        // Extract contact information from the page or use predefined info
        this.contactInfo = {
            phone: '(123) 456-7890',
            email: 'info@delanesnailcare.com',
            address: '123 Spa Lane, Beauty City, USA'
        };
    },
    
    getServices: function() {
        return this.services;
    },
    
    getHours: function() {
        return this.hours;
    },
    
    getContactInfo: function() {
        return this.contactInfo;
    }
};

// Make available globally
window.WebsiteContent = WebsiteContent;
