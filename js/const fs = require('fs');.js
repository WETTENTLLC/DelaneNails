const fs = require('fs');
const path = require('path');

console.log("Creating essential files for DelaneNails project...");

// Create server.js
const serverContent = `
const http = require('http');

// Create basic HTTP server
const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/html' });
  res.end('<html><body><h1>DelaneNails Server is Running!</h1><p>The AI testing system is working.</p></body></html>');
});

// Start server
const PORT = 3000;
server.listen(PORT, () => {
  console.log(\`Server running at http://localhost:\${PORT}/\`);
});
`;

// Write the file to disk
try {
  fs.writeFileSync('server.js', serverContent);
  console.log("✅ Created server.js successfully");
} catch (error) {
  console.error(`Error creating server.js: ${error.message}`);
}

// Create package.json
const packageContent = `{
  "name": "delanenails",
  "version": "1.0.0",
  "description": "DelaneNails Website",
  "main": "server.js",
  "scripts": {
    "start": "node server.js",
    "dev": "node server.js"
  }
}`;

try {
  fs.writeFileSync('package.json', packageContent);
  console.log("✅ Created package.json successfully");
} catch (error) {
  console.error(`Error creating package.json: ${error.message}`);
}

console.log("\nSetup complete! Now you can run:");
console.log("node server.js");
