/**
 * AI configuration settings for the application
 */
module.exports = {
  // OpenAI configuration
  openai: {
    model: process.env.AI_MODEL || 'gpt-3.5-turbo',
    defaultParams: {
      temperature: 0.7,
      max_tokens: 200,
      frequency_penalty: 0.3,
      presence_penalty: 0.3
    }
  },
  
  // Recommendation system settings
  recommendations: {
    defaultCount: 5,
    temperature: 0.8,
    maxResults: 10
  },
  
  // System prompts
  systemPrompts: {
    general: "You are a nail salon assistant that helps customers with nail style recommendations and appointment information.",
    recommendations: "You are a nail style expert who provides detailed recommendations for nail designs.",
    qa: "You are a helpful assistant answering questions about Delane Nails salon services."
  }
};
