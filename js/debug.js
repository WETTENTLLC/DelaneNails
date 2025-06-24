/**
 * Simple NailAide Diagnostic Tool
 * Save this file as 'debug.js' (exactly as written) in your project folder
 */

const fs = require('fs');
const path = require('path');
const { OpenAI } = require('openai');

// Print basic environment info
console.log("==========================================");
console.log("NAILAIDE DIAGNOSTICS");
console.log("==========================================");
console.log(`Current directory: ${__dirname}`);
console.log(`Node version: ${process.version}`);
console.log(`File being executed: ${__filename}`);
console.log("==========================================");

// List all files in the directory
console.log("\n--- Files in Directory ---");
try {
  const files = fs.readdirSync(__dirname);
  console.log("Found files:");
  files.forEach(file => {
    try {
      const stats = fs.statSync(path.join(__dirname, file));
      console.log(`   ${file} - ${stats.size} bytes (${stats.isDirectory() ? 'Directory' : 'File'})`);
    } catch (err) {
      console.log(`   ${file} - [Error getting stats]`);
    }
  });
} catch (error) {
  console.error(`Could not read directory: ${__dirname}`);
  console.error(`Error: ${error.message}`);
}

// Check for OpenAI API key
console.log("\n--- OpenAI API Key Check ---");
if (!process.env.OPENAI_API_KEY) {
  console.log("❌ OPENAI_API_KEY is NOT SET");
  console.log("To set your API key:");
  console.log("1. Open your command prompt/terminal");
  console.log("2. Run one of these commands:");
  console.log("   - Windows CMD: set OPENAI_API_KEY=your-api-key");
  console.log("   - Windows PowerShell: $env:OPENAI_API_KEY = 'your-api-key'");
  console.log("   - Mac/Linux: export OPENAI_API_KEY=your-api-key");
} else {
  console.log("✅ OPENAI_API_KEY is set");
  // Show just first and last 4 characters
  const key = process.env.OPENAI_API_KEY;
  const maskedKey = key.substring(0, 4) + "..." + key.substring(key.length - 4);
  console.log(`   API key (masked): ${maskedKey}`);
}

// Check NailAide.js
console.log("\n--- NailAide.js Check ---");
const nailAidePath = path.join(__dirname, 'NailAide.js');
if (fs.existsSync(nailAidePath)) {
  console.log(`✅ Found NailAide.js (${fs.statSync(nailAidePath).size} bytes)`);
  // Check if we can load it
  try {
    const nailAide = require('./NailAide.js');
    console.log("   Successfully loaded NailAide.js");
    if (typeof nailAide.handleUserQuery === 'function') {
      console.log("   ✅ handleUserQuery function exists");
    } else {
      console.log("   ❌ handleUserQuery function NOT found");
    }
  } catch (error) {
    console.log(`   ❌ Error loading NailAide.js: ${error.message}`);
  }
} else {
  console.log("❌ NailAide.js NOT found");
}

// Check products.json
console.log("\n--- products.json Check ---");
const productsPath = path.join(__dirname, 'products.json');
if (fs.existsSync(productsPath)) {
  console.log(`✅ Found products.json (${fs.statSync(productsPath).size} bytes)`);
  try {
    const productsData = fs.readFileSync(productsPath, 'utf8');
    const products = JSON.parse(productsData);
    console.log(`   Contains ${products.products?.length || 0} products`);
    if (!products.products || products.products.length === 0) {
      console.log("   ⚠️ Warning: No products found in file");
    }
  } catch (error) {
    console.log(`   ❌ Error reading products.json: ${error.message}`);
  }
} else {
  console.log("❌ products.json NOT found");
}

// Simple test function
console.log("\n--- Simple Test ---");
console.log("Attempting to run a simple test...");

const testNailAide = async () => {
  try {
    const nailAide = require('./NailAide.js');
    console.log("Running test query: 'What products do you offer?'");
    const response = await nailAide.handleUserQuery("What products do you offer?");
    console.log(`Response received (${response.length} chars):`);
    console.log(`"${response.substring(0, 150)}${response.length > 150 ? '...' : ''}"`);
  } catch (error) {
    console.log("❌ Test failed with error:");
    console.log(error);
  }
};

// Run test if NailAide.js exists
if (fs.existsSync(nailAidePath)) {
  testNailAide().then(() => {
    console.log("\n==========================================");
    console.log("DIAGNOSTICS COMPLETE");
    console.log("==========================================");
  });
} else {
  console.log("\n==========================================");
  console.log("DIAGNOSTICS COMPLETE (SKIPPED TEST: NailAide.js not found)");
  console.log("==========================================");
}
