/**
 * Simple, fixed version of NailAide
 * Save this file exactly as 'fixNailAide.js' in your project folder
 */

const fs = require('fs');
const path = require('path');
const { OpenAI } = require('openai');

// ==========================================================
// INITIALIZATION
// ==========================================================

console.log("Starting fixNailAide.js...");

// Check API key first
if (!process.env.OPENAI_API_KEY) {
  console.error("\n⚠️ OPENAI_API_KEY not found in environment variables!");
  console.error("Please set your API key before running this script.\n");
}

// Initialize OpenAI with explicit error handling
let openai;
try {
  openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });
  console.log("OpenAI client initialized successfully");
} catch (error) {
  console.error("Failed to initialize OpenAI client:", error.message);
}

// Basic information about the salon
const salon = {
  name: "DelaneNails",
  description: "Premium nail salon offering a variety of services",
  services: [
    "Manicures", 
    "Pedicures", 
    "Gel Polish", 
    "Acrylic Extensions",
    "Nail Art"
  ],
  hours: "Monday-Saturday: 9am-7pm, Sunday: 10am-5pm",
  location: "123 Beauty Lane, Style City"
};

// ==========================================================
// CORE FUNCTIONALITY
// ==========================================================

/**
 * Process user queries about the nail salon
 */
async function processQuery(query) {
  console.log(`Processing query: "${query}"`);
  
  // 1. Check for specific keywords for direct answers
  const lowerQuery = query.toLowerCase();
  
  // Products query
  if (lowerQuery.includes('product')) {
    console.log("Recognized as product query");
    return getProductsInfo();
  }
  
  // Services query
  if (lowerQuery.includes('service') || 
      lowerQuery.includes('offer') ||
      lowerQuery.includes('do you do')) {
    console.log("Recognized as services query");
    return getServicesInfo();
  }
  
  // Hours query
  if (lowerQuery.includes('hour') || 
      lowerQuery.includes('open') || 
      lowerQuery.includes('close') ||
      lowerQuery.includes('when')) {
    console.log("Recognized as hours query");
    return `${salon.name} is open: ${salon.hours}`;
  }
  
  // 2. Use OpenAI for other queries
  console.log("Using OpenAI for general query");
  return await getAIResponse(query);
}

/**
 * Get information about salon products
 */
function getProductsInfo() {
  console.log("Getting product information");
  try {
    // Look for products.json in the same directory
    const productsPath = path.join(__dirname, 'products.json');
    
    if (!fs.existsSync(productsPath)) {
      console.error("Products file not found at:", productsPath);
      return "I'm sorry, our product information is currently unavailable.";
    }
    
    const rawData = fs.readFileSync(productsPath, 'utf8');
    const products = JSON.parse(rawData).products;
    
    if (!products || products.length === 0) {
      return "We currently don't have any products listed.";
    }
    
    let response = "Here are the products we offer:\n\n";
    products.forEach(product => {
      response += `• ${product.name}: ${product.description} - ${product.price}\n`;
    });
    
    return response;
  } catch (error) {
    console.error("Error getting product info:", error);
    return "I apologize, but I'm having trouble accessing our product information right now.";
  }
}

/**
 * Get information about salon services
 */
function getServicesInfo() {
  let response = `At ${salon.name}, we offer the following services:\n\n`;
  
  salon.services.forEach(service => {
    response += `• ${service}\n`;
  });
  
  return response;
}

/**
 * Get AI-generated response using OpenAI
 */
async function getAIResponse(query) {
  if (!openai) {
    return "I'm sorry, but the AI service is currently unavailable.";
  }
  
  try {
    console.log("Sending request to OpenAI...");
    
    // Get current date/time for context
    const now = new Date();
    const dateTimeString = now.toLocaleString();
    
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        { 
          role: "system", 
          content: `You are a helpful assistant for ${salon.name}, a premium nail salon.
          Current date/time: ${dateTimeString}
          About the salon: ${salon.description}
          Services: ${salon.services.join(", ")}
          Hours: ${salon.hours}
          Location: ${salon.location}
          
          Keep responses friendly, helpful, and varied. Don't repeat the exact same phrases.
          Focus on providing helpful information about nail services and beauty.`
        },
        { role: "user", content: query }
      ],
      temperature: 0.7,
      max_tokens: 150,
    });
    
    console.log("Received response from OpenAI");
    return response.choices[0].message.content.trim();
  } catch (error) {
    console.error("Error with OpenAI request:", error);
    return "I'm sorry, I'm having trouble connecting to my knowledge base right now. Please try again later.";
  }
}

// ==========================================================
// TESTING FUNCTIONALITY
// ==========================================================

/**
 * Test the query processor with some sample queries
 */
async function runTests() {
  console.log("\n======== RUNNING TESTS ========\n");
  
  const testQueries = [
    "What products do you sell?",
    "What services do you offer?", 
    "What are your hours?",
    "Do you do nail art?",
    "Where are you located?"
  ];
  
  for (const query of testQueries) {
    console.log(`\nTEST QUERY: "${query}"`);
    const response = await processQuery(query);
    console.log(`RESPONSE: "${response}"`);
  }
  
  console.log("\n======== TESTS COMPLETE ========\n");
}

// Export functionality
module.exports = {
  processQuery,
  runTests
};

// Run tests if this file is executed directly
if (require.main === module) {
  runTests();
}
