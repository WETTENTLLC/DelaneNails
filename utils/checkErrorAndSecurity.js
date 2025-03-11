const fs = require('fs').promises;
const path = require('path');

/**
 * Checks error handling and security components
 */
async function runChecks() {
  console.log('🔍 Checking Error Handling and Security');

  try {
    // Check for global error handler
    const errorHandlerPath = path.join(__dirname, '..', 'utils', 'errorHandler.js');
    try {
      await fs.access(errorHandlerPath);
      console.log('✅ Global error handler file exists');
    } catch (err) {
      console.error('❌ Global error handler file not found');
      console.error('   Create an error handler at /utils/errorHandler.js');
    }
    
    // Check for rate limiting
    const packageJsonPath = path.join(__dirname, '..', 'package.json');
    try {
      const packageJson = JSON.parse(await fs.readFile(packageJsonPath, 'utf8'));
      const hasRateLimit = packageJson.dependencies && 
        (packageJson.dependencies['express-rate-limit'] || 
         packageJson.dependencies['rate-limiter-flexible']);
      
      if (!hasRateLimit) {
        console.warn('⚠️ No rate limiting package detected');
        console.warn('   Consider adding express-rate-limit to protect against brute-force attacks');
      } else {
        console.log('✅ Rate limiting package installed');
      }
    } catch (err) {
      console.error('❌ Could not check for rate limiting packages');
    }
    
    // Check for security headers middleware
    const appFile = path.join(__dirname, '..', 'app.js');
    try {
      const appContent = await fs.readFile(appFile, 'utf8');
      
      // Check for helmet usage
      const hasHelmet = appContent.includes('helmet') || 
                        appContent.includes('xss-clean') || 
                        appContent.includes('hpp');
      
      if (!hasHelmet) {
        console.warn('⚠️ No security headers middleware detected');
        console.warn('   Consider adding helmet to set security headers');
      } else {
        console.log('✅ Security headers middleware detected');
      }
      
      // Check for CORS configuration
      if (!appContent.includes('cors')) {
        console.warn('⚠️ No CORS configuration detected');
        console.warn('   Consider adding CORS middleware for API security');
      } else {
        console.log('✅ CORS middleware detected');
      }
      
      // Check for data sanitization
      if (!appContent.includes('sanitize') && !appContent.includes('xss')) {
        console.warn('⚠️ No data sanitization detected');
        console.warn('   Consider adding express-mongo-sanitize and xss-clean');
      } else {
        console.log('✅ Data sanitization middleware detected');
      }
    } catch (err) {
      console.error('❌ Could not check app.js for security middleware');
    }
    
    // Check for environment variables
    const envPath = path.join(__dirname, '..', '.env');
    const envExamplePath = path.join(__dirname, '..', '.env.example');
    
    try {
      await fs.access(envPath);
      console.log('✅ Environment variables file exists');
      
      // Check if .env is in .gitignore
      const gitignorePath = path.join(__dirname, '..', '.gitignore');
      try {
        const gitignoreContent = await fs.readFile(gitignorePath, 'utf8');
        if (!gitignoreContent.includes('.env')) {
          console.error('❌ .env file is not in .gitignore');
          console.error('   Add .env to your .gitignore file to prevent exposing sensitive data');
        } else {
          console.log('✅ .env file is properly gitignored');
        }
      } catch {
        console.warn('⚠️ No .gitignore file found');
      }
    } catch (err) {
      console.error('❌ No .env file found');
      
      try {
        await fs.access(envExamplePath);
        console.warn('⚠️ Only .env.example found, but no actual .env file');
        console.warn('   Create a .env file based on the example');
      } catch {
        console.error('❌ No .env or .env.example file found');
        console.error('   Create environment files for configuration');
      }
    }
  } catch (err) {
    console.error('❌ Failed to check error handling and security:', err.message);
  }
}

module.exports = { runChecks };