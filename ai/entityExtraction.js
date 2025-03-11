/**
 * Entity extraction module for NailAide
 */
const serviceData = require('../data/services.json');
const chrono = require('chrono-node');

/**
 * Find entities in user message based on intent
 * @param {object} processedInput - Processed input from NLU
 * @param {object} intent - Detected intent
 * @returns {object} Extracted entities
 */
function findEntity(processedInput, intent) {
  const entities = {};
  const text = processedInput.original.toLowerCase();
  
  // Extract common entities based on intent
  switch (intent.name) {
    case 'book_appointment':
    case 'check_availability':
      // Extract service type
      entities.service = extractService(text);
      
      // Extract date and time
      const dateTime = extractDateTime(text);
      if (dateTime.date) entities.date = dateTime.date;
      if (dateTime.time) entities.time = dateTime.time;
      break;
      
    case 'service_inquiry':
    case 'price_inquiry':
      // Extract service type
      entities.service = extractService(text);
      break;
      
    case 'cancel_appointment':
    case 'reschedule_appointment':
      // Extract date and time
      const appointmentDateTime = extractDateTime(text);
      if (appointmentDateTime.date) entities.date = appointmentDateTime.date;
      if (appointmentDateTime.time) entities.time = appointmentDateTime.time;
      break;
  }
  
  return entities;
}

/**
 * Extract service type from text
 * @param {string} text - Input text
 * @returns {string|null} Service name or null
 */
function extractService(text) {
  if (!text || !serviceData.services) return null;
  
  // Look for service names in the text
  for (const service of serviceData.services) {
    const serviceName = service.name.toLowerCase();
    if (text.includes(serviceName)) {
      return service.name;
    }
    
    // Check for variations and keywords
    for (const keyword of service.keywords || []) {
      if (text.includes(keyword.toLowerCase())) {
        return service.name;
      }
    }
  }
  
  return null;
}

/**
 * Extract date and time from text
 * @param {string} text - Input text
 * @returns {object} Extracted date and time
 */
function extractDateTime(text) {
  const result = { date: null, time: null };
  
  try {
    // Use chrono for date/time parsing
    const parsed = chrono.parse(text);
    
    if (parsed && parsed.length > 0) {
      const dateTime = parsed[0];
      
      if (dateTime.start) {
        const date = dateTime.start.date();
        
        // Format date
        result.date = date.toISOString().split('T')[0]; // YYYY-MM-DD
        
        // Check if time was mentioned
        if (dateTime.start.isCertain('hour')) {
          // Format time
          const hours = date.getHours().toString().padStart(2, '0');
          const minutes = date.getMinutes().toString().padStart(2, '0');
          result.time = `${hours}:${minutes}`;
        }
      }
    }
  } catch (error) {
    console.error('Error extracting date/time:', error);
  }
  
  return result;
}

module.exports = {
  findEntity,
  extractService,
  extractDateTime
};
