/**
 * NailAide Debug and Test System
 */

class NailAideDebugger {
  constructor() {
    this.testResults = {};
    this.init();
  }

  init() {
    console.log('🔧 NailAide Debugger initialized');
    this.runDiagnostics();
  }

  async runDiagnostics() {
    console.log('🔍 Running comprehensive diagnostics...');
    
    // Test 1: Check if Gemini API key is valid format
    this.testApiKeyFormat();
    
    // Test 2: Test Gemini API connection
    await this.testGeminiConnection();
    
    // Test 3: Check WebsiteContent loading
    this.testWebsiteContent();
    
    // Test 4: Test CORS and network issues
    await this.testNetworkConnectivity();
    
    // Test 5: Check browser console for errors
    this.checkConsoleErrors();
    
    this.displayResults();
  }

  testApiKeyFormat() {
    const apiKey = 'AIzaSyCr913ppyEgYL0k47gLye1YTiL9lD1SH_0';
    const isValidFormat = apiKey.startsWith('AIzaSy') && apiKey.length === 39;
    
    this.testResults.apiKeyFormat = {
      passed: isValidFormat,
      message: isValidFormat ? 'API key format is correct' : 'API key format is invalid',
      details: `Key length: ${apiKey.length}, Expected: 39`
    };
    
    console.log('✅ API Key Format:', this.testResults.apiKeyFormat);
  }

  async testGeminiConnection() {
    const apiKey = 'AIzaSyCr913ppyEgYL0k47gLye1YTiL9lD1SH_0';
    const url = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent';
    
    try {
      const testPayload = {
        contents: [{
          parts: [{
            text: 'Hello, this is a test message. Please respond with "Test successful".'
          }]
        }]
      };

      console.log('🔗 Testing Gemini API connection...');
      console.log('URL:', `${url}?key=${apiKey.substring(0, 10)}...`);
      console.log('Payload:', testPayload);

      const response = await fetch(`${url}?key=${apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(testPayload)
      });

      console.log('📡 Response status:', response.status);
      console.log('📡 Response headers:', [...response.headers.entries()]);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ API Error Response:', errorText);
        
        this.testResults.geminiConnection = {
          passed: false,
          message: `API request failed with status ${response.status}`,
          details: errorText,
          status: response.status
        };
        return;
      }

      const data = await response.json();
      console.log('✅ API Response:', data);

      this.testResults.geminiConnection = {
        passed: true,
        message: 'Gemini API connection successful',
        details: data.candidates?.[0]?.content?.parts?.[0]?.text || 'No response text'
      };

    } catch (error) {
      console.error('❌ Network/CORS Error:', error);
      
      this.testResults.geminiConnection = {
        passed: false,
        message: 'Network or CORS error',
        details: error.message,
        error: error
      };
    }
  }

  testWebsiteContent() {
    const hasWebsiteContent = typeof window.WebsiteContent !== 'undefined';
    let contentData = null;
    
    if (hasWebsiteContent) {
      try {
        contentData = window.WebsiteContent.getContent();
      } catch (error) {
        console.error('Error getting website content:', error);
      }
    }

    this.testResults.websiteContent = {
      passed: hasWebsiteContent && contentData !== null,
      message: hasWebsiteContent ? 'WebsiteContent loaded successfully' : 'WebsiteContent not found',
      details: contentData ? `Services: ${contentData.services?.length || 0}, Business info available: ${!!contentData.business}` : 'No content data'
    };

    console.log('📄 Website Content Test:', this.testResults.websiteContent);
  }

  async testNetworkConnectivity() {
    try {
      // Test basic connectivity to Google
      const testResponse = await fetch('https://www.google.com', { 
        method: 'HEAD', 
        mode: 'no-cors' 
      });
      
      this.testResults.networkConnectivity = {
        passed: true,
        message: 'Basic network connectivity working'
      };
    } catch (error) {
      this.testResults.networkConnectivity = {
        passed: false,
        message: 'Network connectivity issues detected',
        details: error.message
      };
    }

    console.log('🌐 Network Test:', this.testResults.networkConnectivity);
  }

  checkConsoleErrors() {
    // Override console.error to capture errors
    const originalError = console.error;
    const errors = [];
    
    console.error = function(...args) {
      errors.push(args.join(' '));
      originalError.apply(console, args);
    };

    // Restore after a short delay
    setTimeout(() => {
      console.error = originalError;
    }, 1000);

    this.testResults.consoleErrors = {
      passed: errors.length === 0,
      message: errors.length === 0 ? 'No console errors detected' : `${errors.length} console errors found`,
      details: errors
    };
  }

  displayResults() {
    console.log('\n🔍 DIAGNOSTIC RESULTS:');
    console.log('========================');
    
    Object.entries(this.testResults).forEach(([test, result]) => {
      const status = result.passed ? '✅ PASS' : '❌ FAIL';
      console.log(`${status} ${test}: ${result.message}`);
      if (result.details) {
        console.log(`   Details: ${result.details}`);
      }
    });

    // Provide specific recommendations
    this.provideRecommendations();
  }

  provideRecommendations() {
    console.log('\n💡 RECOMMENDATIONS:');
    console.log('===================');

    if (!this.testResults.geminiConnection?.passed) {
      console.log('🔧 Gemini API Issues:');
      if (this.testResults.geminiConnection?.status === 403) {
        console.log('   - API key may be invalid or restricted');
        console.log('   - Check API key permissions in Google AI Studio');
      } else if (this.testResults.geminiConnection?.status === 429) {
        console.log('   - Rate limit exceeded, try again later');
      } else if (this.testResults.geminiConnection?.error?.name === 'TypeError') {
        console.log('   - CORS or network connectivity issue');
        console.log('   - API may be blocked by browser security policies');
      }
    }

    if (!this.testResults.websiteContent?.passed) {
      console.log('🔧 Website Content Issues:');
      console.log('   - WebsiteContent module not loading properly');
      console.log('   - Check script loading order');
    }
  }
}

// Auto-run diagnostics when loaded
document.addEventListener('DOMContentLoaded', () => {
  setTimeout(() => {
    new NailAideDebugger();
  }, 2000); // Wait for other scripts to load
});