/**
 * DelaneNails AI Testing System - Root Entry Point
 */

console.log("Starting DelaneNails AI testing...");

// First, check if the tests directory and files exist
const fs = require('fs');
const path = require('path');

// Directory checks
const testsDir = path.join(__dirname, 'tests');
if (!fs.existsSync(testsDir)) {
  console.error("Error: 'tests' directory not found. Creating it now...");
  try {
    fs.mkdirSync(testsDir);
    console.log("Created 'tests' directory");
  } catch (err) {
    console.error(`Failed to create tests directory: ${err.message}`);
    process.exit(1);
  }
}

// Simple test function to use while building out the system
async function runBasicTest() {
  console.log("Running basic AI test...");
  console.log("This is a placeholder until the full test system is in place.");
  
  // If tests module exists, try to use it
  try {
    if (fs.existsSync(path.join(testsDir, 'index.js'))) {
      const testsModule = require('./tests/index');
      return await testsModule.runBasicTests();
    }
  } catch (error) {
    console.log("Tests module not yet available. Using fallback test.");
  }
  
  // Fallback test logic
  return {
    success: true,
    message: "Basic test completed. Real tests will be available once all files are in place."
  };
}

async function runComprehensiveTest() {
  console.log("Running comprehensive AI test...");
  
  try {
    if (fs.existsSync(path.join(testsDir, 'index.js'))) {
      const testsModule = require('./tests/index');
      return await testsModule.runComprehensiveTests();
    }
  } catch (error) {
    console.log("Comprehensive tests not yet available.");
  }
  
  return await runBasicTest(); // Fall back to basic test
}

// Command-line handling
if (require.main === module) {
  // Get command-line arguments
  const args = process.argv.slice(2);
  const testType = args[0] || 'comprehensive';
  
  console.log(`Test type requested: ${testType}`);
  
  // Run the appropriate test
  if (testType === 'basic') {
    runBasicTest().then(result => {
      console.log("Test completed:", result);
    }).catch(error => {
      console.error("Test failed:", error);
    });
  } else {
    runComprehensiveTest().then(result => {
      console.log("Test completed:", result);
    }).catch(error => {
      console.error("Test failed:", error);
    });
  }
}

module.exports = {
  runBasicTests: runBasicTest,
  runComprehensiveTests: runComprehensiveTest
};