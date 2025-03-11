const { Configuration, OpenAIApi } = require('openai');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Initialize OpenAI configuration
const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

/**
 * Generate a response using OpenAI's API
 * 
 * @param {string} prompt - User's message or query
 * @param {Object} options - Additional options for the AI request
 * @returns {Promise<string>} AI generated response
 */
async function generateResponse(prompt, options = {}) {
  try {
    if (!prompt) {
      throw new Error('Prompt is required');
    }

    // Default options
    const defaultOptions = {
      model: process.env.AI_MODEL || 'gpt-3.5-turbo',
      temperature: 0.7,
      max_tokens: 150
    };

    // Merge options
    const requestOptions = { ...defaultOptions, ...options };
    
    const response = await openai.createChatCompletion({
      model: requestOptions.model,
      messages: [
        {
          role: "system",
          content: "You are a nail salon assistant that helps customers with nail style recommendations and appointment information."
        },
        { role: "user", content: prompt }
      ],
      temperature: requestOptions.temperature,
      max_tokens: requestOptions.max_tokens
    });

    return response.data.choices[0].message.content.trim();
  } catch (error) {
    console.error('Error generating AI response:', error);
    throw error;
  }
}

/**
 * Generate nail style recommendations based on user preferences
 * 
 * @param {Object} preferences - User preferences for nail styles
 * @returns {Promise<Array>} List of recommended nail styles
 */
async function recommendNailStyles(preferences) {
  try {
    const prompt = formatRecommendationPrompt(preferences);
    const response = await generateResponse(prompt, { 
      temperature: 0.8,
      max_tokens: 300
    });
    
    return processRecommendations(response);
  } catch (error) {
    console.error('Error recommending nail styles:', error);
    throw error;
  }
}

/**
 * Format the recommendation prompt template based on user preferences
 * 
 * @param {Object} preferences - User preferences like color, occasion, etc.
 * @returns {string} Formatted prompt for the AI
 */
function formatRecommendationPrompt(preferences) {
  const { color, occasion, length, shape, season } = preferences;
  
  let prompt = 'Recommend 5 nail styles';
  
  if (color) {
    prompt += ` featuring ${color} color`;
  }
  
  if (occasion) {
    prompt += ` suitable for ${occasion}`;
  }
  
  if (length) {
    prompt += ` with ${length} length`;
  }
  
  if (shape) {
    prompt += ` in ${shape} shape`;
  }
  
  if (season) {
    prompt += ` appropriate for ${season}`;
  }
  
  prompt += '. For each style, provide a name and brief description.';
  
  return prompt;
}

/**
 * Process the AI response into structured recommendations
 * 
 * @param {string} response - Raw AI response
 * @returns {Array} Structured recommendations
 */
function processRecommendations(response) {
  // Split the response by numbers or line breaks
  const recommendations = response
    .split(/\d+\.\s|\n+/)
    .filter(item => item.trim().length > 0)
    .map(item => {
      // Try to extract style name and description
      const match = item.match(/^(.*?):\s*(.*)/);
      if (match) {
        return {
          name: match[1].trim(),
          description: match[2].trim()
        };
      }
      return { description: item.trim() };
    });

  return recommendations;
}

/**
 * Answer questions about nail services and appointments
 * 
 * @param {string} question - User's question
 * @returns {Promise<string>} AI generated answer
 */
async function answerQuestion(question) {
  const prompt = `Question about nail salon services: ${question}`;
  
  return generateResponse(prompt, {
    temperature: 0.5,
    max_tokens: 200
  });
}

module.exports = {
  generateResponse,
  recommendNailStyles,
  answerQuestion
};
