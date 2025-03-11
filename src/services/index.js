// NailAide Services Index

// Import all services
const AppointmentService = require('./appointmentService');
const ClientService = require('./clientService');
const InventoryService = require('./inventoryService');
const AnalyticsService = require('./analyticsService');
const NotificationService = require('./notificationService');
const VoiceControlService = require('./voiceControlService');
const AccessibilityService = require('./accessibilityService');

// Export service instances
module.exports = {
  appointments: new AppointmentService(),
  clients: new ClientService(),
  inventory: new InventoryService(),
  analytics: new AnalyticsService(),
  notifications: new NotificationService(),
  voiceControl: new VoiceControlService(),
  accessibility: new AccessibilityService(),
};
