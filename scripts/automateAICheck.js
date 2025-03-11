const { runAllChecks } = require('../utils/runAllChecks');
const fs = require('fs').promises;
const path = require('path');
const dotenv = require('dotenv');
const axios = require('axios'); // You might need to install this: npm install axios

// Load environment variables
dotenv.config();

/**
 * Runs a comprehensive AI system check and reports results
 */
async function runAISystemCheck() {
  console.log('🤖 STARTING AUTOMATED AI SYSTEM CHECK\n');

  // Step 1: Run the full system check
  console.log('Running full system check...');
  const systemCheckResults = await runAllChecks();

  // Step 2: Focus on AI-related results
  const aiResults = systemCheckResults.results.aiAgent;
  
  console.log('\n=================================================');
  console.log(`AI AGENT CHECK RESULTS: ${aiResults.passed ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`Issues: ${aiResults.errors} errors, ${aiResults.warnings} warnings`);
  console.log('=================================================\n');

  // Step 3: Perform additional AI-specific tests
  console.log('Performing additional AI-specific tests...');
  const aiTestResults = await runAIFunctionalTests();

  // Step 4: Generate detailed AI report
  const reportPath = await generateAIReport(systemCheckResults, aiTestResults);
  console.log(`\n✅ Detailed AI report saved to: ${reportPath}`);
  
  return {
    systemCheck: systemCheckResults,
    aiTests: aiTestResults,
    reportPath
  };
}

/**
 * Run functional tests on the AI components
 */
async function runAIFunctionalTests() {
  console.log('\n🧪 RUNNING AI FUNCTIONAL TESTS');
  const results = {
    apiConnectivity: { status: 'unknown', message: '' },
    endpointResponsiveness: { status: 'unknown', message: '' },
    responseQuality: { status: 'unknown', message: '' }
  };

  // Test 1: Check API connectivity to OpenAI or other AI provider
  try {
    console.log('Testing AI API connectivity...');
    if (!process.env.OPENAI_API_KEY && 
        !process.env.ANTHROPIC_API_KEY && 
        !process.env.COHERE_API_KEY) {
      results.apiConnectivity.status = 'skipped';
      results.apiConnectivity.message = 'No AI API keys found in environment variables';
      console.log('⚠️ Test skipped: No AI API keys found');
    } else {
      // Check if we have an AI service
      try {
        const aiService = require('../services/aiService');
        const testResponse = await aiService.checkConnectivity();
        results.apiConnectivity.status = 'passed';
        results.apiConnectivity.message = 'Successfully connected to AI API';
        console.log('✅ AI API connectivity test passed');
      } catch (err) {
        results.apiConnectivity.status = 'warning';
        results.apiConnectivity.message = `Error checking AI service: ${err.message}`;
        console.log('⚠️ Could not test AI service directly, trying simple API check');
        
        // If no service exists, try a direct basic check with OpenAI if available
        if (process.env.OPENAI_API_KEY) {
          try {
            const response = await axios.get('https://api.openai.com/v1/models', {
              headers: {
                'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
              }
            });
            
            if (response.status === 200) {
              results.apiConnectivity.status = 'passed';
              results.apiConnectivity.message = 'Successfully connected to OpenAI API';
              console.log('✅ OpenAI API connectivity test passed');
            }
          } catch (apiErr) {
            results.apiConnectivity.status = 'failed';
            results.apiConnectivity.message = `Failed to connect to OpenAI API: ${apiErr.message}`;
            console.log('❌ OpenAI API connectivity test failed');
          }
        }
      }
    }
  } catch (err) {
    results.apiConnectivity.status = 'failed';
    results.apiConnectivity.message = `Unexpected error: ${err.message}`;
    console.log('❌ AI API connectivity test failed with unexpected error');
  }

  // Test 2: Check AI endpoints if they exist
  try {
    console.log('\nTesting AI endpoints responsiveness...');
    
    // Try to find the AI routes file to determine endpoints
    let aiEndpoint = '/api/ai/chat'; // Default fallback endpoint
    let aiPort = process.env.PORT || 3000;
    let hasEndpoints = false;
    
    try {
      const routesPath = path.join(__dirname, '..', 'routes');
      const files = await fs.readdir(routesPath);
      
      const aiRouteFile = files.find(file => 
        file.includes('ai') || file.includes('chat') || file.includes('bot')
      );
      
      if (aiRouteFile) {
        const routeContent = await fs.readFile(path.join(routesPath, aiRouteFile), 'utf-8');
        const routeMatches = routeContent.match(/'\/([^']+)'/g) || routeContent.match(/"\/([^"]+)"/g);
        
        if (routeMatches && routeMatches.length > 0) {
          // Extract first endpoint found
          aiEndpoint = routeMatches[0].replace(/['"]/g, '');
          hasEndpoints = true;
        }
      }
    } catch (err) {
      console.log('⚠️ Could not determine AI endpoints from route files');
    }
    
    if (hasEndpoints) {
      try {
        // Check if server is running locally
        const response = await axios.get(`http://localhost:${aiPort}/health-check`, { 
          timeout: 3000 
        });
        
        if (response.status === 200) {
          results.endpointResponsiveness.status = 'info';
          results.endpointResponsiveness.message = 'Server is running. You can manually test AI endpoint: ' + aiEndpoint;
          console.log(`ℹ️ Server is running. You can test AI endpoint: ${aiEndpoint}`);
        }
      } catch (err) {
        results.endpointResponsiveness.status = 'skipped';
        results.endpointResponsiveness.message = 'Server does not appear to be running. Start the server to test endpoints.';
        console.log('ℹ️ Server does not appear to be running. Start the server to test endpoints.');
      }
    } else {
      results.endpointResponsiveness.status = 'skipped';
      results.endpointResponsiveness.message = 'No AI endpoints determined from routes';
      console.log('⚠️ Could not determine AI endpoints for testing');
    }
  } catch (err) {
    results.endpointResponsiveness.status = 'error';
    results.endpointResponsiveness.message = `Error: ${err.message}`;
    console.log(`❌ Error testing endpoints: ${err.message}`);
  }

  // Test 3: Check AI response quality with a simple test prompt
  try {
    console.log('\nTesting AI response quality...');
    
    try {
      const aiService = require('../services/aiService');
      
      if (typeof aiService.generateResponse === 'function') {
        const testPrompt = "What services does Delane Nails offer?";
        const response = await aiService.generateResponse(testPrompt);
        
        // Check for a meaningful response (more than 20 characters)
        if (response && response.length > 20) {
          results.responseQuality.status = 'passed';
          results.responseQuality.message = 'AI generated a meaningful response';
          console.log('✅ AI response quality test passed');
        } else {
          results.responseQuality.status = 'warning';
          results.responseQuality.message = 'AI response was too short or empty';
          console.log('⚠️ AI response was too short or empty');
        }
      } else {
        results.responseQuality.status = 'skipped';
        results.responseQuality.message = 'AI service does not have generateResponse method';
        console.log('⚠️ AI service does not have generateResponse method');
      }
    } catch (err) {
      results.responseQuality.status = 'skipped';
      results.responseQuality.message = `Error accessing AI service: ${err.message}`;
      console.log(`⚠️ Could not test AI response quality: ${err.message}`);
    }
  } catch (err) {
    results.responseQuality.status = 'error';
    results.responseQuality.message = `Unexpected error: ${err.message}`;
    console.log(`❌ Error testing AI response quality: ${err.message}`);
  }

  return results;
}

/**
 * Generate a detailed AI report
 */
async function generateAIReport(systemCheckResults, aiTestResults) {
  const reportDir = path.join(__dirname, '..', 'reports');
  const timestamp = new Date().toISOString().split('T')[0];
  const reportFile = path.join(reportDir, `ai-check-${timestamp}.json`);
  
  // Ensure reports directory exists
  try {
    await fs.access(reportDir);
  } catch {
    await fs.mkdir(reportDir, { recursive: true });
  }
  
  // Create report object
  const report = {
    timestamp: new Date().toISOString(),
    systemCheck: {
      allPassed: systemCheckResults.allPassed,
      aiAgentStatus: systemCheckResults.results.aiAgent.passed ? 'PASS' : 'FAIL',
      aiAgentErrors: systemCheckResults.results.aiAgent.errors,
      aiAgentWarnings: systemCheckResults.results.aiAgent.warnings
    },
    functionalTests: aiTestResults,
    recommendations: []
  };
  
  // Add recommendations based on test results
  if (aiTestResults.apiConnectivity.status === 'failed') {
    report.recommendations.push(
      'Check your AI API keys and ensure they are correctly set in environment variables.'
    );
  }
  
  if (aiTestResults.apiConnectivity.status === 'skipped') {
    report.recommendations.push(
      'Add appropriate AI API keys to your .env file to enable AI functionality.'
    );
  }
  
  if (aiTestResults.endpointResponsiveness.status === 'skipped') {
    report.recommendations.push(
      'Create proper AI endpoints in your API routes for client applications to access AI functionality.'
    );
  }
  
  if (aiTestResults.responseQuality.status === 'warning' || 
      aiTestResults.responseQuality.status === 'skipped') {
    report.recommendations.push(
      'Implement or improve the AI service with a proper generateResponse method.'
    );
  }
  
  // Write report to file
  await fs.writeFile(reportFile, JSON.stringify(report, null, 2));
  
  return reportFile;
}

// Run the automated check
if (require.main === module) {
  runAISystemCheck().catch(err => {
    console.error('Error during automated AI check:', err);
    process.exit(1);
  });
}

module.exports = { runAISystemCheck };
