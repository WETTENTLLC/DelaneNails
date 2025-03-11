/**
 * NailAide Availability Module
 * Handles availability-related queries and responses
 */

const NailAideAvailability = (function() {
    // Module configuration
    const config = {
        bookingUrl: null,
        templates: {
            availabilityGeneral: "Here's our availability for the next few days:\n\n{availabilitySummary}\n\nWould you like to check a specific date?",
            availabilitySpecific: "For {dayOfWeek}, {month} {day}, we have the following available times:\n{availabilityTimes}\n\nWould you like to book one of these times?",
            availabilityNone: "I'm sorry, we're fully booked on {dayOfWeek}, {month} {day}. Would you like to check another day?",
            walkInPossible: "Yes, we can accommodate a walk-in today! Our next available slot is at {nextSlot}. We have {slotsAvailable} openings remaining today. A typical {service} service takes about {serviceDuration} minutes. Would you like to book this time?",
            walkInNotPossible: "I'm sorry, we cannot accommodate walk-ins today. {reason}. Would you like to book an appointment for another day?"
        }
    };

    // Update booking URL from config
    function setBookingUrl(url) {
        if (url) {
            config.bookingUrl = url;
        }
    }

    // Update templates from config
    function setTemplates(templates) {
        if (templates && typeof templates === 'object') {
            Object.assign(config.templates, templates);
        }
    }

    // Format template with data
    function formatTemplate(templateName, data) {
        let template = config.templates[templateName] || '';
        
        if (!template) {
            console.warn(`Template not found: ${templateName}`);
            return '';
        }
        
        // Replace placeholders with data
        Object.keys(data).forEach(key => {
            const placeholder = `{${key}}`;
            template = template.replace(new RegExp(placeholder, 'g'), data[key]);
        });
        
        return template;
    }

    // Patterns to detect availability questions
    const availabilityPatterns = {
        general: [
            /when are you (open|available)/i,
            /what( are|'s| is) your (hours|availability)/i,
            /(do you have|got) any (availability|openings)/i,
            /check availability/i,
            /available times/i,
            /next available/i
        ],
        specific: [
            /(available|open)( on| for)? (today|tomorrow|monday|tuesday|wednesday|thursday|friday|saturday|sunday)/i,
            /(any|have) (availability|openings)( on| for)? (today|tomorrow|monday|tuesday|wednesday|thursday|friday|saturday|sunday)/i,
            /available (next|this) week/i,
            /(when|time) (can|could) I come in/i
        ],
        walkIn: [
            /walk(-| )in/i,
            /come in (now|today)/i,
            /without (an )?appointment/i,
            /appointment( needed| required)?/i,
            /can i come in/i,
            /drop (in|by)/i
        ]
    };

    /**
     * Detect if a message is asking about availability
     * @param {string} message - User message
     * @returns {Object|false} Availability type and details if detected, otherwise false
     */
    function detectAvailabilityQuestion(message) {
        const lowerMessage = message.toLowerCase();
        
        // Check for walk-in questions
        for (const pattern of availabilityPatterns.walkIn) {
            if (pattern.test(lowerMessage)) {
                return { 
                    type: 'walkIn',
                    service: extractServiceType(lowerMessage)
                };
            }
        }
        
        // Check for specific date availability questions
        for (const pattern of availabilityPatterns.specific) {
            if (pattern.test(lowerMessage)) {
                return { 
                    type: 'specific',
                    date: extractDateReference(lowerMessage)
                };
            }
        }
        
        // Check for general availability questions
        for (const pattern of availabilityPatterns.general) {
            if (pattern.test(lowerMessage)) {
                return { type: 'general' };
            }
        }
        
        return false;
    }
    
    /**
     * Extract service type from message
     * @param {string} message - User message
     * @returns {string} Detected service type or 'default'
     */
    function extractServiceType(message) {
        const serviceTypes = [
            'manicure', 'pedicure', 'gel', 'acrylic', 
            'polish change', 'polish', 'nail art', 
            'spa', 'massage', 'facial'
        ];
        
        const lowerMessage = message.toLowerCase();
        
        for (const service of serviceTypes) {
            if (lowerMessage.includes(service)) {
                return service;
            }
        }
        
        return 'default';
    }
    
    /**
     * Extract date reference from message
     * @param {string} message - User message
     * @returns {string} Detected date reference or 'today'
     */
    function extractDateReference(message) {
        const lowerMessage = message.toLowerCase();
        
        if (lowerMessage.includes('tomorrow')) {
            return 'tomorrow';
        }
        
        const daysOfWeek = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
        for (const day of daysOfWeek) {
            if (lowerMessage.includes(day)) {
                return day;
            }
        }
        
        // Default to today if no specific day found
        return 'today';
    }
    
    /**
     * Generate response for availability question
     * @param {Object} questionDetails - Details about the availability question
     * @returns {Promise} Promise resolving to response text
     */
    function generateAvailabilityResponse(questionDetails) {
        // Make sure we have the Booksy integration
        if (!window.BooksyIntegration) {
            return Promise.resolve("I'm sorry, I can't check availability at the moment. Please call us or use our online booking system.");
        }
        
        switch (questionDetails.type) {
            case 'walkIn':
                return handleWalkInQuestion(questionDetails.service);
                
            case 'specific':
                return handleSpecificAvailabilityQuestion(questionDetails.date);
                
            case 'general':
                return handleGeneralAvailabilityQuestion();
                
            default:
                return Promise.resolve("I can check our availability for you. Would you like to know about a specific date or time?");
        }
    }
    
    /**
     * Handle walk-in questions
     * @param {string} service - Type of service requested
     * @returns {Promise} Promise resolving to response text
     */
    function handleWalkInQuestion(service) {
        // Use Booksy integration to check walk-in possibility
        return BooksyIntegration.checkWalkInPossibility(service)
            .then(result => {
                if (result.possible === true) {
                    // Use template for possible walk-in
                    return formatTemplate('walkInPossible', {
                        nextSlot: result.nextSlot,
                        slotsAvailable: result.slotsAvailable,
                        service: service || 'nail',
                        serviceDuration: result.serviceDuration
                    }) + addBookingButton();
                } else if (result.possible === false) {
                    // Use template for impossible walk-in
                    return formatTemplate('walkInNotPossible', {
                        reason: result.reason || 'We are fully booked'
                    }) + addBookingButton();
                } else {
                    return "I'm having trouble checking our real-time availability right now. For the most accurate information, please call us or use our online booking system." + addBookingButton();
                }
            })
            .catch(error => {
                console.error('Error handling walk-in question:', error);
                return "I'm sorry, I couldn't check our walk-in availability. For the most accurate information, please use our online booking system or give us a call." + addBookingButton();
            });
    }
    
    /**
     * Handle specific date availability questions
     * @param {string} dateRef - Date reference (today, tomorrow, day of week)
     * @returns {Promise} Promise resolving to response text
     */
    function handleSpecificAvailabilityQuestion(dateRef) {
        return BooksyIntegration.getAvailableSlots(dateRef)
            .then(availabilityData => {
                if (availabilityData.available) {
                    // Format the times nicely
                    const formattedTimes = formatTimeSlotsForDisplay(availabilityData.slots);
                    
                    // Get formatted date parts
                    const date = new Date(availabilityData.date);
                    const month = date.toLocaleString('default', { month: 'long' });
                    const day = date.getDate();
                    
                    // Use template for available slots
                    const response = formatTemplate('availabilitySpecific', {
                        dayOfWeek: availabilityData.dayOfWeek,
                        month: month,
                        day: day,
                        availabilityTimes: formattedTimes
                    });
                    
                    // Add booking button
                    return response + addBookingButton();
                } else {
                    // Get formatted date parts
                    const date = new Date(availabilityData.date);
                    const month = date.toLocaleString('default', { month: 'long' });
                    const day = date.getDate();
                    
                    // Use template for no availability
                    const response = formatTemplate('availabilityNone', {
                        dayOfWeek: availabilityData.dayOfWeek,
                        month: month,
                        day: day
                    });
                    
                    // Add booking button to check other days
                    return response + addBookingButton('Check Other Days');
                }
            })
            .catch(error => {
                console.error('Error handling specific availability question:', error);
                return "I'm having trouble checking our availability for that date. Please try our online booking system for the most up-to-date information." + addBookingButton();
            });
    }
    
    /**
     * Handle general availability questions
     * @returns {Promise} Promise resolving to response text
     */
    function handleGeneralAvailabilityQuestion() {
        // Get availability for next 3 days
        const promises = [
            BooksyIntegration.getAvailableSlots('today'),
            BooksyIntegration.getAvailableSlots('tomorrow')
        ];
        
        const afterTomorrow = new Date();
        afterTomorrow.setDate(afterTomorrow.getDate() + 2);
        promises.push(BooksyIntegration.getAvailableSlots(afterTomorrow));
        
        return Promise.all(promises)
            .then(results => {
                // Format availability summary
                let availabilitySummary = '';
                
                results.forEach(dayData => {
                    const date = new Date(dayData.date);
                    const month = date.toLocaleString('default', { month: 'long' });
                    const day = date.getDate();
                    
                    if (dayData.available) {
                        availabilitySummary += `${dayData.dayOfWeek}, ${month} ${day}: ${dayData.slots.length} available slots\n`;
                    } else {
                        availabilitySummary += `${dayData.dayOfWeek}, ${month} ${day}: Fully booked\n`;
                    }
                });
                
                // Use template for general availability
                const response = formatTemplate('availabilityGeneral', {
                    availabilitySummary: availabilitySummary
                });
                
                // Add booking button
                return response + addBookingButton('View Full Calendar & Book');
            })
            .catch(error => {
                console.error('Error handling general availability question:', error);
                return "I'm having trouble retrieving our general availability right now. Please try our online booking system for the most up-to-date information." + addBookingButton();
            });
    }
    
    /**
     * Format time slots for display
     * @param {Array} slots - Array of time strings like "14:30"
     * @returns {string} Formatted times for display
     */
    function formatTimeSlotsForDisplay(slots) {
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
        let response = '';
        Object.keys(hourGroups)
            .sort((a, b) => parseInt(a) - parseInt(b))
            .forEach(hour => {
                const displayHour = hour % 12 || 12;
                const period = hour < 12 ? 'AM' : 'PM';
                response += `${displayHour} ${period}: ${hourGroups[hour].map(min => `${min}`).join(', ')}\n`;
            });
        
        return response;
    }
    
    /**
     * Add a booking button to the response
     * @param {string} [buttonText='Book Appointment Now'] - Text to display on the button
     * @returns {string} HTML for the booking button
     */
    function addBookingButton(buttonText = 'Book Appointment Now') {
        const bookingUrl = config.bookingUrl || 
                          (window.NAILAIDE_CONFIG && window.NAILAIDE_CONFIG.bookingUrl) || 
                          (window.NAILAIDE_CONFIG && window.NAILAIDE_CONFIG.booking && window.NAILAIDE_CONFIG.booking.bookingUrl);
        
        if (!bookingUrl) {
            console.warn('No booking URL found for button');
            return '';
        }
        
        return `\n\n<a href="${bookingUrl}" target="_blank" class="nailaide-booking-button">${buttonText}</a>`;
    }
    
    // Public API
    return {
        detectAvailabilityQuestion,
        generateAvailabilityResponse,
        setBookingUrl,
        setTemplates
    };
})();

// Make the module available globally
window.NailAideAvailability = NailAideAvailability;

// Auto-configure from NailAide config if available
if (window.NAILAIDE_CONFIG) {
    // Set booking URL
    if (window.NAILAIDE_CONFIG.bookingUrl) {
        NailAideAvailability.setBookingUrl(window.NAILAIDE_CONFIG.bookingUrl);
    }
    
    // Set templates
    if (window.NAILAIDE_CONFIG.templates) {
        NailAideAvailability.setTemplates(window.NAILAIDE_CONFIG.templates);
    }
}
