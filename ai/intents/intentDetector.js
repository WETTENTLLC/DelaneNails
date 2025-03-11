/**
 * Intent detection module
 */
const fs = require('fs').promises;
const path = require('path');
const natural = require('natural');

// Initialize classifier
const classifier = new natural.BayesClassifier();

// Flag to track if classifier is trained
let isClassifierTrained = false;

/**
 * Load intent data and train classifier
 */
async function loadAndTrainClassifier() {
  try {
    // Load the intents
    const intentsPath = path.join(__dirname, 'data');
    const files = await fs.readdir(intentsPath);
    
    for (const file of files) {
      if (file.endsWith('.json')) {
        const content = await fs.readFile(path.join(intentsPath, file), 'utf8');
        const intentData = JSON.parse(content);
        
        // Add training data to classifier
        intentData.examples.forEach(example => {
          classifier.addDocument(example, intentData.name);
        });
      }
    }
    
    // Train the classifier
    classifier.train();
    isClassifierTrained = true;
    console.log('Intent classifier trained successfully');
    
  } catch (error) {
    console.error('Error training intent classifier:', error);
    
    // Add minimal training data for basic intents
    classifier.addDocument('hi', 'greeting');
    classifier.addDocument('hello', 'greeting');
    classifier.addDocument('hey', 'greeting');
    
    classifier.addDocument('book appointment', 'book_appointment');
    classifier.addDocument('schedule appointment', 'book_appointment');
    classifier.addDocument('make appointment', 'book_appointment');
    
    classifier.addDocument('services', 'service_inquiry');
    classifier.addDocument('what services', 'service_inquiry');
    classifier.addDocument('nail services', 'service_inquiry');
    
    classifier.addDocument('prices', 'price_inquiry');
    classifier.addDocument('how much', 'price_inquiry');
    classifier.addDocument('cost', 'price_inquiry');
    
    classifier.addDocument('hours', 'hours_inquiry');
    classifier.addDocument('open', 'hours_inquiry');
    classifier.addDocument('when open', 'hours_inquiry');
    
    classifier.addDocument('location', 'location_inquiry');
    classifier.addDocument('where', 'location_inquiry');
    classifier.addDocument('address', 'location_inquiry');
    
    classifier.addDocument('cancel', 'cancel_appointment');
    classifier.addDocument('reschedule', 'cancel_appointment');
    
    classifier.addDocument('thank you', 'thanks');
    classifier.addDocument('thanks', 'thanks');
    
    classifier.addDocument('bye', 'goodbye');
    classifier.addDocument('goodbye', 'goodbye');
    
    classifier.train();
    isClassifierTrained = true;
    console.log('Intent classifier trained with default data');
  }
}

/**
 * Detect intent from user input
 * @param {object} processedInput - Processed input from NLU
 * @param {object} context - User context
 * @returns {object} Detected intent with confidence
 */
async function detectIntent(processedInput, context = {}) {
  // Make sure classifier is trained
  if (!isClassifierTrained) {
    await loadAndTrainClassifier();
  }
  
  // Use normalized text for classification
  const text = processedInput.normalized || processedInput.original;
  
  if (!text) {
    return { name: 'fallback', confidence: 0 };
  }
  
  try {
    // Get classification result
    const classifications = classifier.getClassifications(text);
    const topIntent = classifications[0];
    
    // If confidence is too low, return fallback
    if (topIntent && topIntent.value > 0.6) {
      return {
        name: topIntent.label,
        confidence: topIntent.value
      };
    } else {
      return {
        name: 'fallback',
        confidence: topIntent ? topIntent.value : 0
      };
    }
  } catch (error) {
    console.error('Error detecting intent:', error);
    return { name: 'fallback', confidence: 0 };
  }
}

// Initialize the classifier
loadAndTrainClassifier();

module.exports = {
  detectIntent
};
