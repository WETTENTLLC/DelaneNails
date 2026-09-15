/**
 * Setup script to create all necessary files and folders
 */

const fs = require('fs');
const path = require('path');

// Ensure directories exist
const directories = [
  './tests',
  './tests/ai-data',
  './tests/reports'
];

directories.forEach(dir => {
  if (!fs.existsSync(dir)) {
    console.log(`Creating directory: ${dir}`);
    fs.mkdirSync(dir, { recursive: true });
  } else {
    console.log(`Directory exists: ${dir}`);
  }
});

// Check if files exist
const files = [
  './index.js',
  './tests/index.js',
  './tests/ai-agent-test.js',
  './tests/enhanced-ai-tester.js',
  './tests/ai-integration.js',
  './tests/report-generator.js',
  './tests/run-ai-tests.js',
  './tests/supabase-integration.js',
  './tests/ai-data/website-content.js',
  './.env'
];

files.forEach(file => {
  if (fs.existsSync(file)) {
    console.log(`File exists: ${file}`);
  } else {
    console.log(`File missing: ${file}`);
  }
});

console.log("\nSetup check complete. Files marked as 'missing' need to be created.");
console.log("Run 'npm install' to install dependencies.");
