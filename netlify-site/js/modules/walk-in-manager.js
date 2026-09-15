/**
 * Walk-in Manager Module
 * Handles the walk-in appointment flow within NailAide
 */

const WalkInManager = (function() {
  // Track current state of the walk-in flow
  let currentState = 'idle';   // idle, checking, selecting, requesting, confirmed, rejected
  let availableSlots = [];
  let selectedSlot = null;
  let selectedService = 'General Service';
  
  // Configure with default values
  let config = {
    walkInPremium: 10, // percentage
    defaultServiceDuration: 45,
    services: [
      { id: 'manicure', name: 'Manicure', duration: 30 },
      { id: 'pedicure', name: 'Pedicure', duration: 45 },
      { id: 'gel', name: 'Gel Polish', duration: 45 }
    ]
  };
  
  // Initialize the manager
  function init(configOptions) {
    console.log('Initializing Walk-in Manager...');
    if (configOptions) {
      config = {...config, ...configOptions};
    }
    
    // Load from global config if exists
    if (window.NAILAIDE_CONFIG && window.NAILAIDE_CONFIG.availability) {
      if (window.NAILAIDE_CONFIG.availability.walkInPremium) {
        config.walkInPremium = window.NAILAIDE_CONFIG.availability.walkInPremium;
      }
      
      if (window.NAILAIDE_CONFIG.availability.services) {
        config.services = window.NAILAIDE_CONFIG.availability.services;
      }
      
      if (window.NAILAIDE_CONFIG.availability.defaultServiceDuration) {
        config.defaultServiceDuration = window.NAILAIDE_CONFIG.availability.defaultServiceDuration;
      }
    }
    
    console.log('Walk-in Manager initialized');
  }
  
  /**
   * Start the walk-in flow
   * This is called when a user asks about walk-ins
   */
  async function handleWalkInQuery(messageCallback) {
    console.log('Starting walk-in flow');
    
    // Reset state
    currentState = 'checking';
    availableSlots = [];
    selectedSlot = null;
    
    // Show initial message about walk-in policy
    messageCallback(
      `Yes, we do accept walk-ins! Please note that walk-in services have a ${config.walkInPremium}% premium compared to scheduled appointments.`
    );
    
    // Check availability through Booksy service
    try {
      if (!window.BooksyService) {
        throw new Error('Booksy service not available');
      }
      
      // Show checking message
      setTimeout(() => {
        messageCallback('Checking today\'s availability for walk-ins...');
      }, 500);
      
      // Get availability from Booksy
      const availability = await window.BooksyService.getTodayAvailability();
      console.log('Walk-in availability:', availability);
      
      // Update state with available slots
      if (availability.success && availability.available && availability.slots.length > 0) {
        currentState = 'selecting';
        availableSlots = availability.slots;
        
        // Show success message
        setTimeout(() => {
          messageCallback(availability.message);
          
          // Show available times as buttons
          setTimeout(() => {
            displayAvailableTimes(messageCallback);
          }, 500);
        }, 700);
      } else {
        // No availability
        currentState = 'idle';
        
        setTimeout(() => {
          if (availability.success) {
            messageCallback(availability.message || "We don't have any walk-in availability today.");
            
            // Suggest booking a regular appointment
            setTimeout(() => {
              messageCallback("Would you like to book a regular appointment instead?");
              
              // Show booking button
              setTimeout(() => {
                const bookingUrl = window.NAILAIDE_CONFIG?.booking?.bookingUrl || 'https://booksy.com';
                messageCallback(
                  `<a href="${bookingUrl}" target="_blank" class="booking-button" style="display: inline-block; background-color: var(--primary-color, #9333ea); color: white; padding: 10px 20px; border-radius: 4px; text-decoration: none; margin-top: 10px;">Book Regular Appointment</a>`,
                  true
                );
              }, 400);
            }, 700);
          } else {
            messageCallback("I'm having trouble checking our availability right now. Please call us directly for walk-in availability.");
          }
        }, 700);
      }
    }
    catch (error) {
      console.error('Error in walk-in flow:', error);
      currentState = 'idle';
      
      messageCallback("I'm sorry, but I encountered an error checking walk-in availability. Please call us directly at " + 
        (window.NAILAIDE_CONFIG?.businessInfo?.phone || "our salon") + " to check availability.");
    }
  }
  
  /**
   * Display available times for walk-ins
   */
  function displayAvailableTimes(messageCallback) {
    if (availableSlots.length === 0) {
      messageCallback("No available time slots were found."); today.");
      return;
    }
    
    // Create HTML for time slot buttonsailable times
    let html = `ack(`Here are today's available walk-in times. Please select one:`);
      <div class="time-slots-container" style="display: flex; flex-direction: column; gap: 8px; margin: 10px 0;">
        <div style="margin-bottom: 5px;">Please select a time for your walk-in:</div>
    `;t html = `
      <div class="time-slots-container" style="display: flex; flex-wrap: wrap; gap: 8px; margin: 10px 0;">
    availableSlots.forEach((slot, index) => {
      html += `
        <button hour for better organization
          onclick="WalkInManager.selectTimeSlot(${index})"
          class="time-slot-button" {
          style="background-color: var(--primary-color, #9333ea); color: white; border: none; border-radius: 4px; padding: 8px 12px; margin: 2px; cursor: pointer; font-size: 14px;"
          data-index="${index}">
          ${slot.displayTime}];
        </button>
      `;otsByHour[hour].push(slot);
    });
    
    html += `</div>`;grouped by hour
    Object.keys(slotsByHour).sort().forEach(hour => {
    // Add the time slots to the chatAM/PM for the heading
      const firstSlot = slotsByHour[hour][0];
      const hourInt = parseInt(hour);
      const period = hourInt >= 12 ? 'PM' : 'AM';
      const displayHour = hourInt % 12 || 12; // Convert 0 to 12 for 12 AM
      
      html += `
        <div style="width: 100%; margin-top: 8px; margin-bottom: 4px; font-weight: bold;">
          ${displayHour} ${period}:
        </div>
      `;
      
      // Add all time slots for this hour
      html += `<div style="display: flex; flex-wrap: wrap; gap: 5px; width: 100%;">`;
      slotsByHour[hour].forEach((slot, index) => {
        html += `
          <button 
            onclick="WalkInManager.selectTimeSlot(${availableSlots.indexOf(slot)})"
            class="time-slot-button" 
            style="background-color: var(--primary-color, #9333ea); color: white; border: none; border-radius: 4px; padding: 8px 12px; margin: 2px; flex-grow: 0; flex-basis: auto; cursor: pointer; font-size: 14px;"
            data-index="${availableSlots.indexOf(slot)}">
            ${slot.displayTime.split(' ')[0]} ${period}
          </button>
        `;
      });
      html += `</div>`;
    });
    
    html += `</div>`;
    
    // Add the time slots to the chat with a note about the 10% premium
    messageCallback(html, true);
    
    // Remind about the 10% premium
    setTimeout(() => {
      messageCallback(`Remember, walk-ins have a ${config.walkInPremium}% premium compared to scheduled appointments.`);
    }, 800);
  }
  
  /**
   * Handle time slot selection
   */
  function selectTimeSlot(index) {
    console.log('Time slot selected:', index);
    
    if (index >= 0 && index < availableSlots.length) {
      selectedSlot = availableSlots[index];
      currentState = 'requesting';
      >
      // Find NailAide and send a system messagect a service:</div>
      if (window.NailAide && typeof window.NailAide.handleSystemAction === 'function') {
        window.NailAide.handleSystemAction('timeSelected', { 
          time: selectedSlot.displayTime,
          index: index
        });
      } else {
        console.error('Cannot find NailAide to handle time selection');
      }-align: left;"
    } else {
      console.error('Invalid time slot index:', index);
    }yle="font-size: 12px; margin-top: 3px;">
  }    Duration: ${config.defaultServiceDuration} min
        <span style="float: right; font-weight: bold;">Ask for pricing</span>
  /**
   * Handle system action from time slot selection
   * Called by NailAide when a user selects a time slot
   */
  function handleTimeSelection(timeDetails, messageCallback) {
    // Show confirmation of time selectionice, index) => {
    messageCallback(`You selected ${timeDetails.time}. Would you like a specific service or our general service?`);
    || 'Ask for pricing';
    // Show service selection buttons
    setTimeout(() => {.price && service.price.startsWith('$')) {
      displayServiceSelection(messageCallback);// Extract numeric price and calculate with premium
    }, 400); const basePrice = parseFloat(service.price.replace('$', ''));
  }    if (!isNaN(basePrice)) {
  nPrice = basePrice * (1 + (config.walkInPremium / 100));
  /**      const formattedWalkInPrice = '$' + walkInPrice.toFixed(2);
   * Display service selection options ${formattedWalkInPrice} (walk-in)`;
   */
  function displayServiceSelection(messageCallback) {   }
    // Create HTML for service selection buttons    
    let html = ` html += `
      <div class="service-selection-container" style="display: flex; flex-direction: column; gap: 8px; margin: 10px 0;">
        <div style="margin-bottom: 5px;">Please select a service:</div>     onclick="WalkInManager.selectService('${service.id}')"
    `;
          style="background-color: var(--primary-color, #9333ea); color: white; border: none; border-radius: 4px; padding: 12px; margin: 2px; cursor: pointer; font-size: 14px; text-align: left;"
          data-service="${service.id}">// Add general service
          <div style="font-weight: bold;">${service.name}</div>
          <div style="font-size: 12px; margin-top: 3px;">
            Duration: ${service.duration} minick="WalkInManager.selectService('general')"
            <span style="float: right; font-weight: bold;">${priceDisplay}</span>
          </div>round-color: var(--primary-color, #9333ea); color: white; border: none; border-radius: 4px; padding: 8px 12px; margin: 2px; cursor: pointer; font-size: 14px;"
        </button>
      `;l Service (${config.defaultServiceDuration} min)
    });
    
    html += `</div>`;
    // Add configured services
    // Add the service selection to the chat> {
    messageCallback(html, true);
  }
  .selectService('${service.id}')"
  /** class="service-button" 
   * Handle service selectionyle="background-color: var(--primary-color, #9333ea); color: white; border: none; border-radius: 4px; padding: 8px 12px; margin: 2px; cursor: pointer; font-size: 14px;"
   */
  function selectService(serviceId) {     ${service.name} (${service.duration} min)
    console.log('Service selected:', serviceId);     </button>
        `;
    if (serviceId === 'general') {);
      selectedService = 'General Service';
    } else {tml += `</div>`;
      const service = config.services.find(s => s.id === serviceId);
      if (service) {
        selectedService = service.name;
      } else {
        selectedService = 'General Service';
      }
    }
    
    // Find NailAide and send a system message) {
    if (window.NailAide && typeof window.NailAide.handleSystemAction === 'function') { selected:', serviceId);
      window.NailAide.handleSystemAction('serviceSelected', { 
        service: selectedServiceeId === 'general') {
      });edService = 'General Service';
    } else { } else {
      console.error('Cannot find NailAide to handle service selection');    const service = config.services.find(s => s.id === serviceId);
    } if (service) {
  }.name;
   } else {
  /**
   * Handle service selection action
   */
  function handleServiceSelection(serviceDetails, messageCallback) {
    // Show confirmation of service selection and ask for confirmationAide and send a system message
    messageCallback(`You selected ${serviceDetails.service} at ${selectedSlot.displayTime}.`);.handleSystemAction === 'function') {
    
    setTimeout(() => {Service
      const premiumAmount = config.walkInPremium;
      messageCallback(`Please note that walk-ins have a ${premiumAmount}% premium compared to regular appointments.`);
      dle service selection');
      // Show confirmation buttons
      setTimeout(() => {
        displayConfirmationButtons(messageCallback);
      }, 500);
    }, 400);andle service selection action
  }/
  s, messageCallback) {
  /**ice selection and ask for confirmation
   * Display confirmation buttons messageCallback(`You selected ${serviceDetails.service} at ${selectedSlot.displayTime}.`);
   */  
  function displayConfirmationButtons(messageCallback) {etTimeout(() => {
    // Create HTML for confirmation buttonsconfig.walkInPremium;
    const html = ` messageCallback(`Please note that walk-ins have a ${premiumAmount}% premium compared to regular appointments.`);
      <div style="display: flex; gap: 10px; margin-top: 10px;">
        <button 
          onclick="WalkInManager.confirmWalkIn()"  setTimeout(() => {
          style="background-color: var(--primary-color, #9333ea); color: white; border: none; border-radius: 4px; padding: 8px 12px; cursor: pointer; flex: 1;">ionButtons(messageCallback);
          Confirm Walk-in
        </button>
        <button 
          onclick="WalkInManager.cancelWalkIn()"
          style="background-color: #f44336; color: white; border: none; border-radius: 4px; padding: 8px 12px; cursor: pointer; flex: 1;">
          Cancel Display confirmation buttons
        </button>
      </div>
    `;
    ml = `
    // Add the confirmation buttons to the chat
    messageCallback(html, true);   <button 
  }       onclick="WalkInManager.confirmWalkIn()"
          style="background-color: var(--primary-color, #9333ea); color: white; border: none; border-radius: 4px; padding: 8px 12px; cursor: pointer; flex: 1;">
  /**     Confirm Walk-in
   * Confirm walk-in request
   */   <button 
  async function confirmWalkIn() {nager.cancelWalkIn()"
    console.log('Walk-in confirmed');44336; color: white; border: none; border-radius: 4px; padding: 8px 12px; cursor: pointer; flex: 1;">
          Cancel
    if (!selectedSlot) {
      console.error('No time slot selected');  </div>
      return;
    }
    
    currentState = 'confirming';allback(html, true);
    
    // Find NailAide and send a system message
    if (window.NailAide && typeof window.NailAide.handleSystemAction === 'function') {**
      window.NailAide.handleSystemAction('walkInConfirmed', {}); * Confirm walk-in request
    } else {
      console.error('Cannot find NailAide to handle walk-in confirmation'); {
    }onsole.log('Walk-in confirmed');
  }
  
  /**  console.error('No time slot selected');
   * Cancel walk-in requesturn;
   */
  function cancelWalkIn() {
    console.log('Walk-in cancelled');rentState = 'confirming';
    
    currentState = 'idle';
    === 'function') {
    // Find NailAide and send a system messagehandleSystemAction('walkInConfirmed', {});
    if (window.NailAide && typeof window.NailAide.handleSystemAction === 'function') {
      window.NailAide.handleSystemAction('walkInCancelled', {});mation');
    } else {
      console.error('Cannot find NailAide to handle walk-in cancellation');
    }
  }
  
  /**
   * Handle walk-in confirmation
   */e.log('Walk-in cancelled');
  async function handleWalkInConfirmation(messageCallback) {
    messageCallback("Processing your walk-in request...");
    
    try {message
      if (!window.BooksyService) {Aide.handleSystemAction === 'function') {
        throw new Error('Booksy service not available');ed', {});
      }
      e.error('Cannot find NailAide to handle walk-in cancellation');
      // Request the walk-in through Booksy service
      const walkInRequest = await window.BooksyService.requestWalkIn(
        selectedSlot, 
        selectedService,
        {} // Would include customer info in a real implementation
      );
      nConfirmation(messageCallback) {
      console.log('Walk-in request result:', walkInRequest);
      
      if (walkInRequest.success) {
        if (walkInRequest.accepted) {
          currentState = 'confirmed';service not available');
          
          // Send notification to staff
          if (window.NotificationService) {ervice
            const notification = await window.NotificationService.notifyStaff({window.BooksyService.requestWalkIn(
              service: selectedService,
              time: selectedSlot.displayTime,
              details: walkInRequest.appointmentDetailsclude customer info in a real implementation
            });
            
            console.log('Staff notification result:', notification);g('Walk-in request result:', walkInRequest);
          }
          walkInRequest.success) {
          // Show confirmation message {
          messageCallback("Your walk-in request has been confirmed!");
          
          setTimeout(() => {
            messageCallback(`Please arrive at ${selectedSlot.displayTime} for your ${selectedService}.`);ationService) {
            
            // Show reference number if available  service: selectedService,
            if (walkInRequest.appointmentDetails && walkInRequest.appointmentDetails.referenceNumber) {isplayTime,
              setTimeout(() => {equest.appointmentDetails
                messageCallback(`Reference number: ${walkInRequest.appointmentDetails.referenceNumber}`);
                
                // Reset for new interactions
                setTimeout(() => {
                  currentState = 'idle';
                }, 1000);how confirmation message
              }, 500);uest has been confirmed!");
            }
          }, 700);
        } else {lback(`Please arrive at ${selectedSlot.displayTime} for your ${selectedService}.`);
          currentState = 'rejected';
          w reference number if available
          // Show rejection message   if (walkInRequest.appointmentDetails && walkInRequest.appointmentDetails.referenceNumber) {
          messageCallback(walkInRequest.message || "We're sorry, but our staff cannot accommodate your walk-in request at this time.");setTimeout(() => {
          tDetails.referenceNumber}`);
          // Suggest booking a regular appointment         
          setTimeout(() => {           // Reset for new interactions
            messageCallback("Would you like to book a regular appointment instead?");Timeout(() => {
            
            // Show booking button
            setTimeout(() => {        }, 500);
              const bookingUrl = window.NAILAIDE_CONFIG?.booking?.bookingUrl || 'https://booksy.com';
              messageCallback(
                `<a href="${bookingUrl}" target="_blank" class="booking-button" style="display: inline-block; background-color: var(--primary-color, #9333ea); color: white; padding: 10px 20px; border-radius: 4px; text-decoration: none; margin-top: 10px;">Book Regular Appointment</a>`,   } else {
                true       currentState = 'rejected';
              );        
                   // Show rejection message
              // Reset for new interactionsRequest.message || "We're sorry, but our staff cannot accommodate your walk-in request at this time.");
              setTimeout(() => {     
                currentState = 'idle';
              }, 500);
            }, 500);        messageCallback("Would you like to book a regular appointment instead?");
          }, 700);
        }oking button
      } else {
        throw new Error(walkInRequest.error || 'Failed to request walk-in.');        const bookingUrl = window.NAILAIDE_CONFIG?.booking?.bookingUrl || 'https://booksy.com';
      }k(
    }="${bookingUrl}" target="_blank" class="booking-button" style="display: inline-block; background-color: var(--primary-color, #9333ea); color: white; padding: 10px 20px; border-radius: 4px; text-decoration: none; margin-top: 10px;">Book Regular Appointment</a>`,
    catch (error) {
      console.error('Error processing walk-in request:', error);
      currentState = 'idle';
      // Reset for new interactions
      messageCallback("I'm sorry, but I encountered an error processing your walk-in request. Please call us directly at " +     setTimeout(() => {
        (window.NAILAIDE_CONFIG?.businessInfo?.phone || "our salon") + " to schedule a walk-in.");  currentState = 'idle';
    }  }, 500);
  }         }, 500);
          }, 700);
  /**
   * Handle walk-in cancellationse {
   */ew Error(walkInRequest.error || 'Failed to request walk-in.');
  function handleWalkInCancellation(messageCallback) {
    messageCallback("Your walk-in request has been cancelled.");
    
    // Suggest booking a regular appointmentsing walk-in request:', error);
    setTimeout(() => {
      messageCallback("Would you like to book a regular appointment instead?");
       an error processing your walk-in request. Please call us directly at " + 
      // Show booking button "our salon") + " to schedule a walk-in.");
      setTimeout(() => {
        const bookingUrl = window.NAILAIDE_CONFIG?.booking?.bookingUrl || 'https://booksy.com';
        messageCallback(
          `<a href="${bookingUrl}" target="_blank" class="booking-button" style="display: inline-block; background-color: var(--primary-color, #9333ea); color: white; padding: 10px 20px; border-radius: 4px; text-decoration: none; margin-top: 10px;">Book Regular Appointment</a>`,
          truelk-in cancellation
        );
      }, 500);Cancellation(messageCallback) {
    }, 700);Your walk-in request has been cancelled.");
  }
   booking a regular appointment
  // Return public APIimeout(() => {
  return { messageCallback("Would you like to book a regular appointment instead?");
    init: init,  
    handleWalkInQuery: handleWalkInQuery, // Show booking button
    selectTimeSlot: selectTimeSlot,      setTimeout(() => {
    selectService: selectService,E_CONFIG?.booking?.bookingUrl || 'https://booksy.com';
    confirmWalkIn: confirmWalkIn,
    cancelWalkIn: cancelWalkIn,${bookingUrl}" target="_blank" class="booking-button" style="display: inline-block; background-color: var(--primary-color, #9333ea); color: white; padding: 10px 20px; border-radius: 4px; text-decoration: none; margin-top: 10px;">Book Regular Appointment</a>`,
    handleTimeSelection: handleTimeSelection,
    handleServiceSelection: handleServiceSelection,
    handleWalkInConfirmation: handleWalkInConfirmation, }, 500);
    handleWalkInCancellation: handleWalkInCancellation,);
    
    // For debugging and development  
    getState: function() {
      return {





















window.WalkInManager = WalkInManager;// Make available globally});  }, 800);    }      WalkInManager.init();    if (window.NAILAIDE_CONFIG) {  setTimeout(() => {document.addEventListener('DOMContentLoaded', function() {// Auto-initialize if config is available})();  };    }      };        config        selectedService,        selectedSlot,        availableSlots,        currentState,    init: init,
    handleWalkInQuery: handleWalkInQuery,
    selectTimeSlot: selectTimeSlot,
    selectService: selectService,
    confirmWalkIn: confirmWalkIn,
    cancelWalkIn: cancelWalkIn,
    handleTimeSelection: handleTimeSelection,
    handleServiceSelection: handleServiceSelection,
    handleWalkInConfirmation: handleWalkInConfirmation,
    handleWalkInCancellation: handleWalkInCancellation,
    
    // For debugging and development
    getState: function() {
      return {
        currentState,
        availableSlots,
        selectedSlot,
        selectedService,
        config
      };
    }
  };
})();

// Auto-initialize if config is available
document.addEventListener('DOMContentLoaded', function() {
  setTimeout(() => {
    if (window.NAILAIDE_CONFIG) {
      WalkInManager.init();
    }
  }, 800);
});

// Make available globally
window.WalkInManager = WalkInManager;