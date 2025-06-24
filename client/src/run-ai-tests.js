/**
 * DelaneNails AI Agent Test Runner
 * Main script to execute comprehensive AI tests
 */

const AIAgentTester = require('./ai-agent-test');
const { createAIAgent } = require('./ai-integration');
const websiteContent = require('./ai-data/website-content');

async function runAITests() {
  console.log("🤖 DelaneNails AI Agent Testing System");
  console.log("=====================================");
  console.log("Starting comprehensive AI testing...\n");
  
  try {
    // Create AI agent
    console.log("Initializing AI agent...");
    const aiAgent = await createAIAgent(websiteContent);
    
    // Create tester
    console.log("Setting up test framework...");
    const tester = new AIAgentTester(aiAgent);
    
    // Run tests
    console.log("Running tests, please wait...");
    const startTime = new Date();
    const results = await tester.runTests();
    const endTime = new Date();
    
    const testDuration = (endTime - startTime) / 1000; // in seconds
    console.log(`\nTests completed in ${testDuration.toFixed(1)} seconds`);
    
    return {
      success: true,
      results,
      testDate: new Date().toISOString()
    };
  } catch (error) {
    console.error("❌ Error during AI testing:", error);
    return {
      success: false,
      error: error.message
    };
  }
}

// If this script is run directly
if (require.main === module) {
  runAITests().then(result => {
    if (result.success) {
      console.log("\n✅ Tests completed successfully");
    } else {
      console.log("\n❌ Tests failed. Please check errors and try again.");
      process.exit(1);
    }
  });
}

module.exports = { runAITests };
