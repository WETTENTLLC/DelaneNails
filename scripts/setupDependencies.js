const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

/**
 * Setup script to install all required dependencies
 */
function setupDependencies() {
  console.log('🔧 SETTING UP DEPENDENCIES\n');
  
  // Check if package.json exists
  const packageJsonPath = path.join(__dirname, '..', 'package.json');
  if (!fs.existsSync(packageJsonPath)) {
    console.error('❌ package.json not found. Please run this script from the project root.');
    process.exit(1);
  }
  
  // Install dependencies
  try {
    console.log('Installing dependencies...');
    execSync('npm install', { stdio: 'inherit' });
    console.log('\n✅ Dependencies installed successfully!');
  } catch (error) {
    console.error('\n❌ Error installing dependencies:', error.message);
    process.exit(1);
  }

  console.log('\nSetup completed! You can now run checks with:');
  console.log('  npm run check:all   - Run all system checks');
  console.log('  npm run check:ai    - Run AI system checks');
}

// Run the setup
setupDependencies();
