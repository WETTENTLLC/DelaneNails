/**
 * DelaneNails AI Agent Testing Framework
 * This script tests the AI agent's conversational capabilities across website content
 */

class AIAgentTester {
  constructor(aiAgent) {
    this.aiAgent = aiAgent;
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
    this.results = {};
  }

  async runTests() {
    console.log("🔍 STARTING AI AGENT COMPREHENSIVE TESTING 🔍");
    console.log("===========================================");
    
    for (const [category, data] of Object.entries(this.testCategories)) {
      console.log(`\n📋 Testing ${category.toUpperCase()} knowledge:`);
      this.results[category] = {
        questions: 0,
        nonEmptyResponses: 0,
        relevantResponses: 0
      };
      
      for (const question of data.questions) {
        console.log(`\nQ: ${question}`);
        
        // Get response from AI agent
        const response = await this.queryAgent(question);
        console.log(`A: ${response}`);
        
        // Evaluate response
        this.results[category].questions++;
        
        if (response && response.trim().length > 0) {
          this.results[category].nonEmptyResponses++;
          
          // Basic relevance checking (can be enhanced)
          if (this.isRelevantResponse(question, response, category)) {
            this.results[category].relevantResponses++;
            console.log("✅ Response appears relevant");
          } else {
            console.log("❌ Response may not be relevant");
          }
        } else {
          console.log("❌ Empty response received");
        }
      }
    }
    
    this.generateReport();
  }
  
  async queryAgent(question) {
    // Use the actual AI agent to get responses
    if (this.aiAgent && typeof this.aiAgent.getResponse === 'function') {
      console.log("Querying AI agent...");
      return await this.aiAgent.getResponse(question);
    } else {
      console.warn("AI agent not properly configured. Using mock response.");
      // Placeholder response if AI agent isn't available
      return "This is a mock response since the AI agent is not fully configured.";
    }
  }
  
  isRelevantResponse(question, response, category) {
    // Basic relevance check - looking for category keywords in response
    // This should be enhanced with more sophisticated NLP in a real implementation
    const categoryKeywords = {
      services: ['service', 'manicure', 'pedicure', 'nail', 'polish', 'gel', 'acrylic'],
      products: ['product', 'polish', 'brand', 'kit', 'bottle', 'collection'],
      booking: ['appointment', 'book', 'schedule', 'time', 'availability', 'calendar'],
      about: ['business', 'history', 'founded', 'owner', 'staff', 'technician', 'located'],
      news: ['new', 'promotion', 'discount', 'event', 'offer', 'latest']
    };
    
    const keywords = categoryKeywords[category];
    return keywords.some(keyword => 
      response.toLowerCase().includes(keyword.toLowerCase())
    );
  }
  
  generateReport() {
    console.log("\n\n📊 AI AGENT TEST RESULTS SUMMARY 📊");
    console.log("=====================================");
    
    let totalQuestions = 0;
    let totalNonEmpty = 0;
    let totalRelevant = 0;
    
    for (const [category, results] of Object.entries(this.results)) {
      const relevancePercentage = (results.relevantResponses / results.questions) * 100;
      console.log(`\n${category.toUpperCase()}:`);
      console.log(`Questions asked: ${results.questions}`);
      console.log(`Non-empty responses: ${results.nonEmptyResponses}`);
      console.log(`Relevant responses: ${results.relevantResponses} (${relevancePercentage.toFixed(1)}%)`);
      
      totalQuestions += results.questions;
      totalNonEmpty += results.nonEmptyResponses;
      totalRelevant += results.relevantResponses;
    }
    
    const overallRelevancePercentage = (totalRelevant / totalQuestions) * 100;
    console.log("\n📈 OVERALL RESULTS:");
    console.log(`Total questions: ${totalQuestions}`);
    console.log(`Total non-empty responses: ${totalNonEmpty}`);
    console.log(`Total relevant responses: ${totalRelevant} (${overallRelevancePercentage.toFixed(1)}%)`);
    
    if (overallRelevancePercentage >= 90) {
      console.log("\n✅ TEST PASSED: AI Agent demonstrates excellent knowledge of website content");
    } else if (overallRelevancePercentage >= 75) {
      console.log("\n⚠️ TEST PARTIALLY PASSED: AI Agent has good knowledge but some improvements needed");
    } else {
      console.log("\n❌ TEST FAILED: AI Agent needs significant improvements to handle website queries");
    }
  }
}

// Example usage:
// const myAIAgent = new DelaneNailsAIAgent(); // Replace with actual AI agent
// const tester = new AIAgentTester(myAIAgent);
// tester.runTests().then(() => console.log("Testing completed"));

module.exports = AIAgentTester;
