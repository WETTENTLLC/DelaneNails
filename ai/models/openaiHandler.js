/**
 * Handler for OpenAI API
 */
const { OpenAI } = require('openai');

// Initialize OpenAI client
let openai;
try {
  openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
  });
} catch (error) {
  console.warn('OpenAI client initialization failed:', error.message);
  console.warn('AI-generated responses will be simulated');
}

/**
 * Generate a text completion using OpenAI API
 * @param {string} prompt - Input prompt
 * @param {object} options - Generation options
 * @returns {Promise<string>} Generated completion
 */
async function generateCompletion(prompt, options = {}) {
  const defaultOptions = {
    model: 'gpt-3.5-turbo',
    maxTokens: 150,
    temperature: 0.7
  };
  
  const settings = { ...defaultOptions, ...options };
  
  try {
    if (!openai) {
      return simulateCompletion(prompt);
    }
    
    const response = await openai.chat.completions.create({
      model: settings.model,
      messages: [{ role: "user", content: prompt }],
      max_tokens: settings.maxTokens,
      temperature: settings.temperature
    });
    
    return response.choices[0].message.content.trim();
  } catch (error) {
    console.error('Error generating completion:', error);
    return simulateCompletion(prompt);
  }
}

/**
 * Simulate an AI completion when API is unavailable
 * @param {string} prompt - Input prompt
 * @returns {string} Simulated response
 */
function simulateCompletion(prompt) {
  const responses = [
    "I'd be happy to help you with your nail care needs. Would you like to book an appointment?",
    "Our salon offers a wide range of services including manicures, pedicures, and nail art. How can I assist you today?",
    "The best way to maintain healthy nails is regular care and moisturizing cuticles. Would you like to book a maintenance appointment?",
    "Our most popular service is the Deluxe Gel Manicure, which lasts up to 2 weeks. Would you like to know more about it?",
    "I recommend coming in for a nail health consultation to determine the best services for you."
  ];
  
  const randomIndex = Math.floor(Math.random() * responses.length);
  return responses[randomIndex];
}

module.exports = {
  generateCompletion
};
