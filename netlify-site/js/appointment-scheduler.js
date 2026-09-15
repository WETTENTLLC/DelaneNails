/**
 * Advanced Appointment Scheduler
 * Provides intelligent appointment recommendations and scheduling assistance
 */

const AppointmentScheduler = {
    availableTimes: null,
    bookingData: null,
    preferredTimes: {},
    staffAvailability: {},
    
    init: function() {
        console.log('Initializing Advanced Appointment Scheduler...');
        
        // Load availability data
        this.loadAvailabilityData();
        
        // Set up Booksy API integration if available
        if (typeof BooksyService !== 'undefined') {
            this.setupBooksyIntegration();
        }
        
        return this;
    },
    
    loadAvailabilityData: function() {
        // First try to get real-time data
        this.fetchRealTimeAvailability()
            .then(data => {
                this.availableTimes = data;
                console.log('Loaded real-time availability data');
            })
            .catch(error => {
                console.warn('Failed to load real-time availability data:', error);
                
                // Fall back to static data if real-time fetch fails
                this.availableTimes = this.getStaticAvailabilityData();
                console.log('Using static availability data as fallback');
            });
    },
    
    fetchRealTimeAvailability: function() {
        return new Promise((resolve, reject) => {
            // Check if we have a Booksy integration
            if (typeof BooksyService !== 'undefined' && BooksyService.fetchAvailableSlots) {
                BooksyService.fetchAvailableSlots()
                    .then(resolve)
                    .catch(reject);
            } else {
                // Try to fetch from our own API
                fetch('/api/availability')
                    .then(response => {
                        if (!response.ok) {
                            throw new Error('Failed to fetch availability');
                        }
                        return response.json();
                    })
                    .then(resolve)
                    .catch(reject);
            }
        });
    },
    
    getStaticAvailabilityData: function() {
        // Generate next 14 days of sample availability
        const availability = {};
        const today = new Date();
        
        for (let i = 0; i < 14; i++) {
            const date = new Date(today);
            date.setDate(today.getDate() + i);
            
            const dateStr = date.toISOString().split('T')[0];
            
            // Skip Sundays (0 is Sunday in JavaScript's getDay())
            if (date.getDay() === 0) {
                availability[dateStr] = [];
                continue;
            }
            
            // Generate timeslots for this day
            const slots = this.generateTimeSlotsForDay(date);
            availability[dateStr] = slots;
        }
        
        return availability;
    },
    
    generateTimeSlotsForDay: function(date) {
        const slots = [];
        const day = date.getDay(); // 0-6, 0 is Sunday
        
        // Define business hours (24hr format)
        const startHour = 10; // 10:00 AM
        const endHour = day === 6 ? 17 : 18; // 5:00 PM for Saturday, 6:00 PM otherwise
        
        // Generate slots every 30 minutes
        for (let hour = startHour; hour < endHour; hour++) {
            for (let minute of [0, 30]) {
                // Add some random availability to make it seem realistic
                const available = Math.random() > 0.3; // 70% chance slot is available
                
                if (available) {
                    slots.push({
                        time: `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`,
                        available: true,
                        duration: 30, // minutes
                        staff: this.getRandomStaff()
                    });
                }
            }
        }
        
        return slots;
    },
    
    getRandomStaff: function() {
        const staff = ['Delane', 'Jessica', 'Michael', 'Sophia'];
        return staff[Math.floor(Math.random() * staff.length)];
    },
    
    setupBooksyIntegration: function() {
        if (typeof BooksyService === 'undefined') return;
        
        // Subscribe to Booksy updates
        BooksyService.onAvailabilityChanged = (newData) => {
            this.availableTimes = newData;
            console.log('Updated availability data from Booksy');
        };
        
        // Initialize with current Booksy data if available
        if (BooksyService.currentAvailability) {
            this.availableTimes = BooksyService.currentAvailability;
        }
    },
    
    // Find available appointments matching given criteria
    findAvailableAppointments: function(criteria = {}) {
        if (!this.availableTimes) {
            console.warn('Availability data not loaded yet');
            return [];
        }
        
        // Default criteria
        const defaults = {
            serviceType: null,    // e.g., "manicure", "pedicure"
            startDate: null,      // earliest date to consider (ISO string or Date)
            endDate: null,        // latest date to consider (ISO string or Date)
            preferredDays: [],    // e.g., ["Monday", "Wednesday"]
            preferredTimes: [],   // e.g., ["morning", "afternoon"] or specific times
            duration: 60,         // service duration in minutes
            staff: null           // preferred staff member
        };
        
        // Merge with provided criteria
        const options = { ...defaults, ...criteria };
        
        // Convert date strings to Date objects if needed
        if (typeof options.startDate === 'string') {
            options.startDate = new Date(options.startDate);
        }
        if (typeof options.endDate === 'string') {
            options.endDate = new Date(options.endDate);
        }
        
        // Default startDate to today if not provided
        if (!options.startDate) {
            options.startDate = new Date();
        }
        
        // Default endDate to 14 days from startDate if not provided
        if (!options.endDate) {
            options.endDate = new Date(options.startDate);
            options.endDate.setDate(options.startDate.getDate() + 14);
        }
        
        // Extract day numbers for preferred days if provided
        const preferredDayNumbers = [];
        if (options.preferredDays && options.preferredDays.length > 0) {
            const dayMap = {
                sunday: 0, monday: 1, tuesday: 2, wednesday: 3,
                thursday: 4, friday: 5, saturday: 6
            };
            
            options.preferredDays.forEach(day => {
                const dayLower = day.toLowerCase();
                if (dayMap[dayLower] !== undefined) {
                    preferredDayNumbers.push(dayMap[dayLower]);
                }
            });
        }
        
        // Find matching slots
        const matches = [];
        const currentDate = new Date(options.startDate);
        
        while (currentDate <= options.endDate) {
            const dateStr = currentDate.toISOString().split('T')[0];
            
            // Check if we have availability data for this date
            if (this.availableTimes && this.availableTimes[dateStr]) {
                // Check if this day matches preferred days filter
                const dayNumber = currentDate.getDay();
                const isDayMatch = preferredDayNumbers.length === 0 || 
                                   preferredDayNumbers.includes(dayNumber);
                
                if (isDayMatch) {
                    // Process slots for this day
                    const slotsForDay = this.availableTimes[dateStr];
                    
                    slotsForDay.forEach(slot => {
                        // Check if this slot matches all criteria
                        if (this.isSlotMatch(slot, options)) {
                            // Add match with full date information
                            matches.push({
                                date: dateStr,
                                time: slot.time,
                                staff: slot.staff,
                                duration: options.duration,
                                fullDateTime: `${dateStr}T${slot.time}:00`
                            });
                        }
                    });
                }
            }
            
            // Move to next day
            currentDate.setDate(currentDate.getDate() + 1);
        }
        
        return matches;
    },
    
    isSlotMatch: function(slot, criteria) {
        // Check if slot is available
        if (!slot.available) return false;
        
        // Check staff member if specified
        if (criteria.staff && slot.staff !== criteria.staff) return false;
        
        // Check for time of day match if preferred times specified
        if (criteria.preferredTimes && criteria.preferredTimes.length > 0) {
            // Parse time values
            const [hours, minutes] = slot.time.split(':').map(Number);
            const timeOfDay = this.getTimeOfDay(hours);
            
            // Check if specific times or general time of day
            const hasTimeMatch = criteria.preferredTimes.some(preferredTime => {
                // Check for specific time format (HH:MM)
                if (/^\d{1,2}:\d{2}$/.test(preferredTime)) {
                    return preferredTime === slot.time;
                }
                // Check for time of day match
                return preferredTime.toLowerCase() === timeOfDay;
            });
            
            if (!hasTimeMatch) return false;
        }
        
        return true;
    },
    
    getTimeOfDay: function(hours) {
        if (hours < 12) return 'morning';
        if (hours < 17) return 'afternoon';
        return 'evening';
    },
    
    // Get recommended appointment slots based on user preferences and availability
    getRecommendedSlots: function(userPreferences = {}) {
        // Get all available slots that match basic criteria
        const availableSlots = this.findAvailableAppointments({
            serviceType: userPreferences.serviceType,
            startDate: userPreferences.startDate || new Date(),
            preferredDays: userPreferences.preferredDays || [],
            preferredTimes: userPreferences.preferredTimes || []
        });
        
        // If we have enough slots, just return them
        if (availableSlots.length <= 5) {
            return availableSlots;
        }
        
        // Otherwise, prioritize slots based on factors like:
        // 1. Proximity to preferred times
        // 2. Popularity of time slots
        // 3. Staff ratings
        
        // For this implementation, we'll just take the first 5 slots
        return availableSlots.slice(0, 5);
    },
    
    // Format appointment slots for display to user
    formatAppointmentOptions: function(slots) {
        if (!slots || slots.length === 0) {
            return "I'm sorry, I couldn't find any available appointments that match your criteria.";
        }
        
        // Format the top options for display
        let response = "Here are some available appointment times:\n\n";
        
        slots.forEach((slot, index) => {
            // Format date nicely
            const dateObj = new Date(`${slot.date}T${slot.time}`);
            const formattedDate = dateObj.toLocaleDateString('en-US', {
                weekday: 'long',
                month: 'long',
                day: 'numeric'
            });
            
            // Format time in 12-hour format
            const formattedTime = dateObj.toLocaleTimeString('en-US', {
                hour: 'numeric',
                minute: '2-digit',
                hour12: true
            });
            
            response += `${index + 1}. ${formattedDate} at ${formattedTime}`;
            if (slot.staff) {
                response += ` with ${slot.staff}`;
            }
            response += "\n";
        });
        
        response += "\nWould you like to book any of these times?";
        return response;
    },
    
    // Process a booking request
    processBookingRequest: function(userRequest) {
        const serviceMatch = userRequest.match(/(?:book|schedule|appointment for)(?: a)? (.+?)(?:on|at|tomorrow|next|this|\?|$)/i);
        const service = serviceMatch ? serviceMatch[1].trim() : null;
        
        const dateMatch = userRequest.match(/(?:on|for) (next|this) (monday|tuesday|wednesday|thursday|friday|saturday|sunday)/i);
        const todayMatch = userRequest.match(/\b(today)\b/i);
        const tomorrowMatch = userRequest.match(/\b(tomorrow)\b/i);
        
        const timeMatch = userRequest.match(/(?:at|around) (\d{1,2})(?::(\d{2}))?\s*(am|pm)/i);
        const timeOfDayMatch = userRequest.match(/\b(morning|afternoon|evening)\b/i);
        
        // Build criteria object based on extracted information
        const criteria = {};
        
        if (service) {
            criteria.serviceType = service;
            
            // Set duration based on service type
            if (/pedicure|deluxe/i.test(service)) {
                criteria.duration = 60;
            } else if (/gel|manicure/i.test(service)) {
                criteria.duration = 45;
            } else {
                criteria.duration = 30;
            }
        }
        
        // Process date information
        const today = new Date();
        
        if (dateMatch) {
            const [_, relative, dayName] = dateMatch;
            const dayMap = {
                'monday': 1, 'tuesday': 2, 'wednesday': 3,
                'thursday': 4, 'friday': 5, 'saturday': 6, 'sunday': 0
            };
            const targetDay = dayMap[dayName.toLowerCase()];
            const currentDay = today.getDay();
            
            // Calculate days to add
            let daysToAdd = (targetDay - currentDay + 7) % 7;
            if (relative.toLowerCase() === 'next' || (daysToAdd === 0 && relative.toLowerCase() === 'this')) {
                daysToAdd += 7;
            }
            
            const targetDate = new Date(today);
            targetDate.setDate(today.getDate() + daysToAdd);
            criteria.startDate = targetDate;
            
            // Set end date to the same day
            criteria.endDate = new Date(targetDate);
            
        } else if (tomorrowMatch) {
            const targetDate = new Date(today);
            targetDate.setDate(today.getDate() + 1);
            criteria.startDate = targetDate;
            criteria.endDate = new Date(targetDate);
            
        } else if (todayMatch) {
            criteria.startDate = today;
            criteria.endDate = new Date(today);
        }
        
        // Process time information
        if (timeMatch) {
            let [_, hours, minutes, period] = timeMatch;
            hours = parseInt(hours);
            minutes = minutes ? parseInt(minutes) : 0;
            
            // Convert to 24-hour format
            if (period.toLowerCase() === 'pm' && hours < 12) {
                hours += 12;
            } else if (period.toLowerCase() === 'am' && hours === 12) {
                hours = 0;
            }
            
            // Format as HH:MM
            const timeStr = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
            criteria.preferredTimes = [timeStr];
            
        } else if (timeOfDayMatch) {
            criteria.preferredTimes = [timeOfDayMatch[1].toLowerCase()];
        }
        
        // Find matching slots
        const availableSlots = this.findAvailableAppointments(criteria);
        
        // Format response
        return this.formatAppointmentOptions(availableSlots);
    },
    
    // Open Booksy or other booking system with pre-filled information
    initiateBooking: function(selectedSlot) {
        if (typeof BooksyService !== 'undefined') {
            return BooksyService.openBookingPage(selectedSlot);
        }
        
        // Fallback to generic booking URL
        const baseUrl = 'https://delanesnaturalnailcare.booksy.com/';
        const fullUrl = this.buildBookingUrl(baseUrl, selectedSlot);
        
        window.open(fullUrl, '_blank');
        return "I've opened the booking page for you. Please complete your reservation there.";
    },
    
    buildBookingUrl: function(baseUrl, slot) {
        let url = baseUrl;
        
        // Add parameters if we have a slot
        if (slot) {
            const params = new URLSearchParams();
            
            if (slot.date) params.append('date', slot.date);
            if (slot.time) params.append('time', slot.time);
            if (slot.staff) params.append('staff', slot.staff);
            if (slot.duration) params.append('duration', slot.duration);
            
            // Add the parameters to the URL
            if (params.toString()) {
                url += url.includes('?') ? '&' : '?';
                url += params.toString();
            }
        }
        
        return url;
    }
};

// Initialize on load
document.addEventListener('DOMContentLoaded', function() {
    setTimeout(() => {
        AppointmentScheduler.init();
    }, 1500);
});

// Make available globally
window.AppointmentScheduler = AppointmentScheduler;
