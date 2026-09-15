/**
 * Booksy Integration Module for NailAide
 * Fetches real-time availability information from Booksy API
 */

const BooksyIntegration = (function() {
    // Configuration
    const config = {
        businessId: '512223', // Your Booksy business ID (can be updated from NAILAIDE_CONFIG)
        cacheTime: 5 * 60 * 1000, // Cache availability data for 5 minutes
        apiBase: 'https://booksy.com/api/us/public/businesses/', // Booksy API base URL
        requestHeaders: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        }
    };
    
    // Cache for availability data
    let availabilityCache = {
        data: null,
        timestamp: 0
    };

    // Service durations in minutes (used for walk-in estimates)
    const serviceDurations = {
        'manicure': 30,
        'pedicure': 45,
        'gel': 45,
        'acrylic': 60,
        'polish change': 15,
        'nail art': 30,
        'default': 45 // Default duration if service not specified
    };

    // New: Method to update business ID from config
    function setBusinessId(id) {
        if (id) {
            config.businessId = id;
            console.log(`Booksy business ID updated to: ${id}`);
            // Clear cache when ID changes
            availabilityCache.data = null;
            availabilityCache.timestamp = 0;
        }
    }

    // New: Method to update service durations from config
    function setServiceDurations(durations) {
        if (durations && typeof durations === 'object') {
            Object.assign(serviceDurations, durations);
            console.log('Service durations updated from config');
        }
    }
    
    // New: Method to update cache time from config
    function setCacheTime(minutes) {
        if (minutes && typeof minutes === 'number') {
            config.cacheTime = minutes * 60 * 1000;
            console.log(`Cache time updated to ${minutes} minutes`);
        }
    }

    // New: Method to force refresh the cache
    function refreshCache() {
        console.log('Forcing refresh of availability data');
        availabilityCache.data = null;
        availabilityCache.timestamp = 0;
        return getAvailability(); // This will fetch fresh data
    }
    
    /**
     * Fetch availability data from Booksy API or cache
     * @returns {Promise} Promise resolving to availability data
     */
    function getAvailability() {
        const now = Date.now();
        
        // Return cached data if it's still fresh
        if (availabilityCache.data && (now - availabilityCache.timestamp < config.cacheTime)) {
            return Promise.resolve(availabilityCache.data);
        }
        
        // Fetch fresh data from API
        return fetchAvailabilityData()
            .then(data => {
                // Update cache
                availabilityCache.data = data;
                availabilityCache.timestamp = now;
                return data;
            })
            .catch(error => {
                console.error('Error fetching Booksy availability:', error);
                throw error;
            });
    }
    
    /**
     * Fetch availability data from Booksy API
     * @returns {Promise} Promise resolving to availability data
     */
    function fetchAvailabilityData() {
        const url = `${config.apiBase}${config.businessId}/availability`;
        
        // In a real implementation, this would make an authenticated request to the Booksy API
        // For this example, we'll simulate API data since we don't have actual API credentials
        return simulateBooksyData();
    }
    
    /**
     * Simulate Booksy API data for demonstration purposes
     * In a real implementation, this would be replaced with actual API calls
     */
    function simulateBooksyData() {
        return new Promise(resolve => {
            // Generate simulated availability for the next 7 days
            const availability = generateSimulatedAvailability(7);
            
            // Simulate API delay
            setTimeout(() => {
                resolve(availability);
            }, 300);
        });
    }
    
    /**
     * Generate simulated availability data for a number of days
     * @param {number} days - Number of days to generate data for
     * @returns {Array} Array of availability objects
     */
    function generateSimulatedAvailability(days) {
        const availability = [];
        const now = new Date();
        
        for (let i = 0; i < days; i++) {
            const date = new Date(now);
            date.setDate(date.getDate() + i);
            
            // Don't include availability for past times on today
            const dayStart = i === 0 ? 
                Math.max(9, now.getHours() + 1) : 9; // Start at 9 AM or next hour if today
            
            const slots = [];
            
            // Generate random availability slots
            const numberOfSlots = 8 - Math.floor(Math.random() * 4); // 4-8 slots per day
            
            for (let j = 0; j < numberOfSlots; j++) {
                const hour = dayStart + Math.floor(Math.random() * (20 - dayStart)); // Random hour
                const minute = [0, 15, 30, 45][Math.floor(Math.random() * 4)]; // 15-minute intervals
                
                const slot = {
                    time: `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`,
                    available: Math.random() > 0.3 // 70% chance of being available
                };
                
                slots.push(slot);
            }
            
            // Sort slots by time
            slots.sort((a, b) => a.time.localeCompare(b.time));
            
            // Add day's availability
            availability.push({
                date: date.toISOString().split('T')[0],
                dayOfWeek: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][date.getDay()],
                slots: slots
            });
        }
        
        return availability;
    }
    
    /**
     * Check if walk-ins are possible today based on availability
     * @param {string} [service='default'] - Type of service requested
     * @returns {Promise} Promise resolving to walk-in possibility object
     */
    function checkWalkInPossibility(service = 'default') {
        return getAvailability()
            .then(availability => {
                // Get today's availability
                const today = new Date().toISOString().split('T')[0];
                const todayAvail = availability.find(day => day.date === today);
                
                if (!todayAvail) {
                    return { possible: false, reason: 'No availability data for today' };
                }
                
                // Filter for available slots
                const availableSlots = todayAvail.slots.filter(slot => slot.available);
                
                if (availableSlots.length === 0) {
                    return { possible: false, reason: 'No available slots today' };
                }
                
                // Get current time
                const now = new Date();
                const currentHour = now.getHours();
                const currentMinute = now.getMinutes();
                
                // Get service duration
                const duration = serviceDurations[service.toLowerCase()] || serviceDurations.default;
                
                // Check if there's a slot that starts at least 15 minutes from now
                // and allows enough time for the service
                const viableSlots = availableSlots.filter(slot => {
                    const [slotHour, slotMinute] = slot.time.split(':').map(Number);
                    
                    // Convert to minutes since midnight for easier comparison
                    const slotTimeInMinutes = slotHour * 60 + slotMinute;
                    const currentTimeInMinutes = currentHour * 60 + currentMinute + 15; // Add 15 min buffer
                    
                    // Slot must start after current time + 15 min buffer
                    return slotTimeInMinutes > currentTimeInMinutes;
                });
                
                if (viableSlots.length === 0) {
                    return { possible: false, reason: 'No viable slots remaining today' };
                }
                
                // Return positive response with next available slot
                return { 
                    possible: true,
                    nextSlot: viableSlots[0].time,
                    slotsAvailable: viableSlots.length,
                    serviceDuration: duration
                };
            })
            .catch(error => {
                console.error('Error checking walk-in possibility:', error);
                return { possible: 'unknown', reason: 'Could not retrieve availability data' };
            });
    }
    
    /**
     * Get available slots for a specific date
     * @param {string|Date} date - Date to check availability for
     * @returns {Promise} Promise resolving to array of available time slots
     */
    function getAvailableSlots(date) {
        let dateString;
        
        if (date instanceof Date) {
            dateString = date.toISOString().split('T')[0];
        } else if (typeof date === 'string') {
            // Try to parse various date formats
            const parsedDate = new Date(date);
            if (!isNaN(parsedDate)) {
                dateString = parsedDate.toISOString().split('T')[0];
            } else {
                // Handle relative date terms
                const today = new Date();
                
                if (date.toLowerCase().includes('today')) {
                    dateString = today.toISOString().split('T')[0];
                } else if (date.toLowerCase().includes('tomorrow')) {
                    const tomorrow = new Date(today);
                    tomorrow.setDate(tomorrow.getDate() + 1);
                    dateString = tomorrow.toISOString().split('T')[0];
                } else {
                    // Try to extract day of week
                    const daysOfWeek = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
                    const lowerDate = date.toLowerCase();
                    
                    for (let i = 0; i < daysOfWeek.length; i++) {
                        if (lowerDate.includes(daysOfWeek[i])) {
                            const targetDay = i;
                            const currentDay = today.getDay();
                            const daysToAdd = (targetDay + 7 - currentDay) % 7;
                            
                            const targetDate = new Date(today);
                            targetDate.setDate(targetDate.getDate() + (daysToAdd === 0 ? 7 : daysToAdd));
                            dateString = targetDate.toISOString().split('T')[0];
                            break;
                        }
                    }
                }
            }
        }
        
        if (!dateString) {
            return Promise.reject(new Error('Invalid date format'));
        }
        
        return getAvailability()
            .then(availability => {
                const dayAvail = availability.find(day => day.date === dateString);
                
                if (!dayAvail) {
                    return { date: dateString, available: false, message: 'No availability data for this date' };
                }
                
                // Filter for available slots only
                const availableSlots = dayAvail.slots
                    .filter(slot => slot.available)
                    .map(slot => slot.time);
                
                return {
                    date: dateString,
                    dayOfWeek: dayAvail.dayOfWeek,
                    available: availableSlots.length > 0,
                    slots: availableSlots,
                    message: availableSlots.length > 0 
                        ? `We have ${availableSlots.length} available slots on ${dayAvail.dayOfWeek}` 
                        : `Sorry, we're fully booked on ${dayAvail.dayOfWeek}`
                };
            })
            .catch(error => {
                console.error(`Error getting available slots for ${dateString}:`, error);
                return { date: dateString, available: false, message: 'Could not retrieve availability data' };
            });
    }
    
    /**
     * Format availability information into a human-readable response
     * @param {Object} availabilityData - Availability data to format
     * @returns {string} Formatted response
     */
    function formatAvailabilityResponse(availabilityData) {
        if (!availabilityData.available) {
            return availabilityData.message;
        }
        
        const { date, dayOfWeek, slots } = availabilityData;
        
        // Format date for display
        const displayDate = new Date(date);
        const month = displayDate.toLocaleString('default', { month: 'long' });
        const day = displayDate.getDate();
        
        let response = `For ${dayOfWeek}, ${month} ${day}, we have the following available times:\n`;
        
        // Group slots by hour for cleaner display
        const hourGroups = {};
        slots.forEach(time => {
            const hour = parseInt(time.split(':')[0]);
            if (!hourGroups[hour]) {
                hourGroups[hour] = [];
            }
            hourGroups[hour].push(time.split(':')[1]);
        });
        
        // Build response with grouped times
        Object.keys(hourGroups).sort((a, b) => parseInt(a) - parseInt(b)).forEach(hour => {
            const displayHour = hour % 12 || 12;
            const period = hour < 12 ? 'AM' : 'PM';
            response += `${displayHour} ${period}: ${hourGroups[hour].map(min => `:${min}`).join(', ')}\n`;
        });
        
        response += `\nWould you like to book one of these times?`;
        
        return response;
    }

    // Public API
    return {
        getAvailability,
        checkWalkInPossibility,
        getAvailableSlots,
        formatAvailabilityResponse,
        // New: Additional methods for configuration
        setBusinessId,
        setServiceDurations,
        setCacheTime,
        refreshCache
    };
})();

// Make the module available globally
window.BooksyIntegration = BooksyIntegration;

// Auto-configure from NailAide config if available
if (window.NAILAIDE_CONFIG && window.NAILAIDE_CONFIG.availability) {
    const availConfig = window.NAILAIDE_CONFIG.availability;
    
    if (availConfig.booksyBusinessId) {
        BooksyIntegration.setBusinessId(availConfig.booksyBusinessId);
    }
    
    if (availConfig.serviceDurations) {
        BooksyIntegration.setServiceDurations(availConfig.serviceDurations);
    }
    
    if (availConfig.refreshInterval) {
        BooksyIntegration.setCacheTime(availConfig.refreshInterval);
    }
}
