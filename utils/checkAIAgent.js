const fs = require('fs').promises;
const path = require('path');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config({ path: './.env' });

/**
 * Check AI Agent directory structure and files
 */
async function checkAIStructure() {
  console.log('🤖 CHECKING AI AGENT SYSTEM...\n');
  console.log('Checking AI Agent directory structure...');
  
  // Expected AI directory paths
  const aiDirs = [
    { path: path.join(__dirname, '..', 'ai'), name: 'ai' },
    { path: path.join(__dirname, '..', 'ai', 'models'), name: 'ai/models' },
    { path: path.join(__dirname, '..', 'ai', 'intents'), name: 'ai/intents' },
    { path: path.join(__dirname, '..', 'ai', 'responses'), name: 'ai/responses' }
  ];
  
  // Check if directories exist
  for (const dir of aiDirs) {
    try {
      await fs.access(dir.path);
      console.log(`✅ ${dir.name} directory exists`);
    } catch (err) {
      console.warn(`⚠️  ${dir.name} directory not found`);
    }
  }
  
  // Check for key AI files
  const keyFiles = [
    { path: path.join(__dirname, '..', 'ai', 'agent.js'), name: 'agent.js' },
    { path: path.join(__dirname, '..', 'ai', 'nlu.js'), name: 'nlu.js (Natural Language Understanding)' },
    { path: path.join(__dirname, '..', 'ai', 'nlg.js'), name: 'nlg.js (Natural Language Generation)' },
    { path: path.join(__dirname, '..', 'ai', 'context.js'), name: 'context.js (Context Management)' },
    { path: path.join(__dirname, '..', 'controllers', 'aiController.js'), name: 'aiController.js' }
  ];
  
  // Check if key files exist
  for (const file of keyFiles) {
    try {
      await fs.access(file.path);
      console.log(`✅ ${file.name} found`);
    } catch (err) {
      console.warn(`⚠️  ${file.name} not found`);
    }
  }
  
  // Check for intents
  try {
    const intentsPath = path.join(__dirname, '..', 'ai', 'intents');
    const files = await fs.readdir(intentsPath);
    const jsonFiles = files.filter(file => file.endsWith('.json'));
    
    if (jsonFiles.length > 0) {
      console.log(`✅ Found ${jsonFiles.length} intent definitions: ${jsonFiles.join(', ')}`);
    } else {
      console.warn('⚠️  No intent definitions found');
    }
  } catch (err) {
    // Intentionally ignore if directory doesn't exist (already warned above)
  }
}

/**
 * Check AI Agent dependencies
 */
async function checkAIDependencies() {
  console.log('\nChecking AI Agent dependencies...');
  
  // Check for AI-related packages in package.json
  try {
    const packagePath = path.join(__dirname, '..', 'package.json');
    const packageContent = await fs.readFile(packagePath, 'utf-8');
    const packageJson = JSON.parse(packageContent);
    
    const dependencies = { ...packageJson.dependencies, ...packageJson.devDependencies };
    
    const aiPackages = {
      'natural': false,
      'brain.js': false,
      'tensorflow': false,
      '@tensorflow/tfjs': false,
      'compromise': false,
      'nlp.js': false,
      'node-nlp': false,
      'openai': false,
      '@huggingface/inference': false,
      'langchain': false
    };
    
    let foundAiPackages = 0;
    for (const pkg in aiPackages) {
      if (dependencies[pkg]) {
        aiPackages[pkg] = true;
        foundAiPackages++;
        console.log(`✅ ${pkg} is installed`);
      }
    }
    
    if (foundAiPackages === 0) {
      console.warn('⚠️  No NLP/AI libraries found in package.json');
    }
    
    // Check for any related packages with ML/AI terms
    const possibleAiPackages = Object.keys(dependencies).filter(pkg => 
      pkg.includes('ai') || 
      pkg.includes('ml') || 
      pkg.includes('nlp') || 
      pkg.includes('natural') || 
      pkg.includes('language') ||
      pkg.includes('chat') ||
      pkg.includes('bot')
    );
    
    if (possibleAiPackages.length > 0) {
      console.log(`✅ Found other potential AI-related packages: ${possibleAiPackages.join(', ')}`);
    }
    
  } catch (err) {
    console.error('❌ Error checking package.json for AI dependencies:', err.message);
  }
  
  // Check for API keys for AI services
  const aiServices = [
    { name: 'OpenAI', envVar: ['OPENAI_API_KEY', 'OPENAI_KEY'] },
    { name: 'Hugging Face', envVar: ['HUGGINGFACE_API_KEY', 'HF_API_KEY'] },
    { name: 'Google AI', envVar: ['GOOGLE_AI_API_KEY', 'GOOGLE_API_KEY'] },
    { name: 'Azure OpenAI', envVar: ['AZURE_OPENAI_KEY', 'AZURE_OPENAI_ENDPOINT'] },
    { name: 'Amazon Bedrock', envVar: ['AWS_ACCESS_KEY_ID', 'AWS_SECRET_ACCESS_KEY'] }
  ];
  
  let foundApiKeys = false;
  
  for (const service of aiServices) {
    const hasKey = service.envVar.some(varName => !!process.env[varName]);
    if (hasKey) {
      console.log(`✅ ${service.name} API key found`);
      foundApiKeys = true;
    }
  }
  
  if (!foundApiKeys) {
    console.warn('⚠️  No API keys found for AI services');
  }
}

/**
 * Check AI Agent implementation
 */
async function checkAIImplementation() {
  console.log('\nChecking AI Agent implementation...');
  
  // First check for agent.js
  let agentPath = path.join(__dirname, '..', 'ai', 'agent.js');
  let agentContent = '';
  
  try {
    agentContent = await fs.readFile(agentPath, 'utf-8');
    console.log('✅ Found AI agent implementation');
  } catch (err) {
    // If agent.js doesn't exist in /ai, try other common locations
    const possiblePaths = [
      path.join(__dirname, '..', 'services', 'aiService.js'),
      path.join(__dirname, '..', 'services', 'chatbotService.js'),
      path.join(__dirname, '..', 'utils', 'ai.js')
    ];
    
    let found = false;
    for (const p of possiblePaths) {
      try {
        agentContent = await fs.readFile(p, 'utf-8');
        console.log(`✅ Found AI agent implementation at ${p}`);
        agentPath = p;
        found = true;
        break;
      } catch (err) {
        // Continue to next path
      }
    }
    
    if (!found) {
      console.warn('⚠️  Could not find AI agent implementation');
      return;
    }
  }
  
  // Analyze implementation features
  const features = {
    'intentRecognition': agentContent.includes('intent') || agentContent.includes('recognize'),
    'entityExtraction': agentContent.includes('entity') || agentContent.includes('extract'),
    'contextManagement': agentContent.includes('context') || agentContent.includes('session'),
    'apiIntegration': agentContent.includes('api.') || agentContent.includes('fetch(') || agentContent.includes('axios'),
    'responsesGeneration': agentContent.includes('response') || agentContent.includes('reply'),
    'conversationFlow': agentContent.includes('conversation') || agentContent.includes('dialog')
  };
  
  for (const [feature, present] of Object.entries(features)) {
    if (present) {
      console.log(`✅ ${feature} appears to be implemented`);
    } else {
      console.warn(`⚠️  ${feature} may not be implemented`);
    }
  }
  
  // Check for model initialization or API calls
  const hasModelInit = 
    agentContent.includes('new Model') || 
    agentContent.includes('initModel') ||
    agentContent.includes('createCompletion') ||
    agentContent.includes('completion') ||
    agentContent.includes('openai.');
  
  if (hasModelInit) {
    console.log('✅ Found model initialization or API calls');
  } else {
    console.warn('⚠️  No model initialization or API calls found');
  }
}

/**
 * Check AI Agent routes and API endpoints
 */
async function checkAIRoutes() {
  console.log('\nChecking AI Agent routes and endpoints...');
  
  // Check for AI routes
  const possibleRoutePaths = [
    path.join(__dirname, '..', 'routes', 'aiRoutes.js'),
    path.join(__dirname, '..', 'routes', 'chatRoutes.js'),
    path.join(__dirname, '..', 'routes', 'botRoutes.js')
  ];
  
  let routeContent = '';
  let routePath = '';
  let found = false;
  
  for (const p of possibleRoutePaths) {
    try {
      routeContent = await fs.readFile(p, 'utf-8');
      console.log(`✅ Found AI route definitions at ${p}`);
      routePath = p;
      found = true;
      break;
    } catch (err) {
      // Continue to next path
    }
  }
  
  if (!found) {
    // Check app.js for AI routes if dedicated route file not found
    try {
      const appContent = await fs.readFile(path.join(__dirname, '..', 'app.js'), 'utf-8');
      const hasAiRoutes = 
        appContent.includes('/ai') || 
        appContent.includes('/chat') || 
        appContent.includes('/bot') ||
        appContent.includes('aiRouter') || 
        appContent.includes('chatRouter') ||
        appContent.includes('botRouter');
      
      if (hasAiRoutes) {
        console.log('✅ Found AI routes defined in app.js');
      } else {
        console.warn('⚠️  No dedicated AI route file found');
      }
    } catch (err) {
      console.error('❌ Could not check app.js for AI routes:', err.message);
    }
  } else {
    // Analyze route endpoints
    const endpoints = [
      { pattern: 'get', description: 'GET endpoint (e.g., for fetching responses)' },
      { pattern: 'post', description: 'POST endpoint (e.g., for sending messages)' },
      { pattern: 'message', description: 'Message/chat endpoint' },
      { pattern: 'intent', description: 'Intent detection endpoint' },
      { pattern: 'chat', description: 'Chat endpoint' },
      { pattern: '/bot', description: 'Bot endpoint' }
    ];
    
    for (const endpoint of endpoints) {
      if (routeContent.toLowerCase().includes(endpoint.pattern)) {
        console.log(`✅ Found ${endpoint.description}`);
      }
    }
  }
  
  // Check for webhooks (common in bot implementations)
  try {
    const appContent = await fs.readFile(path.join(__dirname, '..', 'app.js'), 'utf-8');
    const hasWebhooks = 
      appContent.includes('webhook') || 
      (routeContent && routeContent.includes('webhook'));
    
    if (hasWebhooks) {
      console.log('✅ Found webhook implementation');
    }
  } catch (err) {
    // Skip webhook check if app.js can't be read
  }
}

/**
 * Check frontend integration if applicable
 */
async function checkFrontendIntegration() {
  console.log('\nChecking frontend integration for AI Agent...');
  
  // Check for chat UI components
  const publicDir = path.join(__dirname, '..', 'public');
  
  try {
    await fs.access(publicDir);
    
    // Check for chat.js or similar
    const possibleChatFiles = [
      'chat.js', 
      'bot.js', 
      'chatbot.js', 
      'assistant.js'
    ];
    
    const files = await fs.readdir(path.join(publicDir, 'js'));
    
    const chatFiles = files.filter(file => 
      possibleChatFiles.some(chatFile => file.toLowerCase().includes(chatFile))
    );
    
    if (chatFiles.length > 0) {
      console.log(`✅ Found potential chat frontend files: ${chatFiles.join(', ')}`);
      
      // Read one of the files to check for features
      const chatFileContent = await fs.readFile(
        path.join(publicDir, 'js', chatFiles[0]), 
        'utf-8'
      );
      
      const frontendFeatures = {
        'messageRendering': chatFileContent.includes('message') || chatFileContent.includes('chat'),
        'userInput': chatFileContent.includes('input') || chatFileContent.includes('form'),
        'apiCalls': chatFileContent.includes('fetch(') || chatFileContent.includes('axios') || chatFileContent.includes('ajax'),
        'websockets': chatFileContent.includes('socket') || chatFileContent.includes('ws://') || chatFileContent.includes('wss://'),
        'responseHandling': chatFileContent.includes('response') || chatFileContent.includes('reply')
      };
      
      for (const [feature, present] of Object.entries(frontendFeatures)) {
        if (present) {
          console.log(`  ✅ Frontend appears to implement ${feature}`);
        }
      }
    } else {
      // Check for chat UI in index.html or views
      try {
        const views = await fs.readdir(path.join(__dirname, '..', 'views'));
        const chatViews = views.filter(file => 
          file.toLowerCase().includes('chat') || 
          file.toLowerCase().includes('bot') ||
          file.toLowerCase().includes('assistant')
        );
        
        if (chatViews.length > 0) {
          console.log(`✅ Found potential chat view templates: ${chatViews.join(', ')}`);
        } else {
          console.warn('⚠️  No dedicated chat UI files found');
        }
      } catch (err) {
        // Skip if views directory doesn't exist
      }
    }
    
    // Check for chat CSS
    try {
      const cssFiles = await fs.readdir(path.join(publicDir, 'css'));
      const chatCss = cssFiles.filter(file => 
        file.toLowerCase().includes('chat') || 
        file.toLowerCase().includes('bot') ||
        file.toLowerCase().includes('assistant')
      );
      
      if (chatCss.length > 0) {
        console.log(`✅ Found potential chat styling: ${chatCss.join(', ')}`);
      }
    } catch (err) {
      // Skip if css directory doesn't exist
    }
    
  } catch (err) {
    console.warn('⚠️  Could not check for frontend integration');
  }
}

/**
 * Check AI agent configuration
 */
async function checkAIConfiguration() {
  console.log('🤖 CHECKING AI AGENT SYSTEM...\n');
  console.log('Checking AI agent configuration...');
  
  // Check for AI API keys
  if (!process.env.OPENAI_API_KEY) {
    console.warn('⚠️  OPENAI_API_KEY environment variable not found');
  } else {
    console.log('✅ OPENAI_API_KEY environment variable is set');
  }
  
  // Check for alternative AI providers
  const aiProviders = {
    'OPENAI_API_KEY': process.env.OPENAI_API_KEY,
    'ANTHROPIC_API_KEY': process.env.ANTHROPIC_API_KEY,
    'COHERE_API_KEY': process.env.COHERE_API_KEY,
    'AI_PROVIDER': process.env.AI_PROVIDER
  };
  
  const configuredProviders = Object.entries(aiProviders)
    .filter(([_, value]) => value)
    .map(([key]) => key);
  
  if (configuredProviders.length > 0) {
    console.log(`✅ AI provider configuration found: ${configuredProviders.join(', ')}`);
  } else {
    console.warn('⚠️  No AI provider configuration found');
  }
}

/**
 * Check AI agent components
 */
async function checkAIComponents() {
  console.log('\nChecking AI agent components...');
  
  const aiDir = path.join(__dirname, '..', 'services', 'ai');
  const componentsDir = path.join(__dirname, '..', 'components', 'ai');
  const controllersDir = path.join(__dirname, '..', 'controllers');
  
  try {
    // Check for AI service
    try {
      const aiService = require('../services/aiService');
      console.log('✅ AI service found');
      
      if (typeof aiService.generateResponse === 'function') {
        console.log('✅ AI service has generateResponse method');
      } else {
        console.warn('⚠️  AI service is missing generateResponse method');
      }
    } catch (err) {
      console.warn('⚠️  AI service not found');
    }
    
    // Check for AI directory
    try {
      await fs.access(aiDir);
      const files = await fs.readdir(aiDir);
      if (files.length > 0) {
        console.log(`✅ AI directory found with ${files.length} files`);
      } else {
        console.warn('⚠️  AI directory is empty');
      }
    } catch (err) {
      // Check for AI controller instead
      try {
        const aiController = require('../controllers/aiController');
        console.log('✅ AI controller found');
      } catch (err) {
        console.warn('⚠️  Neither AI directory nor AI controller found');
      }
    }
    
    // Check for AI components directory
    try {
      await fs.access(componentsDir);
      const files = await fs.readdir(componentsDir);
      if (files.length > 0) {
        console.log(`✅ AI components directory found with ${files.length} files`);
      } else {
        console.warn('⚠️  AI components directory is empty');
      }
    } catch (err) {
      console.warn('⚠️  AI components directory not found');
    }
  } catch (err) {
    console.error('❌ Error checking AI components:', err.message);
  }
}

/**
 * Run all checks
 */
async function runChecks() {
  console.log('🔍 Checking AI Agent Integration');

  try {
    // Check for AI config
    const aiConfigPath = path.join(__dirname, '..', 'config', 'ai.js');
    try {
      await fs.access(aiConfigPath);
      console.log('✅ AI configuration file exists');
      
      const aiConfig = await fs.readFile(aiConfigPath, 'utf8');
      
      // Check for API keys
      if (!aiConfig.includes('API_KEY') && !aiConfig.includes('OPENAI_API_KEY')) {
        console.warn('⚠️ AI configuration might be missing API keys');
      } else {
        console.log('✅ AI API key configuration detected');
      }
    } catch (err) {
      console.error('❌ AI configuration file not found');
      console.error('   Create an AI config at /config/ai.js');
    }
    
    // Check for AI service file
    const aiServicePath = path.join(__dirname, '..', 'services', 'aiService.js');
    try {
      await fs.access(aiServicePath);
      console.log('✅ AI service file exists');
      
      const aiService = await fs.readFile(aiServicePath, 'utf8');
      
      // Check for common AI libraries
      const hasLibrary = aiService.includes('openai') || 
                       aiService.includes('gpt-3') || 
                       aiService.includes('tensorflow') ||
                       aiService.includes('huggingface');
                         
      if (!hasLibrary) {
        console.warn('⚠️ No AI library detected in AI service');
        console.warn('   Consider integrating OpenAI, TensorFlow, or another AI library');
      } else {
        console.log('✅ AI library integration detected');
      }
      
      // Check for recommendation functions
      if (!aiService.includes('recommend') && !aiService.includes('suggestion')) {
        console.warn('⚠️ No nail style recommendation functionality detected');
        console.warn('   Consider adding recommendation features to the AI service');
      } else {
        console.log('✅ Nail style recommendation functionality detected');
      }
      
      // Check for AI prompt templates
      if (!aiService.includes('prompt') && !aiService.includes('template')) {
        console.warn('⚠️ No prompt templates detected');
        console.warn('   Consider adding structured prompts for consistent AI responses');
      } else {
        console.log('✅ AI prompt templates detected');
      }
      
      // Check for response processing
      if (!aiService.includes('process') && !aiService.includes('format')) {
        console.warn('⚠️ No response processing detected');
        console.warn('   Consider adding response formatting to improve user experience');
      } else {
        console.log('✅ AI response processing detected');
      }
    } catch (err) {
      console.error('❌ AI service file not found');
      console.error('   Create an AI service at /services/aiService.js');
    }
    
    // Check for AI routes
    const aiRoutesPath = path.join(__dirname, '..', 'routes', 'aiRoutes.js');
    try {
      await fs.access(aiRoutesPath);
      console.log('✅ AI routes file exists');
      
      const aiRoutes = await fs.readFile(aiRoutesPath, 'utf8');
      
      // Check for common AI endpoints
      const hasEndpoint = aiRoutes.includes('/ai') || 
                        aiRoutes.includes('/chat') || 
                        aiRoutes.includes('/bot');
                         
      if (!hasEndpoint) {
        console.warn('⚠️ No AI endpoint detected in AI routes');
        console.warn('   Consider adding AI endpoints to the routes');
      } else {
        console.log('✅ AI endpoint integration detected');
      }
    } catch (err) {
      console.error('❌ AI routes file not found');
      console.error('   Create AI routes at /routes/aiRoutes.js');
    }
    
    // Check for AI controller file
    const aiControllerPath = path.join(__dirname, '..', 'controllers', 'aiController.js');
    try {
      await fs.access(aiControllerPath);
      console.log('✅ AI controller file exists');
      
      const aiController = await fs.readFile(aiControllerPath, 'utf8');
      
      // Check for common AI functions
      const hasFunction = aiController.includes('handleRequest') || 
                        aiController.includes('processMessage') || 
                        aiController.includes('generateResponse');
                         
      if (!hasFunction) {
        console.warn('⚠️ No AI function detected in AI controller');
        console.warn('   Consider adding AI functions to the controller');
      } else {
        console.log('✅ AI function integration detected');
      }
    } catch (err) {
      console.error('❌ AI controller file not found');
      console.error('   Create an AI controller at /controllers/aiController.js');
    }
    
    // Check for frontend chat component
    const chatComponentPath = path.join(__dirname, '..', 'components', 'ChatBot.jsx');
    const altChatComponentPath = path.join(__dirname, '..', 'components', 'AIAssistant.jsx');
    
    try {
      let componentPath, componentContent;
      
      try {
        await fs.access(chatComponentPath);
        componentPath = chatComponentPath;
      } catch {
        await fs.access(altChatComponentPath);
        componentPath = altChatComponentPath;
      }
      
      componentContent = await fs.readFile(componentPath, 'utf8');
      console.log(`✅ Chat component found at ${path.basename(componentPath)}`);
      
      // Check for message history state
      if (componentContent.includes('useState') && 
          (componentContent.includes('messages') || componentContent.includes('history'))) {
        console.log('✅ Chat message history management detected');
      } else {
        console.warn('⚠️ No message history management detected in chat component');
      }
      
      // Check for API calls to backend
      if (componentContent.includes('fetch') || 
          componentContent.includes('axios') || 
          componentContent.includes('http')) {
        console.log('✅ API calls to backend detected in chat component');
      } else {
        console.warn('⚠️ No API calls detected in chat component');
      }
      
    } catch (err) {
      console.warn('⚠️ No chat component found');
      console.warn('   Consider creating a chat interface component for the AI assistant');
    }
    
    // Check for AI models or training data
    const aiModelsPath = path.join(__dirname, '..', 'ai', 'models');
    const aiDataPath = path.join(__dirname, '..', 'ai', 'data');
    let hasModelsOrData = false;
    
    try {
      await fs.access(aiModelsPath);
      const models = await fs.readdir(aiModelsPath);
      if (models.length > 0) {
        console.log(`✅ Found ${models.length} AI models`);
        hasModelsOrData = true;
      }
    } catch (err) {
      // Models directory not found, continue checking
    }
    
    try {
      await fs.access(aiDataPath);
      const data = await fs.readdir(aiDataPath);
      if (data.length > 0) {
        console.log(`✅ Found ${data.length} AI training data files`);
        hasModelsOrData = true;
      }
    } catch (err) {
      // Data directory not found
    }
    
    if (!hasModelsOrData) {
      console.warn('⚠️ No AI models or training data found');
      console.warn('   Consider adding local models or training data if not using an external API');
    }
    
    // Check environment variables for AI configuration
    try {
      const envPath = path.join(__dirname, '..', '.env');
      const envContent = await fs.readFile(envPath, 'utf8');
      
      if (envContent.includes('OPENAI_API_KEY') || 
          envContent.includes('AI_API_KEY') ||
          envContent.includes('GPT_API_KEY')) {
        console.log('✅ AI API key environment variables detected');
      } else {
        console.warn('⚠️ No AI API key environment variables detected');
      }
      
      if (envContent.includes('AI_MODEL') || 
          envContent.includes('GPT_MODEL') ||
          envContent.includes('MODEL_NAME')) {
        console.log('✅ AI model configuration environment variables detected');
      }
    } catch (err) {
      console.warn('⚠️ No .env file found or cannot be read');
    }
    
  } catch (err) {
    console.error('❌ Failed to check AI agent:', err.message);
  }
}

// Run checks only if called directly (not imported)
if (require.main === module) {
  runChecks().catch(err => {
    console.error('Error in AI agent check:', err);
    process.exit(1);
  });
}

module.exports = { runChecks };
