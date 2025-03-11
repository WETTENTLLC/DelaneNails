/**
 * Booksy Integration Service
 * Handles communication with Booksy API for availability checks and bookings
 */

const BooksyService = (function() {
  // Configuration
  let config = {
    businessId: '', // Will be loaded from nailaide-config
    apiKey: '',     // Should be set in nailaide-config 
    baseUrl: 'https://booksy.com/api/v2',
    defaultServiceDuration: 45, // minutes
    walkInBufferTime: 15        // buffer in minutes needed before accepting walk-in
  };
  
  // Cache for availability data to avoid excessive API calls
  let availabilityCache = {
    data: {},
    timestamp: null,
    expiresIn: 5 * 60 * 1000  // 5 minutes
  };
  
  // Initialize the service
  function init(configOptions) {
    console.log('Initializing Booksy service...');
    if (configOptions) {
      config = {...config, ...configOptions};
    }
    
    // Load from global config if exists
    if (window.NAILAIDE_CONFIG && window.NAILAIDE_CONFIG.booking) {
      config.businessId = window.NAILAIDE_CONFIG.booking.booksyBusinessId || config.businessId;
      config.apiKey = window.NAILAIDE_CONFIG.booking.apiKey || config.apiKey;
      
      if (window.NAILAIDE_CONFIG.availability) {
        config.defaultServiceDuration = 
          window.NAILAIDE_CONFIG.availability.defaultServiceDuration || config.defaultServiceDuration;
        config.walkInBufferTime = 
          window.NAILAIDE_CONFIG.availability.walkInBufferTime || config.walkInBufferTime;
      }
    }
    
    console.log('Booksy service initialized with ID:', config.businessId);
  }
  
  /**
   * Get today's availability for walk-ins
   * This would normally connect to Booksy's API, but for this implementation
   * we'll create a simulated response based on the current time
   */
  async function getTodayAvailability() {
    // Check cache first
    const now = new Date();
    if (availabilityCache.timestamp && 
        (now - availabilityCache.timestamp) < availabilityCache.expiresIn) {
      console.log('Using cached availability data');
      return availabilityCache.data;
    }
    
    console.log('Fetching today\'s availability...');
    
    try {
      // In a real implementation, this would be an API call to Booksy
      // For now, we'll simulate availability based on current time
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Get current hour and minutes
      const currentHour = now.getHours();
      const currentMinute = now.getMinutes();
      
      // Check if we're within business hours (9am-7pm for this example)
      const businessHours = {
        start: 9,  // 9 AM
        end: 19    // 7 PM
      };
      
      const businessHoursText = window.NAILAIDE_CONFIG?.businessInfo?.hours || 
        "Mon-Sat: 9am-7pm";
      
      if (currentHour < businessHours.start || currentHour >= businessHours.end) {
        return {
          success: true,
          available: false,
          message: `We're currently closed. Business hours are ${businessHoursText}.`,
          slots: []
        };
      }
      
      // Generate available time slots from current time until closing
      const slots = [];
      
      // Start from next quarter hour
      let startMinute = Math.ceil(currentMinute / 15) * 15;
      let startHour = currentHour;
      
      if (startMinute >= 60) {
        startHour += 1;
        startMinute = 0;
      }
      
      // Add buffer time for walk-ins (can't book immediately)
      startMinute += config.walkInBufferTime;
      while (startMinute >= 60) {
        startHour += 1;
        startMinute -= 60;
      }
      
      // If we've gone past closing time after adding buffer
      if (startHour >= businessHours.end) {
        return {
          success: true,
          available: false,
          message: "There's not enough time left today for a walk-in appointment.",
          slots: []
        };
      }
      
      // Generate time slots with a more realistic pattern
      // Some slots will be busy based on time of day
      const busyProbabilityByHour = {
        9: 0.2,  // 20% busy at 9am
        10: 0.3,
        11: 0.5,
        12: 0.7, // Lunch time - busier
        13: 0.7,
        14: 0.5,
        15: 0.4,
        16: 0.6, // After work rush starts
        17: 0.8, // Very busy after work
        18: 0.6
      };
      
      // Generate slots from current time (plus buffer) until closing
      for (let hour = startHour; hour < businessHours.end; hour++) {
        // Start from our calculated start minute for the first hour only
        const minuteStart = (hour === startHour) ? startMinute : 0;
        
        for (let minute = minuteStart; minute < 60; minute += 15) {
          // Skip if this would go past closing
          if (hour === businessHours.end - 1 && minute > 30) continue; 
          
          // Calculate probability based on time of day
          const busyProbability = busyProbabilityByHour[hour] || 0.5;
          
          // Randomly determine if this slot is available
          const isAvailable = Math.random() > busyProbability;
          
          if (isAvailable) {
            const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
            slots.push({
              time: timeString,
              displayTime: formatTimeForDisplay(hour, minute),
              available: true
            });
          }
        }
      }
      
      // Ensure we have at least one time slot if it's early in the day
      if (slots.length === 0 && currentHour < businessHours.end - 2) {
        // Add at least one slot
        const hour = currentHour + 1;
        const minute = 0;
        const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        
        slots.push({
          time: timeString,
          displayTime: formatTimeForDisplay(hour, minute),
          available: true
        });
      }
      
      const result = {
        success: true,
        available: slots.length > 0,
        message: slots.length > 0 
          ? `We have ${slots.length} available ${slots.length === 1 ? 'slot' : 'slots'} for walk-ins today.`
          : "We don't have any available slots for walk-ins today.",
        slots: slots
      };
      
      // Update cache
      availabilityCache.data = result;
      availabilityCache.timestamp = now;
      
      return result;
    }
    catch (error) {
      console.error('Error fetching availability:', error);
      return {
        success: false,
        error: 'Failed to check availability. Please try again later.',
        slots: []
      };
    }
  }
  
  /**
   * Format a time (hour and minute) for display
   */
  function formatTimeForDisplay(hour, minute) {
    const period = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12; // Convert 0 to 12 for 12 AM
    return `${displayHour}:${minute.toString().padStart(2, '0')} ${period}`;
  }
  
  /**
   * Request a walk-in appointment
   * In a real implementation, this would send the request to staff
   */
  async function requestWalkIn(timeSlot, service = 'General Service', customerInfo = {}) {
    console.log('Requesting walk-in for:', timeSlot, service, customerInfo);
    
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // In a real implementation, this would send a notification to staff
      // For demo purposes, we'll simulate a response
      
      // 20% chance of rejection for demo purposes
      const isAccepted = Math.random() > 0.2;
      
      if (isAccepted) {
        return {
          success: true,
          accepted: true,
          message: "Your walk-in request has been accepted!",
          appointmentDetails: {
            time: timeSlot.time,
            displayTime: timeSlot.displayTime,
            service: service,
            referenceNumber: 'W' + Math.floor(100000 + Math.random() * 900000)
          }
        };
      } else {
        return {
          success: true,
          accepted: false,
          message: "We're sorry, but our staff cannot accommodate your walk-in request at this time."
        };
      }
    }
    catch (error) {
      console.error('Error requesting walk-in:', error);
      return {
        success: false,
        error: 'Failed to request walk-in. Please try calling the salon directly.'
      };
    }
  }
  
  // Return public API
  return {
    init: init,
    getTodayAvailability: getTodayAvailability,
    requestWalkIn: requestWalkIn
  };
})();

// Auto-initialize if config is available
document.addEventListener('DOMContentLoaded', function() {
  // Wait a moment for config to load
  setTimeout(() => {
    if (window.NAILAIDE_CONFIG && window.NAILAIDE_CONFIG.booking) {
      BooksyService.init(window.NAILAIDE_CONFIG.booking);
    }
  }, 500);
});

// Make available globally
window.BooksyService = BooksyService;
