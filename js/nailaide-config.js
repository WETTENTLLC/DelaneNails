/**
 * NailAide Configuration
 * This file contains the configuration for the NailAide chat widget
 */

// Global configuration object
window.NAILAIDE_CONFIG = {
  // Base styling
  primaryColor: '#9333ea',
  secondaryColor: '#f3f4f6',
  userBubbleColor: '#e1f5fe',
  
  // Widget settings
  widgetTitle: 'Chat with Us',
  enableOnMobile: true,
  initiallyMinimized: true,
  welcomeMessage: "Hello! How may I help you today?",
  excludedPages: [],
  
  // Business information
  businessInfo: {
    name: "Delane's Natural Nail Care & Medi-Spa",
    phone: "(555) 123-4567",
    email: "info@delanenails.com",
    address: "123 Beauty Lane, Suite 100, Anytown, USA",
    hours: "Mon-Sat: 9am-7pm, Sun: 10am-5pm"
  },
  
  // Booking integration
  booking: {
    enabled: true,
    bookingUrl: 'https://delanesnaturalnailcare.booksy.com/',
    booksyBusinessId: '123456', // Your Booksy business ID
    apiKey: 'demo-key-123456' // For demo purposes only
  },
  
  // Walk-in availability configuration
  availability: {
    enabled: true,
    walkInPremium: 10, // 10% premium for walk-ins
    defaultServiceDuration: 45, // in minutes
    walkInBufferTime: 15, // minimum minutes from now that a walk-in can be scheduled
    services: [
      { id: 'manicure', name: 'Basic Manicure', duration: 30, price: '$30' },
      { id: 'pedicure', name: 'Basic Pedicure', duration: 45, price: '$45' },
      { id: 'gel-manicure', name: 'Gel Manicure', duration: 60, price: '$45' },
      { id: 'gel-pedicure', name: 'Gel Pedicure', duration: 60, price: '$55' }
    ]
  },
  
  // Staff notifications
  notifications: {
    serviceEnabled: true,
    staffPhone: '5551234567', // Staff will receive SMS at this number
    useSimulation: true // Set to false in production
  },
  
  // Response templates
  responseTemplates: {
    booking: "I'd be happy to help you book an appointment! You can use our online booking system.",
    walkIn: "Yes, we do accept walk-ins based on availability! There is a 10% premium for walk-in services compared to scheduled appointments.",
    shopButtonText: 'Browse All Products',
    shopLinkText: 'You can see our complete collection in our online shop.',
    productMoreIntro: 'Here are some other products we offer:'
  },
  
  // Products configuration
  products: {
    enabled: true,
    categories: ['polish', 'care', 'tools'],
    items: [
      {
        id: 'tf-red',
        name: 'Truth & Freedom - Ruby Red',
        category: 'polish',
        price: '$12.99',
        image: 'images/products/truth-freedom-red.jpg',
        description: 'A bold, empowering red polish that makes a statement.',
        url: 'shop.html#tf-red',
        keywords: ['red', 'polish', 'truth', 'freedom']
      },
      {
        id: 'tf-pink',
        name: 'Truth & Freedom - Pink Power',
        category: 'polish',
        price: '$12.99',
        image: 'images/products/truth-freedom-pink.jpg',
        description: 'A vibrant pink polish celebrating feminine strength.',
        url: 'shop.html#tf-pink',
        keywords: ['pink', 'polish', 'truth', 'freedom']
      },
      {
        id: 'cuticle-oil',
        name: 'Nourishing Cuticle Oil',
        category: 'care',
        price: '$9.99',
        image: 'images/products/cuticle-oil.jpg',
        description: 'Natural oils blend to hydrate and strengthen cuticles.',
        url: 'shop.html#cuticle-oil',
        keywords: ['oil', 'cuticle', 'care', 'treatment']
      },
      {
        id: 'nail-file',
        name: 'Professional Nail File',
        category: 'tools',
        price: '$5.99',
        image: 'images/products/nail-file.jpg',
        description: 'Professional-grade file for shaping and smoothing.',
        url: 'shop.html#nail-file',
        keywords: ['file', 'tool', 'shape']
      }
    ]
  }
};

// Log that config is loaded
console.log('NAILAIDE_CONFIG loaded');
