const checkTourDependencies = require('./checkTourDependencies');
const checkAuthSystem = require('./checkAuthSystem');
const checkBookingSystem = require('./checkBookingSystem');
const checkReviewSystem = require('./checkReviewSystem');
const checkErrorAndSecurity = require('./checkErrorAndSecurity');
const checkImageHandling = require('./checkImageHandling');
const checkDatabaseConnection = require('./checkDatabaseConnection');
const checkAIAgent = require('./checkAIAgent');
const fs = require('fs').promises;
const path = require('path');

/**
 * Run all system check utilities
 */
async function runAllChecks() {
  console.log('🔍 RUNNING COMPREHENSIVE SYSTEM CHECK\n');
  const startTime = Date.now();
  
  const results = {
    tourDependencies: { passed: false, warnings: 0, errors: 0 },
    authSystem: { passed: false, warnings: 0, errors: 0 },
    bookingSystem: { passed: false, warnings: 0, errors: 0 },
    reviewSystem: { passed: false, warnings: 0, errors: 0 },
    errorAndSecurity: { passed: false, warnings: 0, errors: 0 },
    imageHandling: { passed: false, warnings: 0, errors: 0 },
    databaseConnection: { passed: false, warnings: 0, errors: 0 },
    aiAgent: { passed: false, warnings: 0, errors: 0 }
  };
  
  // Check if all dependencies are installed
  try {
    const missingDeps = [];
    
    try { require('mongoose'); } catch (err) { missingDeps.push('mongoose'); }
    try { require('bcryptjs'); } catch (err) { missingDeps.push('bcryptjs'); }
    try { require('jsonwebtoken'); } catch (err) { missingDeps.push('jsonwebtoken'); }
    try { require('slugify'); } catch (err) { missingDeps.push('slugify'); }
    
    if (missingDeps.length > 0) {
      console.error('❌ Missing dependencies detected: ' + missingDeps.join(', '));
      console.error('   Please run: npm run setup');
      console.error('   This will install all necessary dependencies for the system checks.');
      console.error('   After installation, you can run this check again.');
      
      return {
        allPassed: false,
        totalErrors: missingDeps.length,
        totalWarnings: 0,
        results
      };
    }
  } catch (err) {
    console.error('❌ Error checking dependencies:', err.message);
    return {
      allPassed: false,
      totalErrors: 1,
      totalWarnings: 0,
      results
    };
  }
  
  // Intercept console methods to count warnings and errors
  const originalConsoleWarn = console.warn;
  const originalConsoleError = console.error;
  
  function createInterceptor(component, type) {
    return function(message) {
      if(type === 'warn') {
        results[component].warnings++;
        originalConsoleWarn.apply(console, arguments);
      } else if(type === 'error') {
        results[component].errors++;
        originalConsoleError.apply(console, arguments);
      }
    };
  }
  
  // Run each check with proper console interception
  try {
    // Tour dependencies check
    console.warn = createInterceptor('tourDependencies', 'warn');
    console.error = createInterceptor('tourDependencies', 'error');
    await checkTourDependencies.runChecks();
    results.tourDependencies.passed = results.tourDependencies.errors === 0;
    
    console.log('\n' + '-'.repeat(80) + '\n');
    
    // Auth system check
    console.warn = createInterceptor('authSystem', 'warn');
    console.error = createInterceptor('authSystem', 'error');
    await checkAuthSystem.runChecks();
    results.authSystem.passed = results.authSystem.errors === 0;
    
    console.log('\n' + '-'.repeat(80) + '\n');
    
    // Booking system check
    console.warn = createInterceptor('bookingSystem', 'warn');
    console.error = createInterceptor('bookingSystem', 'error');
    await checkBookingSystem.runChecks();
    results.bookingSystem.passed = results.bookingSystem.errors === 0;
    
    console.log('\n' + '-'.repeat(80) + '\n');
    
    // Review system check
    console.warn = createInterceptor('reviewSystem', 'warn');
    console.error = createInterceptor('reviewSystem', 'error');
    await checkReviewSystem.runChecks();
    results.reviewSystem.passed = results.reviewSystem.errors === 0;
    
    console.log('\n' + '-'.repeat(80) + '\n');
    
    // Error and security check
    console.warn = createInterceptor('errorAndSecurity', 'warn');
    console.error = createInterceptor('errorAndSecurity', 'error');
    await checkErrorAndSecurity.runChecks();
    results.errorAndSecurity.passed = results.errorAndSecurity.errors === 0;
    
    console.log('\n' + '-'.repeat(80) + '\n');
    
    // Image handling check
    console.warn = createInterceptor('imageHandling', 'warn');
    console.error = createInterceptor('imageHandling', 'error');
    await checkImageHandling.runChecks();
    results.imageHandling.passed = results.imageHandling.errors === 0;
    
    console.log('\n' + '-'.repeat(80) + '\n');
    
    // Database connection check
    console.warn = createInterceptor('databaseConnection', 'warn');
    console.error = createInterceptor('databaseConnection', 'error');
    await checkDatabaseConnection.runChecks();
    results.databaseConnection.passed = results.databaseConnection.errors === 0;
    
    console.log('\n' + '-'.repeat(80) + '\n');
    
    // AI Agent check
    console.warn = createInterceptor('aiAgent', 'warn');
    console.error = createInterceptor('aiAgent', 'error');
    await checkAIAgent.runChecks();
    results.aiAgent.passed = results.aiAgent.errors === 0;
    
  } finally {
    // Restore original console methods
    console.warn = originalConsoleWarn;
    console.error = originalConsoleError;
  }
  
  // Generate summary
  const endTime = Date.now();
  const duration = (endTime - startTime) / 1000;
  
  console.log('\n' + '='.repeat(80));
  console.log(`\n📊 SYSTEM CHECK SUMMARY (Completed in ${duration.toFixed(1)}s)\n`);
  
  let allPassed = true;
  let totalWarnings = 0;
  let totalErrors = 0;
  
  for (const [component, result] of Object.entries(results)) {
    const status = result.passed ? '✅ PASS' : '❌ FAIL';
    console.log(`${status} | ${component}: ${result.errors} errors, ${result.warnings} warnings`);
    
    if (!result.passed) {
      allPassed = false;
    }
    
    totalWarnings += result.warnings;
    totalErrors += result.errors;
  }
  
  console.log('\n' + '-'.repeat(80));
  console.log(`OVERALL STATUS: ${allPassed ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`Total Issues: ${totalErrors} errors, ${totalWarnings} warnings`);
  console.log('='.repeat(80) + '\n');
  
  // Generate report file
  try {
    const reportDir = path.join(__dirname, '..', 'reports');
    const reportFile = path.join(reportDir, `system-check-${new Date().toISOString().split('T')[0]}.json`);
    
    // Ensure reports directory exists
    try {
      await fs.access(reportDir);
    } catch {
      await fs.mkdir(reportDir, { recursive: true });
    }
    
    // Write report
    await fs.writeFile(
      reportFile,
      JSON.stringify({
        timestamp: new Date().toISOString(),
        duration,
        allPassed,
        totalErrors,
        totalWarnings,
        componentResults: results
      }, null, 2)
    );
    
    console.log(`Report saved to: ${reportFile}`);
  } catch (err) {
    console.error(`Failed to save report: ${err.message}`);
  }
  
  return {
    allPassed,
    totalErrors,
    totalWarnings,
    results
  };
}

// Run checks only if called directly (not imported)
if (require.main === module) {
  runAllChecks().catch(err => {
    console.error('Error in system check:', err);
    process.exit(1);
  });
}

module.exports = { runAllChecks };