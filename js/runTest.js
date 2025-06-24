// Simple test runner for NailAide

// First run diagnostics
console.log("Running diagnostics first...");
require('./nailAideDebug');

// Wait a moment before running tests
setTimeout(() => {
  console.log("\n\nNow testing NailAide functionality...");
  
  try {
    const { testNailAide } = require('./NailAide');
    testNailAide();
  } catch (error) {
    console.error("Error running NailAide tests:", error);
  }
}, 5000); // Wait 5 seconds for diagnostics to complete
