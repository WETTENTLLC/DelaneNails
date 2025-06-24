/**
 * Fix setup script for DelaneNails project
 * This script will ensure all files and directories exist and are properly configured
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🛠️ Fixing DelaneNails project setup...');

// Create necessary directories
const directories = [
  './public',
  './public/css',
  './public/js',
  './public/img',
  './tests',
  './tests/ai-data',
  './tests/reports'
];

directories.forEach(dir => {
  if (!fs.existsSync(dir)) {
    console.log(`Creating directory: ${dir}`);
    fs.mkdirSync(dir, { recursive: true });
  }
});

// Create a valid package.json file
const packageJson = {
  "name": "delanenails",
  "version": "1.0.0",
  "description": "DelaneNails AI Assistant and Testing Framework",
  "main": "index.js",
  "scripts": {
    "dev": "node server.js",
    "start": "node server.js",
    "serve": "node server.js",
    "test": "node index.js",
    "test:basic": "node index.js basic",
    "test:full": "node index.js comprehensive"
  },
  "dependencies": {
    "axios": "^1.3.4",
    "chart.js": "^4.2.1",
    "cors": "^2.8.5",
    "dotenv": "^16.0.3",
    "express": "^4.18.2",
    "@supabase/supabase-js": "^2.21.0"
  },
  "devDependencies": {
    "nodemon": "^3.0.1"
  }
};

console.log('Creating correct package.json...');
fs.writeFileSync('package.json', JSON.stringify(packageJson, null, 2));

// Create a proper .env file if it doesn't exist 
if (!fs.existsSync('.env')) {
  console.log('Creating .env file...');
  const envContent = `# DelaneNails Environment Configuration

# Server settings
PORT=5000
NODE_ENV=development

# API Keys
OPENROUTER_API_KEY=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
OPENROUTER_URL=https://openrouter.ai/api/v1/chat/completions
PREFERRED_MODEL=openai/gpt-3.5-turbo

# Database settings
SUPABASE_URL=https://your-supabase-project-id.supabase.co
SUPABASE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imtjb29naGZkdXpsY29tbG1qZWh5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDExMjY5NDQsImV4cCI6MjA1NjcwMjk0NH0.dmtLvCJ6CCRyQOyFu0bnczCHMjLmWkWSMYCchK6TfDI`;
  
  fs.writeFileSync('.env', envContent);
}

// Create server.js if it doesn't exist
if (!fs.existsSync('server.js')) {
  console.log('Creating server.js...');
  const serverContent = `/**
 * DelaneNails Development Server
 */

const express = require('express');
const path = require('path');
const cors = require('cors');
require('dotenv').config();

// Initialize express app
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from the public directory
app.use(express.static(path.join(__dirname, 'public')));

// API route for AI queries
app.post('/api/query', async (req, res) => {
  try {
    const { question } = req.body;
    
    if (!question) {
      return res.status(400).json({ error: 'Question is required' });
    }
    
    // Import the AI integration
    const { createAIAgent } = require('./tests/ai-integration');
    const websiteContent = require('./tests/ai-data/website-content');
    
    // Create AI agent
    const aiAgent = await createAIAgent(websiteContent);
    
    // Get response
    const response = await aiAgent.getResponse(question);
    
    return res.json({ response });
  } catch (error) {
    console.error('Error processing AI query:', error);
    return res.status(500).json({ error: 'Error processing your request' });
  }
});

// Default route for the website
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start the server
app.listen(PORT, () => {
  console.log(\`🌐 DelaneNails server running on http://localhost:\${PORT}\`);
  console.log(\`📂 Serving files from: \${path.join(__dirname, 'public')}\`);
  console.log(\`💡 API endpoint available at: http://localhost:\${PORT}/api/query\`);
});`;
  
  fs.writeFileSync('server.js', serverContent);
}

// Create a basic index.html in public directory if it doesn't exist
if (!fs.existsSync('public/index.html')) {
  console.log('Creating public/index.html...');
  const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>DelaneNails</title>
    <link rel="stylesheet" href="css/style.css">
    <script src="js/app.js" defer></script>
</head>
<body>
    <header>
        <div class="container">
            <div class="logo">
                <h1>DelaneNails</h1>
            </div>
            <nav>
                <button class="mobile-menu-toggle">
                    <span></span>
                    <span></span>
                    <span></span>
                </button>
                <ul class="nav-menu">
                    <li><a href="#services">Services</a></li>
                    <li><a href="#products">Products</a></li>
                    <li><a href="#booking">Booking</a></li>
                    <li><a href="#about">About Us</a></li>
                    <li><a href="#contact">Contact</a></li>
                </ul>
            </nav>
        </div>
    </header>

    <main>
        <section class="hero">
            <div class="container">
                <h2>Luxury Nail Care Services</h2>
                <p>Experience premium nail treatments in a relaxing environment</p>
                <a href="#booking" class="btn primary-btn">Book an Appointment</a>
            </div>
        </section>
        
        <section id="services" class="section">
            <div class="container">
                <h2 class="section-title">Our Services</h2>
                <div class="services-grid">
                    <div class="service-card">
                        <h3>Manicures</h3>
                        <p>From basic nail care to luxury treatments</p>
                        <p class="price">Starting at $25</p>
                    </div>
                    <div class="service-card">
                        <h3>Pedicures</h3>
                        <p>Relaxing foot care and perfect polish</p>
                        <p class="price">Starting at $35</p>
                    </div>
                    <div class="service-card">
                        <h3>Nail Extensions</h3>
                        <p>Acrylic, gel, and dip powder options</p>
                        <p class="price">Starting at $50</p>
                    </div>
                    <div class="service-card">
                        <h3>Nail Art</h3>
                        <p>Express your style with custom designs</p>
                        <p class="price">Starting at $5 per nail</p>
                    </div>
                </div>
                <a href="#booking" class="btn secondary-btn">Book Now</a>
            </div>
        </section>

        <!-- AI Chat Assistant -->
        <section id="chat-assistant" class="section">
            <div class="container">
                <h2 class="section-title">Ask Our Virtual Assistant</h2>
                <div class="chat-container">
                    <div id="chat-messages" class="chat-messages">
                        <div class="message bot">
                            Hello! I'm the DelaneNails virtual assistant. How can I help you today?
                        </div>
                    </div>
                    <form id="chat-form" class="chat-input">
                        <input type="text" id="user-message" placeholder="Ask about our services, products, or booking..." required>
                        <button type="submit" class="btn">Send</button>
                    </form>
                </div>
            </div>
        </section>
        
    </main>

    <footer>
        <div class="container">
            <div class="footer-content">
                <div class="footer-section">
                    <h3>DelaneNails</h3>
                    <p>Quality nail services since 2015</p>
                </div>
                <div class="footer-section">
                    <h3>Hours</h3>
                    <p>Mon-Wed: 10AM - 7PM</p>
                    <p>Thu-Fri: 9AM - 8PM</p>
                    <p>Sat: 9AM - 6PM</p>
                    <p>Sun: 11AM - 5PM</p>
                </div>
                <div class="footer-section">
                    <h3>Contact</h3>
                    <p>123 Beauty Boulevard</p>
                    <p>Cityville, State 12345</p>
                    <p>Phone: (555) 123-4567</p>
                </div>
                <div class="footer-section">
                    <h3>Follow Us</h3>
                    <div class="social-links">
                        <a href="#">Facebook</a>
                        <a href="#">Instagram</a>
                        <a href="#">Twitter</a>
                    </div>
                </div>
            </div>
            <div class="copyright">
                <p>&copy; 2023 DelaneNails. All rights reserved.</p>
            </div>
        </div>
    </footer>
</body>
</html>`;
  
  fs.writeFileSync('public/index.html', htmlContent);
}

// Create CSS file if it doesn't exist
if (!fs.existsSync('public/css/style.css')) {
  console.log('Creating public/css/style.css...');
  if (!fs.existsSync('public/css')) {
    fs.mkdirSync('public/css', { recursive: true });
  }
  
  // Simple CSS content - stripped down for brevity
  const cssContent = `/* DelaneNails Main Stylesheet */

/* Variables */
:root {
  --primary-color: #8A2BE2; /* Vibrant Purple */
  --secondary-color: #FF69B4; /* Hot Pink */
  --accent-color: #FFD700; /* Gold */
  --text-color: #333333;
  --light-color: #FFFFFF;
  --background-color: #F9F9F9;
  --shadow: 0 2px 10px rgba(0,0,0,0.1);
}

/* Reset & Base Styles */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  color: var(--text-color);
  background-color: var(--background-color);
  line-height: 1.6;
}`;
  
  fs.writeFileSync('public/css/style.css', cssContent);
}

// Create JS file if it doesn't exist
if (!fs.existsSync('public/js/app.js')) {
  console.log('Creating public/js/app.js...');
  if (!fs.existsSync('public/js')) {
    fs.mkdirSync('public/js', { recursive: true });
  }
  
  const jsContent = `/**
 * DelaneNails Frontend JavaScript
 */

document.addEventListener('DOMContentLoaded', function() {
    // Initialize UI components
    console.log('DelaneNails website initialized');
    
    // Initialize chat functionality
    const chatForm = document.getElementById('chat-form');
    const userInput = document.getElementById('user-message');
    
    if (chatForm && userInput) {
        chatForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const question = userInput.value.trim();
            if (!question) return;
            
            // Add user message to chat
            addMessageToChat('user', question);
            
            // Clear input
            userInput.value = '';
            
            // Show typing indicator
            const typingIndicator = addMessageToChat('bot', '<em>Typing...</em>');
            
            try {
                // Send request to AI
                const response = await fetch('/api/query', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ question })
                });
                
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                
                const data = await response.json();
                
                // Replace typing indicator with actual response
                typingIndicator.innerHTML = data.response;
            } catch (error) {
                console.error('Error:', error);
                
                // Replace typing indicator with error message
                typingIndicator.innerHTML = 'Sorry, I encountered an error. Please try again.';
            }
        });
    }
});

/**
 * Add message to chat window
 */
function addMessageToChat(type, content) {
    const chatMessages = document.getElementById('chat-messages');
    if (!chatMessages) return null;
    
    const message = document.createElement('div');
    message.classList.add('message', type);
    message.innerHTML = content;
    
    chatMessages.appendChild(message);
    
    // Scroll to bottom of chat
    chatMessages.scrollTop = chatMessages.scrollHeight;
    
    return message;
}`;
  
  fs.writeFileSync('public/js/app.js', jsContent);
}

console.log('Installing dependencies...');
try {
  execSync('npm install', { stdio: 'inherit' });
} catch (error) {
  console.error('Failed to install dependencies:', error);
  console.log('Try running "npm install" manually.');
}

console.log('\n✅ Setup fixed! Now try running:');
console.log('npm run dev');

console.log('\nIf you have issues with npm, try using:');
console.log('node server.js');
