/**
 * Speech Recognition Utility
 * Provides functionality for voice recognition and command processing
 */
const logger = require('./logger');

/**
 * Create a speech recognition instance
 */
function createRecognizer(options = {}) {
  return new Promise((resolve, reject) => {
    // Check if browser supports speech recognition
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
      logger.error('Speech recognition not supported by this browser');
      reject(new Error('Speech recognition not supported'));
      return;
    }
    
    try {
      const recognizer = new SpeechRecognition();
      
      // Configure the recognizer with provided options
      recognizer.continuous = options.continuous !== undefined ? options.continuous : true;
      recognizer.interimResults = options.interimResults !== undefined ? options.interimResults : true;
      recognizer.lang = options.language || 'en-US';
      
      // Set up error handler
      recognizer.onerror = (event) => {
        logger.error('Speech recognition error', event.error);
        
        // If error is not fatal, don't reject
        if (event.error !== 'not-allowed' && event.error !== 'service-not-allowed') {
          return;
        }
        
        reject(new Error(`Speech recognition error: ${event.error}`));
      };
      
      // Resolve with the configured recognizer
      resolve(recognizer);
    } catch (error) {
      logger.error('Error creating speech recognizer', error);
      reject(error);
    }
  });
}

/**
 * Process a command by matching against known patterns
 */
function processCommand(text, commandPatterns) {
  if (!text || typeof text !== 'string') {
    return null;
  }
  
  // Clean up and normalize input
  const cleanText = text.toLowerCase().trim();
  
  // Check for matches against command patterns
  for (const pattern of commandPatterns) {
    const { regex, handler, action } = pattern;
    
    if (typeof regex === 'string') {
      // Simple string match
      if (cleanText === regex.toLowerCase() || cleanText.includes(regex.toLowerCase())) {
        return { matched: true, action, handler, text: cleanText };
      }
    } else if (regex instanceof RegExp) {
      // Regular expression match
      const match = cleanText.match(regex);
      if (match) {
        // Extract any capture groups as parameters
        const params = match.slice(1);
        return { matched: true, action, handler, params, text: cleanText };
      }
    }
  }
  
  // No match found
  return { matched: false, text: cleanText };
}

module.exports = {
  createRecognizer,
  processCommand
};
