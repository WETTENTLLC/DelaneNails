/**
 * DelaneNails AI Agent Integration
 * This file connects the test framework with your actual AI agent
 */

const axios = require('axios');
const { getSupabaseManager } = require('./supabase-integration');
require('dotenv').config();

class RealAIAgent {
  constructor(websiteContent) {
    this.websiteContent = websiteContent;
    
    // Configuration for OpenRouter
    this.openRouterApiKey = process.env.OPENROUTER_API_KEY;
    this.openRouterUrl = process.env.OPENROUTER_URL || 'https://openrouter.ai/api/v1/chat/completions';
    this.preferredModel = process.env.PREFERRED_MODEL || 'openai/gpt-3.5-turbo';
    
    // Check if we have an API key
    this.isConfigured = !!this.openRouterApiKey && this.openRouterApiKey !== 'your-openrouter-key-here';
    
    // Debug info
    if (this.isConfigured) {
      console.log("Real AI agent initialized with OpenRouter");
      console.log(`Using model: ${this.preferredModel}`);
    } else {
      console.warn("⚠️ OpenRouter API key not found or is using the default placeholder!");
      console.warn("To use the real AI, update your .env file with your OpenRouter API key.");
      console.warn("Using mock responses for now. The tests will still run, but responses will be pre-defined.");
    }
    
    // Get Supabase manager for logging
    try {
      this.supabaseManager = getSupabaseManager();
    } catch (error) {
      console.warn("⚠️ Supabase connection couldn't be established:", error.message);
      this.supabaseManager = null;
    }
  }
  
  async getResponse(question) {
    try {
      console.log("Getting AI response for:", question);
      
      let response;
      
      if (this.isConfigured) {
        // Get real response from OpenRouter
        response = await this.getOpenRouterResponse(question);
        console.log("✅ Received real response from OpenRouter");
      } else {
        // Use mock response if not configured
        response = this.getMockResponse(question);
        console.log("⚠️ Using mock response (OpenRouter not configured)");
      }
      
      // Log the interaction if Supabase is available
      const context = this.getRelevantContext(question);
      if (this.supabaseManager && this.supabaseManager.isConnected) {
        try {
          await this.supabaseManager.logAIInteraction(question, response, context);
        } catch (error) {
          console.warn("Failed to log interaction to Supabase:", error.message);
        }
      }
      
      return response;
    } catch (error) {
      console.error("❌ Error getting AI response:", error.message);
      
      if (this.supabaseManager && this.supabaseManager.isConnected) {
        try {
          await this.supabaseManager.logAIError(question, error);
        } catch (logError) {
          console.warn("Failed to log error to Supabase:", logError.message);
        }
      }
      
      return `Sorry, I encountered an error while processing your question. (${error.message})`;
    }
  }
  
  async getOpenRouterResponse(question) {
    try {
      // Get relevant context for the question
      const context = this.getRelevantContext(question);
      
      // Prepare system message with website content
      const systemMessage = `You are a helpful assistant for DelaneNails salon. 
      You provide accurate, friendly information about our nail salon services, products, and policies.
      Here is the relevant information from our website:
      ${JSON.stringify(context, null, 2)}
      
      Always be helpful, accurate, and courteous. Respond as if you are representing DelaneNails salon.`;
      
      console.log("Calling OpenRouter API...");
      
      // Call OpenRouter API
      const response = await axios.post(
        this.openRouterUrl,
        {
          model: this.preferredModel,
          messages: [
            { role: 'system', content: systemMessage },
            { role: 'user', content: question }
          ],
          temperature: 0.7,
          max_tokens: 500
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.openRouterApiKey}`,
            'HTTP-Referer': 'https://delanenails.com', // Replace with your actual domain
            'X-Title': 'DelaneNails AI Assistant'
          }
        }
      );
      
      return response.data.choices[0].message.content;
    } catch (error) {
      console.error("OpenRouter API call failed:", error.message);
      if (error.response) {
        console.error("Response status:", error.response.status);
        console.error("Response data:", error.response.data);
      }
      throw new Error(`OpenRouter API error: ${error.message}`);
    }
  }
  
  getMockResponse(question) {
    // Fallback mock response for testing when no API is configured
    const lowerQuestion = question.toLowerCase();
    
    if (lowerQuestion.includes('service') || lowerQuestion.includes('manicure') || lowerQuestion.includes('pedicure')) {
      return "We offer a variety of nail services including basic manicures starting at $25, gel manicures at $35, luxury treatments, pedicures, and custom nail art. Our nail technicians are certified professionals who ensure quality service.";
    } else if (lowerQuestion.includes('product') || lowerQuestion.includes('polish')) {
      return "DelaneNails carries premium polish brands including OPI, Essie, CND, DND, Morgan Taylor, and China Glaze. We also offer home care kits and strengthening products for nail maintenance between salon visits.";
    } else if (lowerQuestion.includes('book') || lowerQuestion.includes('appointment') || lowerQuestion.includes('hour')) {
      return "You can book an appointment online, by phone, or walk in (subject to availability). Our hours are 10AM-7PM Monday to Wednesday, 10AM-8PM Thursday, 9AM-8PM Friday, 9AM-6PM Saturday, and 11AM-5PM Sunday.";
    } else if (lowerQuestion.includes('about') || lowerQuestion.includes('owner') || lowerQuestion.includes('history')) {
      return "DelaneNails was founded in 2015 by Delane Johnson, a certified nail artist with over 15 years of experience. We're located in Cityville and have a team of 12 certified technicians dedicated to providing exceptional nail services.";
    } else if (lowerQuestion.includes('promotion') || lowerQuestion.includes('event') || lowerQuestion.includes('special')) {
      return "We currently have a Summer Special with 20% off all pedicure services through August. We also have a Refer-a-Friend program where you receive $15 off your next service when you refer a new client.";
    } else {
      return "Thank you for your question about DelaneNails. We're a nail salon founded in 2015, dedicated to providing high-quality nail services in a clean, welcoming environment. How else can I assist you today?";
    }
  }
  
  // Helper method to extract relevant context from website content
  getRelevantContext(question) {
    const lowerQuestion = question.toLowerCase();
    
    // Determine which section of content is most relevant to the question
    if (lowerQuestion.includes('service') || lowerQuestion.includes('manicure') || lowerQuestion.includes('pedicure')) {
      return { services: this.websiteContent.services };
    } else if (lowerQuestion.includes('product') || lowerQuestion.includes('polish') || lowerQuestion.includes('brand')) {
      return { products: this.websiteContent.products };
    } else if (lowerQuestion.includes('book') || lowerQuestion.includes('appointment') || lowerQuestion.includes('hours')) {
      return { booking: this.websiteContent.booking };
    } else if (lowerQuestion.includes('about') || lowerQuestion.includes('history') || lowerQuestion.includes('owner')) {
      return { about: this.websiteContent.about };
    } else if (lowerQuestion.includes('special') || lowerQuestion.includes('promotion') || lowerQuestion.includes('event')) {
      return { news: this.websiteContent.news };
    } else {
      // If unclear, return summary of all content
      return {
        summary: {
          services: Object.keys(this.websiteContent.services),
          products: this.websiteContent.products.polishBrands,
          booking: this.websiteContent.booking.methods,
          about: {
            founded: "2015",
            location: this.websiteContent.about.location,
            staff: this.websiteContent.about.staff.count
          },
          promotions: this.websiteContent.news.promotions.map(p => p.name)
        }
      };
    }
  }
}

async function createAIAgent(websiteContent) {
  try {
    // Create the real AI agent
    return new RealAIAgent(websiteContent);
  } catch (error) {
    console.error("Error creating AI agent:", error);
    throw error;
  }
}

module.exports = { createAIAgent };
