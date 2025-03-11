/**
 * NailAide Simulation Controller
 * Helps test availability responses by simulating different scenarios
 */

const NailAideSimulationController = (function() {
    // Current simulation mode
    let currentMode = 'normal'; // 'normal', 'busy', 'available', 'closed'
    
    // Original method references
    const originalMethods = {};
    
    // Check if a module function exists
    function moduleMethodExists(moduleName, methodName) {
        return window[moduleName] && typeof window[moduleName][methodName] === 'function';
    }
    
    // Store original method for later restoration
    function storeOriginalMethod(moduleName, methodName) {
        if (!originalMethods[moduleName]) {
            originalMethods[moduleName] = {};
        }
        
        if (!originalMethods[moduleName][methodName] && moduleMethodExists(moduleName, methodName)) {
            originalMethods[moduleName][methodName] = window[moduleName][methodName];
            return true;
        }
        
        return false;
    }
    
    // Restore all original methods
    function restoreOriginalMethods() {
        for (const moduleName in originalMethods) {
            for (const methodName in originalMethods[moduleName]) {
                if (window[moduleName]) {
                    console.log(`Restoring original method ${moduleName}.${methodName}`);
                    window[moduleName][methodName] = originalMethods[moduleName][methodName];
                }
            }
        }
    }
    
    // Simulate "busy" scenario - no availability
    function simulateBusy() {
        console.log('Simulating BUSY scenario - no availability');
        currentMode = 'busy';
        
        // Override BooksyIntegration.getAvailableSlots
        if (moduleMethodExists('BooksyIntegration', 'getAvailableSlots')) {
            storeOriginalMethod('BooksyIntegration', 'getAvailableSlots');
            
            window.BooksyIntegration.getAvailableSlots = function(date) {
                console.log(`[Simulation] Returning no availability for ${date}`);
                
                let dateString;
                if (date instanceof Date) {
                    dateString = date.toISOString().split('T')[0];
                } else {
                    // Parse various date formats similar to original function
                    const today = new Date();
                    dateString = today.toISOString().split('T')[0];
                    
                    if (typeof date === 'string' && date.toLowerCase().includes('tomorrow')) {
                        const tomorrow = new Date(today);
                        tomorrow.setDate(tomorrow.getDate() + 1);
                        dateString = tomorrow.toISOString().split('T')[0];
                    }
                }
                
                const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
                const day = new Date(dateString).getDay();
                
                return Promise.resolve({
                    date: dateString,
                    dayOfWeek: dayNames[day],
                    available: false,
                    slots: [],
                    message: `Sorry, we're fully booked on ${dayNames[day]}`
                });
            };
        }
        
        // Override BooksyIntegration.checkWalkInPossibility
        if (moduleMethodExists('BooksyIntegration', 'checkWalkInPossibility')) {
            storeOriginalMethod('BooksyIntegration', 'checkWalkInPossibility');
            
            window.BooksyIntegration.checkWalkInPossibility = function(service) {
                console.log(`[Simulation] Returning no walk-in availability for ${service}`);
                return Promise.resolve({
                    possible: false,
                    reason: 'We are fully booked today'
                });
            };
        }
    }
    
    // Simulate "available" scenario - plenty of availability
    function simulateAvailable() {
        console.log('Simulating AVAILABLE scenario - plenty of slots');
        currentMode = 'available';
        
        // Override BooksyIntegration.getAvailableSlots
        if (moduleMethodExists('BooksyIntegration', 'getAvailableSlots')) {
            storeOriginalMethod('BooksyIntegration', 'getAvailableSlots');
            
            window.BooksyIntegration.getAvailableSlots = function(date) {
                console.log(`[Simulation] Returning many available slots for ${date}`);
                
                let dateString;
                if (date instanceof Date) {
                    dateString = date.toISOString().split('T')[0];
                } else {
                    // Parse various date formats similar to original function
                    const today = new Date();
                    dateString = today.toISOString().split('T')[0];
                    
                    if (typeof date === 'string' && date.toLowerCase().includes('tomorrow')) {
                        const tomorrow = new Date(today);
                        tomorrow.setDate(tomorrow.getDate() + 1);
                        dateString = tomorrow.toISOString().split('T')[0];
                    }
                }
                
                const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
                const day = new Date(dateString).getDay();
                
                // Generate slots from 9AM to 5PM every 30 minutes
                const slots = [];
                for (let hour = 9; hour < 17; hour++) {
                    for (let minute of [0, 30]) {
                        slots.push(`${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`);
                    }
                }
                
                return Promise.resolve({
                    date: dateString,
                    dayOfWeek: dayNames[day],
                    available: true,
                    slots: slots,
                    message: `We have ${slots.length} available slots on ${dayNames[day]}`
                });
            };
        }
        
        // Override BooksyIntegration.checkWalkInPossibility
        if (moduleMethodExists('BooksyIntegration', 'checkWalkInPossibility')) {
            storeOriginalMethod('BooksyIntegration', 'checkWalkInPossibility');
            
            window.BooksyIntegration.checkWalkInPossibility = function(service) {
                console.log(`[Simulation] Returning walk-in availability for ${service}`);
                
                // Get appropriate duration for service
                const durations = {
                    'manicure': 30,
                    'pedicure': 45,
                    'gel': 45,
                    'acrylic': 60,
                    'polish change': 15,
                    'nail art': 30,
                    'default': 45
                };
                const duration = durations[service?.toLowerCase()] || durations.default;
                
                // Next available slot is always 30 minutes from now
                const now = new Date();
                let hour = now.getHours();
                let minute = now.getMinutes() >= 30 ? 0 : 30;
                if (minute === 0) hour++;
                
                const nextSlot = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
                
                return Promise.resolve({
                    possible: true,
                    nextSlot: nextSlot,
                    slotsAvailable: 8,
                    serviceDuration: duration
                });
            };
        }
    }
    
    // Simulate "closed" scenario - business is closed
    function simulateClosed() {
        console.log('Simulating CLOSED scenario - business is closed');
        currentMode = 'closed';
        
        // Override BooksyIntegration.getAvailableSlots
        if (moduleMethodExists('BooksyIntegration', 'getAvailableSlots')) {
            storeOriginalMethod('BooksyIntegration', 'getAvailableSlots');
            
            window.BooksyIntegration.getAvailableSlots = function(date) {
                console.log(`[Simulation] Business closed for ${date}`);
                
                let dateString;
                if (date instanceof Date) {
                    dateString = date.toISOString().split('T')[0];
                } else {
                    // Parse various date formats
                    const today = new Date();
                    dateString = today.toISOString().split('T')[0];
                }
                
                const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
                const day = new Date(dateString).getDay();
                
                return Promise.resolve({
                    date: dateString,
                    dayOfWeek: dayNames[day],
                    available: false,
                    slots: [],
                    message: `Sorry, we're closed on ${dayNames[day]}`
                });
            };
        }
        
        // Override BooksyIntegration.checkWalkInPossibility
        if (moduleMethodExists('BooksyIntegration', 'checkWalkInPossibility')) {
            storeOriginalMethod('BooksyIntegration', 'checkWalkInPossibility');
            
            window.BooksyIntegration.checkWalkInPossibility = function() {
                console.log('[Simulation] Business closed for walk-ins');
                return Promise.resolve({
                    possible: false,
                    reason: 'The salon is currently closed'
                });
            };
        }
    }
    
    // Return to normal operation
    function restoreNormal() {
        console.log('Restoring normal operation - no simulation');
        currentMode = 'normal';
        restoreOriginalMethods();
    }
    
    // Public API
    return {
        simulateBusy,
        simulateAvailable,
        simulateClosed,
        restoreNormal,
        getCurrentMode: () => currentMode
    };
})();

// Make the controller available globally for console debugging
window.NailAideSimulation = NailAideSimulationController;
