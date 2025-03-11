/**
 * Voice Control Service
 * Enables hands-free operation of NailAide through voice commands
 */
const { createRecognizer, processCommand } = require('../utils/speechRecognition');
const logger = require('../utils/logger');

class VoiceControlService {
  constructor() {
    this.recognizer = null;
    this.isListening = false;
    this.commandHandlers = {};
    this.lastCommand = null;
  }

  /**
   * Initialize the voice control service
   */
  async initialize() {
    try {
      this.recognizer = await createRecognizer({
        language: 'en-US',
        continuous: true,
        interimResults: true
      });
      
      this.registerDefaultCommands();
      
      logger.info('Voice Control Service initialized successfully');
      return true;
    } catch (error) {
      logger.error('Failed to initialize Voice Control Service', error);
      return false;
    }
  }
  
  /**
   * Register default command handlers
   */
  registerDefaultCommands() {
    // Appointment commands
    this.registerCommand('show schedule', this.handleShowSchedule.bind(this));
    this.registerCommand('show appointments today', this.handleShowTodayAppointments.bind(this));
    this.registerCommand('next appointment', this.handleNextAppointment.bind(this));
    this.registerCommand('book appointment for', this.handleBookAppointment.bind(this));
    
    // Client commands
    this.registerCommand('show client profile', this.handleShowClientProfile.bind(this));
    this.registerCommand('add note', this.handleAddClientNote.bind(this));
    this.registerCommand('add client preference', this.handleAddClientPreference.bind(this));
    
    // Inventory commands
    this.registerCommand('check inventory', this.handleCheckInventory.bind(this));
    this.registerCommand('low stock items', this.handleLowStockItems.bind(this));
    
    // Navigation commands
    this.registerCommand('go to dashboard', this.handleNavigation.bind(this, 'dashboard'));
    this.registerCommand('go to appointments', this.handleNavigation.bind(this, 'appointments'));
    this.registerCommand('go to clients', this.handleNavigation.bind(this, 'clients'));
    this.registerCommand('go to inventory', this.handleNavigation.bind(this, 'inventory'));
  }
  
  /**
   * Register a command handler
   */
  registerCommand(commandPhrase, handlerFn) {
    this.commandHandlers[commandPhrase.toLowerCase()] = handlerFn;
    logger.debug(`Registered voice command: "${commandPhrase}"`);
  }
  
  /**
   * Start listening for voice commands
   */
  startListening(onResultCallback) {
    if (this.isListening) return;
    
    if (!this.recognizer) {
      logger.error('Voice recognizer not initialized');
      return false;
    }
    
    this.isListening = true;
    
    this.recognizer.onresult = (event) => {
      const result = event.results[event.results.length - 1];
      const transcript = result[0].transcript.trim().toLowerCase();
      const isFinal = result.isFinal;
      
      if (isFinal) {
        this.processCommand(transcript);
      }
      
      if (onResultCallback) {
        onResultCallback(transcript, isFinal);
      }
    };
    
    this.recognizer.start();
    logger.info('Voice Control Service started listening');
    
    return true;
  }
  
  /**
   * Stop listening for voice commands
   */
  stopListening() {
    if (!this.isListening || !this.recognizer) return;
    
    this.recognizer.stop();
    this.isListening = false;
    logger.info('Voice Control Service stopped listening');
    
    return true;
  }
  
  /**
   * Process received voice command
   */
  processCommand(transcript) {
    this.lastCommand = transcript;
    logger.debug(`Processing voice command: "${transcript}"`);
    
    // Check for exact matches first
    if (this.commandHandlers[transcript]) {
      this.commandHandlers[transcript](transcript);
      return;
    }
    
    // Check for partial matches (commands that start with the given phrases)
    for (const command in this.commandHandlers) {
      if (transcript.startsWith(command)) {
        const params = transcript.substring(command.length).trim();
        this.commandHandlers[command](transcript, params);
        return;
      }
    }
    
    // No matching command found
    logger.debug(`No handler found for command: "${transcript}"`);
    return false;
  }
  
  // Command handlers
  async handleShowSchedule(command) {
    logger.info('Voice command: Show schedule');
    // Implementation would dispatch action to show schedule
    return {
      action: 'NAVIGATE',
      destination: 'schedule',
      feedback: 'Showing your schedule'
    };
  }
  
  async handleShowTodayAppointments(command) {
    logger.info('Voice command: Show today\'s appointments');
    // Implementation would fetch and display today's appointments
    return {
      action: 'SHOW_TODAY_APPOINTMENTS',
      feedback: 'Here are your appointments for today'
    };
  }
  
  async handleNextAppointment(command) {
    logger.info('Voice command: Next appointment');
    // Implementation would fetch the next upcoming appointment
    return {
      action: 'SHOW_NEXT_APPOINTMENT',
      feedback: 'Your next appointment is with Jane at 2:30 PM'
    };
  }
  
  async handleBookAppointment(command, params) {
    logger.info(`Voice command: Book appointment for ${params}`);
    // Implementation would start the appointment booking flow
    return {
      action: 'START_BOOKING',
      params: params,
      feedback: `Starting booking process for ${params}`
    };
  }
  
  async handleShowClientProfile(command, params) {
    logger.info(`Voice command: Show client profile for ${params}`);
    // Implementation would show the specified client profile
    return {
      action: 'SHOW_CLIENT',
      clientName: params,
      feedback: `Showing profile for ${params}`
    };
  }
  
  async handleAddClientNote(command, params) {
    logger.info(`Voice command: Add note: ${params}`);
    // Implementation would add a note to the currently viewed client
    return {
      action: 'ADD_CLIENT_NOTE',
      note: params,
      feedback: 'Note added successfully'
    };
  }
  
  async handleAddClientPreference(command, params) {
    logger.info(`Voice command: Add client preference: ${params}`);
    // Implementation would add a preference to the currently viewed client
    return {
      action: 'ADD_CLIENT_PREFERENCE',
      preference: params,
      feedback: 'Client preference added'
    };
  }
  
  async handleCheckInventory(command, params) {
    logger.info('Voice command: Check inventory');
    // Implementation would show inventory status
    return {
      action: 'SHOW_INVENTORY',
      feedback: 'Showing inventory status'
    };
  }
  
  async handleLowStockItems(command) {
    logger.info('Voice command: Low stock items');
    // Implementation would show items with low stock levels
    return {
      action: 'SHOW_LOW_STOCK',
      feedback: 'Displaying low stock items'
    };
  }
  
  async handleNavigation(destination, command) {
    logger.info(`Voice command: Navigate to ${destination}`);
    // Implementation would navigate to the specified page
    return {
      action: 'NAVIGATE',
      destination: destination,
      feedback: `Navigating to ${destination}`
    };
  }
}

module.exports = VoiceControlService;
