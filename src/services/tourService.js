/**
 * Tour Service
 * Implements the guided tour functionality for new users
 */
const logger = require('../utils/logger');

class TourService {
  constructor() {
    this.tours = {};
    this.activeTour = null;
    this.currentStep = 0;
    this.tourCompleteCallback = null;
    
    // Register default tours
    this.registerDefaultTours();
  }
  
  /**
   * Register the default application tours
   */
  registerDefaultTours() {
    this.registerTour('welcome', [
      {
        element: '#dashboard-overview',
        title: 'Welcome to NailAide',
        content: 'This is your dashboard where you can see a quick overview of your business.',
        position: 'bottom'
      },
      {
        element: '#upcoming-appointments',
        title: 'Upcoming Appointments',
        content: 'Here you can see your upcoming appointments for today and the rest of the week.',
        position: 'right'
      },
      {
        element: '#quick-actions',
        title: 'Quick Actions',
        content: 'Perform common tasks like booking appointments, adding clients, and checking inventory.',
        position: 'left'
      },
      {
        element: '#analytics-summary',
        title: 'Business Analytics',
        content: 'Get insights into your business performance, revenue trends, and client statistics.',
        position: 'top'
      },
      {
        element: '#main-navigation',
        title: 'Navigation',
        content: 'Access all features of NailAide using the main navigation menu.',
        position: 'right'
      }
    ]);
    
    this.registerTour('appointment-booking', [
      {
        element: '#booking-calendar',
        title: 'Booking Calendar',
        content: 'Select available dates to book appointments for your clients.',
        position: 'bottom'
      },
      {
        element: '#time-slots',
        title: 'Available Time Slots',
        content: 'Choose from available time slots shown in green. Gray slots are already booked.',
        position: 'right'
      },
      {
        element: '#service-selection',
        title: 'Select Services',
        content: 'Choose the service(s) your client is booking. You can select multiple services.',
        position: 'top'
      },
      {
        element: '#client-search',
        title: 'Client Information',
        content: 'Search for existing clients or add a new client.',
        position: 'left'
      },
      {
        element: '#booking-confirmation',
        title: 'Booking Confirmation',
        content: 'Review and confirm the appointment details before finalizing.',
        position: 'top'
      }
    ]);
    
    this.registerTour('client-management', [
      {
        element: '#client-list',
        title: 'Client Directory',
        content: 'All your clients are listed here. You can search, filter, and sort as needed.',
        position: 'right'
      },
      {
        element: '#add-client-button',
        title: 'Add New Clients',
        content: 'Click here to add a new client to your database.',
        position: 'bottom'
      },
      {
        element: '.client-profile',
        title: 'Client Profile',
        content: 'Click on a client to view their detailed profile, history, and preferences.',
        position: 'right'
      },
      {
        element: '#client-analytics',
        title: 'Client Analytics',
        content: 'See visit frequency, average spending, and favorite services for each client.',
        position: 'top'
      }
    ]);
    
    this.registerTour('voice-control', [
      {
        element: '#voice-control-toggle',
        title: 'Voice Control',
        content: 'Enable voice control to manage NailAide hands-free while working on clients.',
        position: 'bottom'
      },
      {
        element: '#voice-commands-list',
        title: 'Available Commands',
        content: 'View a list of available voice commands you can use.',
        position: 'right'
      },
      {
        element: '#voice-indicator',
        title: 'Voice Feedback',
        content: 'This indicator shows when the system is listening and processing your voice commands.',
        position: 'top'
      },
      {
        element: '#voice-settings',
        title: 'Voice Settings',
        content: 'Customize voice recognition sensitivity and command preferences here.',
        position: 'left'
      }
    ]);
  }
  
  /**
   * Register a new tour
   */
  registerTour(tourId, steps) {
    if (!tourId || !Array.isArray(steps) || steps.length === 0) {
      logger.error('Invalid tour configuration', { tourId, steps });
      return false;
    }
    
    this.tours[tourId] = {
      id: tourId,
      steps: steps
    };
    
    logger.debug(`Tour registered: ${tourId} with ${steps.length} steps`);
    return true;
  }
  
  /**
   * Start a tour by ID
   */
  startTour(tourId, onComplete) {
    if (!this.tours[tourId]) {
      logger.error(`Tour not found: ${tourId}`);
      return false;
    }
    
    if (this.activeTour) {
      this.endTour();
    }
    
    this.activeTour = this.tours[tourId];
    this.currentStep = 0;
    this.tourCompleteCallback = onComplete;
    
    // Begin with the first step
    this.showCurrentStep();
    
    logger.info(`Started tour: ${tourId}`);
    return true;
  }
  
  /**
   * Show the current step of the active tour
   */
  showCurrentStep() {
    if (!this.activeTour || this.currentStep >= this.activeTour.steps.length) {
      return null;
    }
    
    const step = this.activeTour.steps[this.currentStep];
    
    // In a real implementation, this would trigger the UI to show the tour step
    // For this demo, we'll just return the step data
    return step;
  }
  
  /**
   * Move to the next step in the tour
   */
  nextStep() {
    if (!this.activeTour) {
      return false;
    }
    
    this.currentStep++;
    
    // Check if we've reached the end of the tour
    if (this.currentStep >= this.activeTour.steps.length) {
      this.completeTour();
      return true;
    }
    
    // Show the next step
    this.showCurrentStep();
    return true;
  }
  
  /**
   * Move to the previous step in the tour
   */
  previousStep() {
    if (!this.activeTour || this.currentStep <= 0) {
      return false;
    }
    
    this.currentStep--;
    this.showCurrentStep();
    return true;
  }
  
  /**
   * Complete the current tour
   */
  completeTour() {
    if (!this.activeTour) {
      return false;
    }
    
    const tourId = this.activeTour.id;
    
    // Record that this user has completed the tour
    this.recordTourCompletion(tourId);
    
    // Call the onComplete callback if provided
    if (typeof this.tourCompleteCallback === 'function') {
      this.tourCompleteCallback(tourId);
    }
    
    // Reset the tour state
    this.activeTour = null;
    this.currentStep = 0;
    this.tourCompleteCallback = null;
    
    logger.info(`Tour completed: ${tourId}`);
    return true;
  }
  
  /**
   * End the current tour without marking as complete
   */
  endTour() {
    if (!this.activeTour) {
      return false;
    }
    
    const tourId = this.activeTour.id;
    
    // Reset the tour state
    this.activeTour = null;
    this.currentStep = 0;
    this.tourCompleteCallback = null;
    
    logger.info(`Tour ended: ${tourId}`);
    return true;
  }
  
  /**
   * Record that a user has completed a tour
   */
  recordTourCompletion(tourId) {
    try {
      // Get existing completed tours
      const completedToursStr = localStorage.getItem('completed_tours') || '[]';
      const completedTours = JSON.parse(completedToursStr);
      
      // Add this tour if not already completed
      if (!completedTours.includes(tourId)) {
        completedTours.push(tourId);
        localStorage.setItem('completed_tours', JSON.stringify(completedTours));
      }
      
      logger.debug(`Recorded tour completion: ${tourId}`);
      return true;
    } catch (error) {
      logger.error(`Error recording tour completion: ${error.message}`);
      return false;
    }
  }
  
  /**
   * Check if a tour has been completed by the user
   */
  isTourCompleted(tourId) {
    try {
      const completedToursStr = localStorage.getItem('completed_tours') || '[]';
      const completedTours = JSON.parse(completedToursStr);
      return completedTours.includes(tourId);
    } catch (error) {
      logger.error(`Error checking tour completion: ${error.message}`);
      return false;
    }
  }
  
  /**
   * Get all available tours
   */
  getAvailableTours() {
    return Object.keys(this.tours).map(id => ({
      id,
      title: this.tours[id].steps[0]?.title || id,
      stepCount: this.tours[id].steps.length
    }));
  }
  
  /**
   * Reset all tour completion records
   */
  resetTourRecords() {
    try {
      localStorage.setItem('completed_tours', '[]');
      logger.info('Reset all tour completion records');
      return true;
    } catch (error) {
      logger.error(`Error resetting tour records: ${error.message}`);
      return false;
    }
  }
  
  /**
   * Get the current tour's progress
   */
  getTourProgress() {
    if (!this.activeTour) {
      return null;
    }
    
    return {
      tourId: this.activeTour.id,
      currentStep: this.currentStep + 1,
      totalSteps: this.activeTour.steps.length,
      percentComplete: Math.round((this.currentStep / (this.activeTour.steps.length - 1)) * 100)
    };
  }
}

// Export the tour service
module.exports = TourService;
