/**
 * Enhanced AI Agent Testing Framework
 * Updated to use Supabase integration
 */

const websiteContent = require('./ai-data/website-content');
const { createAIAgent } = require('./ai-integration');
const ReportGenerator = require('./report-generator');

class EnhancedAITester {
  constructor() {
    // Load website content for evaluation - will be replaced with Supabase data if available
    this.websiteContent = websiteContent;
    
    // aiAgent will be initialized in initialize() to allow for async creation
    this.aiAgent = null;
    
    // Rest of initialization
    this.testCategories = {
      services: {
        questions: [
          "What nail services do you offer?",
          "How much does a basic manicure cost?",
          "Do you offer gel nail extensions?",
          "How long does a pedicure appointment typically take?",
          "Do I need to book an appointment for nail art?"
        ]
      },
      products: {
        questions: [
          "What nail polish brands do you carry?",
          "Do you sell any at-home nail care kits?",
          "Are your products cruelty-free?",
          "What's your most popular nail polish color?",
          "Do you have any nail strengthening products?"
        ]
      },
      booking: {
        questions: [
          "How can I book an appointment?",
          "What are your business hours?",
          "Do you accept walk-ins?",
          "What's your cancellation policy?",
          "Is there a deposit required for booking?"
        ]
      },
      about: {
        questions: [
          "How long has DelaneNails been in business?",
          "Where are you located?",
          "Who is the owner of DelaneNails?",
          "Are your nail technicians certified?",
          "What safety protocols do you follow?"
        ]
      },
      news: {
        questions: [
          "What are your latest promotions?",
          "Do you have any upcoming events?",
          "Have you added any new services recently?",
          "Are there any seasonal nail designs available now?",
          "Do you offer any loyalty discounts?"
        ]
      }
    };
    
    this.truthKeywords = {
      services: {
        keywords: [
          'manicure', 'pedicure', 'gel', 'acrylic', 'extensions', 'nail art', 
          '$25', '$35', '$45', '$55', '$60', '$65', '$70'
        ],
        required: ['manicure', 'pedicure']
      },
      products: {
        keywords: [
          'OPI', 'Essie', 'CND', 'DND', 'Morgan Taylor', 'China Glaze', 
          'care kit', 'strengthening', 'cruelty-free'
        ],
        required: ['polish']
      },
      booking: {
        keywords: [
          'online', 'phone', 'walk-in', '24-hour', 'cancel', 'deposit', 
          'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'
        ],
        required: ['appointment']
      },
      about: {
        keywords: [
          '2015', 'Delane Johnson', 'certified', 'Cityville', '12 technicians',
          'sterilization', 'licensed', 'health', 'hygiene'
        ],
        required: ['founded', 'technicians']
      },
      news: {
        keywords: [
          'Summer Special', '20%', 'pedicure', 'Refer-a-Friend', 
          'Nail Art Workshop', 'Japanese Gel Art'
        ],
        required: ['promotion', 'special']
      }
    };
    
    this.results = {};
  }
  
  async initialize() {
    // Create AI agent with website content - this will check Supabase first
    this.aiAgent = await createAIAgent(this.websiteContent);
    return this;
  }

  async runTests() {
    // Make sure the AI agent is initialized
    if (!this.aiAgent) {
      await this.initialize();
    }
    
    console.log("🔍 STARTING ENHANCED AI AGENT TESTING 🔍");
    console.log("=========================================");
    
    for (const [category, data] of Object.entries(this.testCategories)) {
      console.log(`\n📋 Testing ${category.toUpperCase()} knowledge:`);
      this.results[category] = {
        questions: 0,
        nonEmptyResponses: 0,
        relevantResponses: 0,
        accurateResponses: 0,
        helpfulResponses: 0,
        exampleQA: [] // Store example Q&A for the report
      };
      
      for (const question of data.questions) {
        console.log(`\nQ: ${question}`);
        
        // Get response from AI agent
        const response = await this.aiAgent.getResponse(question);
        console.log(`A: ${response}`);
        
        // Store this Q&A example
        this.results[category].exampleQA.push({ question, response });
        
        // Evaluate response
        this.results[category].questions++;
        
        if (this.isNonEmptyResponse(response)) {
          this.results[category].nonEmptyResponses++;
          
          // Check relevance
          if (this.isRelevantResponse(question, response, category)) {
            this.results[category].relevantResponses++;
            console.log("✓ Relevance: Response is on-topic");
          } else {
            console.log("✗ Relevance: Response appears off-topic");
          }
          
          // Check accuracy against website content
          if (this.isAccurateResponse(response, category)) {
            this.results[category].accurateResponses++;
            console.log("✓ Accuracy: Information aligns with website content");
          } else {
            console.log("✗ Accuracy: Information may not match website content");
          }
          
          // Check helpfulness
          if (this.isHelpfulResponse(question, response)) {
            this.results[category].helpfulResponses++;
            console.log("✓ Helpfulness: Response addresses user's needs");
          } else {
            console.log("✗ Helpfulness: Response could be more helpful");
          }
        } else {
          console.log("✗ Empty or insufficient response");
        }
      }
    }
    
    // Generate reports
    const reportGenerator = new ReportGenerator(this.results);
    const summary = reportGenerator.generateConsoleReport();
    
    try {
      const reportPath = reportGenerator.generateHTMLReport();
      console.log(`\n📈 Detailed HTML report saved to: ${reportPath}`);
    } catch (error) {
      console.error("Error generating HTML report:", error.message);
    }
    
    return summary;
  }
  
  isNonEmptyResponse(response) {
    return response && response.trim().length > 20; // At least 20 chars to be meaningful
  }
  
  isRelevantResponse(question, response, category) {
    // Check for category keywords in response
    const lowerResponse = response.toLowerCase();
    const categoryKeywords = {
      services: ['service', 'manicure', 'pedicure', 'nail', 'polish', 'gel', 'acrylic'],
      products: ['product', 'polish', 'brand', 'kit', 'bottle', 'collection'],
      booking: ['appointment', 'book', 'schedule', 'time', 'availability', 'calendar', 'hours'],
      about: ['business', 'history', 'founded', 'owner', 'staff', 'technician', 'located'],
      news: ['new', 'promotion', 'discount', 'event', 'offer', 'latest', 'special']
    };
    
    // Also check if response has any words from the question (excluding stop words)
    const questionWords = question.toLowerCase()
      .replace(/[.,?!;:]/g, '')
      .split(' ')
      .filter(word => word.length > 3) // Filter out short words like "a", "the", etc.
      .filter(word => !['what', 'when', 'where', 'which', 'how', 'does', 'do', 'you', 'your', 'have'].includes(word));
    
    const hasQuestionWords = questionWords.some(word => lowerResponse.includes(word));
    const hasCategoryKeywords = categoryKeywords[category].some(keyword => 
      lowerResponse.includes(keyword.toLowerCase())
    );
    
    return hasQuestionWords && hasCategoryKeywords;
  }
  
  isAccurateResponse(response, category) {
    // Check if response contains accurate information from website content
    const lowerResponse = response.toLowerCase();
    const truth = this.truthKeywords[category];
    
    // Check if required keywords are present
    const hasRequiredKeywords = truth.required.some(keyword => 
      lowerResponse.includes(keyword.toLowerCase())
    );
    
    // Check if any general keywords are present
    const hasGeneralKeywords = truth.keywords.some(keyword => 
      lowerResponse.includes(keyword.toLowerCase())
    );
    
    // Check for contradictions (simplified approach)
    // In a real implementation, this would be more sophisticated
    let hasContradictions = false;
    
    // Example check for pricing contradictions in services
    if (category === 'services') {
      if (lowerResponse.includes('basic manicure') && lowerResponse.includes('$') && !lowerResponse.includes('$25')) {
        hasContradictions = true;
      }
    }
    
    return hasRequiredKeywords && hasGeneralKeywords && !hasContradictions;
  }
  
  isHelpfulResponse(question, response) {
    // Check if the response is helpful for the user
    // This is a simplified implementation - in practice, this would be more nuanced
    
    // Check if response length is appropriate (not too short)
    const isGoodLength = response.length > 50;
    
    // Check if response has a good structure (contains sentences)
    const hasSentences = response.split('.').length > 1;
    
    // Check if response directly addresses the question format
    const isQuestion = question.trim().endsWith('?');
    const hasAnswer = isQuestion ? 
      response.toLowerCase().includes('yes') || 
      response.toLowerCase().includes('no') || 
      response.match(/we (do|offer|have|provide)/i) : true;
    
    return isGoodLength && hasSentences && hasAnswer;
  }
}

// Update the export to include async initialization
module.exports = EnhancedAITester;
