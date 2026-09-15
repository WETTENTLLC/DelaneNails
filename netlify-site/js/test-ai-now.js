/**
 * Quick test script to immediately test the AI agent
 */

require('dotenv').config();
const { createAIAgent } = require('./tests/ai-integration');
const websiteContent = require('./tests/ai-data/website-content');

async function testAI() {
  console.log("🔍 QUICK AI AGENT TEST 🔍");
  console.log("========================");
  
  try {
    // Create AI agent
    console.log("\nInitializing AI agent...");
    const aiAgent = await createAIAgent(websiteContent);
    
    // Test questions - one from each category
    const testQuestions = [
      "What nail services do you offer?",
      "What nail polish brands do you carry?",
      "How can I book an appointment?",
      "Who founded DelaneNails?",
      "Do you have any current promotions?"
    ];
    
    console.log("\nTesting AI responses...");
    console.log("------------------------");
    
    for (const question of testQuestions) {
      console.log(`\nQ: ${question}`);
      const response = await aiAgent.getResponse(question);
      console.log(`A: ${response}`);
      console.log("------------------------");
    }
    
    console.log("\n✅ Quick test completed");
    console.log("To run comprehensive tests, use: node index.js");
    
  } catch (error) {
    console.error("❌ Test failed:", error);
  }
}

// Run the test
testAI();
