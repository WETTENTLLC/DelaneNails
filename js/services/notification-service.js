/**
 * Notification Service
 * Handles notifications to staff for walk-in requests
 */

const NotificationService = (function() {
  // Configuration
  let config = {
    serviceEnabled: true,
    staffPhone: '',  // Should be set in nailaide-config
    serviceUrl: 'https://api.example.com/notify', // Would be replaced with actual SMS service
    useSimulation: true // Set to false in production
  };
  
  // Pending notifications queue
  let pendingNotifications = [];
  
  function init(configOptions) {
    console.log('Initializing Notification service...');
    if (configOptions) {
      config = {...config, ...configOptions};
    }
    
    // Load from global config if exists
    if (window.NAILAIDE_CONFIG && window.NAILAIDE_CONFIG.notifications) {
      config = {...config, ...window.NAILAIDE_CONFIG.notifications};
    }
    
    // Process any pending notifications that might have queued before initialization
    processPendingNotifications();
    
    console.log('Notification service initialized');
  }
  
  /**
   * Send notification to staff about a walk-in request
   */
  async function notifyStaff(walkInDetails) {
    if (!config.serviceEnabled) {
      console.log('Notification service is disabled');
      return {success: false, message: 'Notification service disabled'};
    }
    
    console.log('Sending notification to staff:', walkInDetails);
    
    // If service isn't ready yet, queue the notification
    if (!config.staffPhone && !config.useSimulation) {
      console.log('Queuing notification - service not yet configured');
      pendingNotifications.push(walkInDetails);
      return {success: false, queued: true};
    }
    
    try {
      if (config.useSimulation) {
        // In simulation mode, just log and return success
        console.log('SIMULATION: Staff would receive SMS about walk-in request');
        
        // Simulate API call delay
        await new Promise(resolve => setTimeout(resolve, 800));
        
        return {
          success: true,
          message: 'Staff has been notified of your walk-in request.'
        };
      }
      
      // In a real implementation, this would connect to an SMS service API
      const response = await fetch(config.serviceUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          phone: config.staffPhone,
          message: `WALK-IN REQUEST: ${walkInDetails.service} at ${walkInDetails.time}. Open Salon App to approve/decline.`
        })
      });
      
      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.message || 'Failed to send notification');
      }
      
      return {
        success: true,
        message: 'Staff has been notified of your walk-in request.'
      };
    }
    catch (error) {
      console.error('Failed to send staff notification:', error);
      return {
        success: false,
        message: 'Could not notify staff. Please call the salon directly.'
      };
    }
  }
  
  /**
   * Process any notifications that were queued before the service was initialized
   */
  function processPendingNotifications() {
    if (pendingNotifications.length > 0) {
      console.log(`Processing ${pendingNotifications.length} pending notifications`);
      
      pendingNotifications.forEach(notification => {
        notifyStaff(notification).catch(err => {
          console.error('Failed to process queued notification:', err);
        });
      });
      
      pendingNotifications = [];
    }
  }
  
  // Return public API
  return {
    init: init,
    notifyStaff: notifyStaff
  };
})();

// Auto-initialize if config is available
document.addEventListener('DOMContentLoaded', function() {
  // Wait a moment for config to load
  setTimeout(() => {
    if (window.NAILAIDE_CONFIG) {
      NotificationService.init();
    }
  }, 700);
});

// Make available globally
window.NotificationService = NotificationService;
