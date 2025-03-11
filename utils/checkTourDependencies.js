/**
 * Utility script to check that all dependencies for the tour functionality work properly.
 * Run this with: node utils/checkTourDependencies.js
 */
const mongoose = require('mongoose');
const fs = require('fs').promises;
const path = require('path');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config({ path: './.env' });

// Check that required models exist
async function checkModels() {
  console.log('Checking required models...');
  
  const requiredModels = [
    { path: '../models/tourModel.js', name: 'Tour' },
    { path: '../models/reviewModel.js', name: 'Review' },
    { path: '../models/bookingModel.js', name: 'Booking' },
    { path: '../models/userModel.js', name: 'User' }
  ];
  
  for (const model of requiredModels) {
    try {
      const modelModule = require(model.path);
      if (!modelModule) {
        console.error(`❌ Model ${model.name} not properly exported`);
        continue;
      }
      console.log(`✅ Model ${model.name} found`);
    } catch (err) {
      console.error(`❌ Model ${model.name} not found: ${err.message}`);
    }
  }
}

// Check that utility files exist
async function checkUtilities() {
  console.log('\nChecking utility files...');
  
  const requiredUtils = [
    { path: '../utils/appError.js', name: 'AppError' },
    { path: '../utils/catchAsync.js', name: 'catchAsync' },
    { path: '../utils/imageHandler.js', name: 'imageHandler' },
    { path: '../utils/fileUpload.js', name: 'fileUpload' }
  ];
  
  for (const util of requiredUtils) {
    try {
      const utilModule = require(util.path);
      if (!utilModule) {
        console.error(`❌ Utility ${util.name} not properly exported`);
        continue;
      }
      console.log(`✅ Utility ${util.name} found`);
    } catch (err) {
      console.error(`❌ Utility ${util.name} not found: ${err.message}`);
    }
  }
}

// Check for required middleware
async function checkMiddleware() {
  console.log('\nChecking middleware...');
  
  const requiredMiddleware = [
    { path: '../middleware/authMiddleware.js', name: 'authMiddleware' }
  ];
  
  for (const middleware of requiredMiddleware) {
    try {
      const middlewareModule = require(middleware.path);
      if (!middlewareModule) {
        console.error(`❌ Middleware ${middleware.name} not properly exported`);
        continue;
      }
      console.log(`✅ Middleware ${middleware.name} found`);
      
      // Check for required methods
      if (middlewareModule.protect) {
        console.log(`  ✅ protect method found in ${middleware.name}`);
      } else {
        console.error(`  ❌ protect method not found in ${middleware.name}`);
      }
      
      if (middlewareModule.restrictTo) {
        console.log(`  ✅ restrictTo method found in ${middleware.name}`);
      } else {
        console.error(`  ❌ restrictTo method not found in ${middleware.name}`);
      }
    } catch (err) {
      console.error(`❌ Middleware ${middleware.name} not found: ${err.message}`);
    }
  }
}

// Check if controllers and routes are properly set up
async function checkControllerAndRoutes() {
  console.log('\nChecking controllers and routes...');
  
  try {
    const tourController = require('../controllers/tourController');
    console.log('✅ Tour controller found');
    
    // Check for essential controller methods
    const requiredMethods = [
      'getAllTours', 'getTour', 'createTour', 'updateTour', 
      'deleteTour', 'getTourStats', 'handleTourImageUploads'
    ];
    
    for (const method of requiredMethods) {
      if (tourController[method]) {
        console.log(`  ✅ ${method} method found in controller`);
      } else {
        console.error(`  ❌ ${method} method not found in controller`);
      }
    }
  } catch (err) {
    console.error(`❌ Tour controller not found: ${err.message}`);
  }
  
  try {
    const tourRoutes = require('../routes/tourRoutes');
    console.log('✅ Tour routes found');
  } catch (err) {
    console.error(`❌ Tour routes not found: ${err.message}`);
  }
}

// Check database configuration
async function checkDatabaseConnection() {
  console.log('\nChecking database connection...');
  
  if (!process.env.DATABASE) {
    console.error('❌ DATABASE environment variable not set');
    return;
  }
  
  try {
    await mongoose.connect(process.env.DATABASE, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    
    console.log('✅ Database connection successful');
    
    // Check that models can be instantiated
    const Tour = require('../models/tourModel');
    const tour = new Tour({
      name: 'Test Tour',
      duration: 5,
      maxGroupSize: 10,
      difficulty: 'easy',
      price: 497,
      summary: 'Test tour summary',
      description: 'Test tour description'
    });
    
    console.log('✅ Tour model can be instantiated');
    
    await mongoose.disconnect();
    console.log('✅ Database disconnected');
  } catch (err) {
    console.error(`❌ Database connection failed: ${err.message}`);
  }
}

// Check image upload directories
async function checkImageDirectories() {
  console.log('\nChecking image directories...');
  
  const directories = [
    { path: path.join(__dirname, '..', 'public'), name: 'public' },
    { path: path.join(__dirname, '..', 'public', 'img'), name: 'public/img' },
    { path: path.join(__dirname, '..', 'public', 'img', 'tours'), name: 'public/img/tours' }
  ];
  
  for (const dir of directories) {
    try {
      await fs.access(dir.path);
      console.log(`✅ Directory ${dir.name} exists`);
    } catch (err) {
      console.error(`❌ Directory ${dir.name} does not exist or is not accessible`);
      // Create the directory
      try {
        await fs.mkdir(dir.path, { recursive: true });
        console.log(`  ✅ Created directory ${dir.name}`);
      } catch (mkdirErr) {
        console.error(`  ❌ Failed to create directory ${dir.name}: ${mkdirErr.message}`);
      }
    }
  }
}

/**
 * Check for tour system dependencies and configurations
 */

async function runChecks() {
  console.log('🔍 Checking tour dependencies...');
  
  try {
    await checkModels();
    await checkUtilities();
    await checkMiddleware();
    await checkControllerAndRoutes();
    await checkDatabaseConnection();
    await checkImageDirectories();
    
    console.log('✅ Tour dependencies check completed');
  } catch (error) {
    console.error('❌ Error during tour dependencies check:', error.message);
    console.error(error);
  }
}

async function checkRequiredPackages() {
  console.log('  Checking required packages...');
  // Implementation here
}

async function checkConfigFiles() {
  console.log('  Checking configuration files...');
  // Implementation here
}

async function checkTourFunctionality() {
  console.log('  Checking tour functionality...');
  // Implementation here
}

module.exports = { runChecks };

// Execute the checks
runChecks().catch(err => {
  console.error('Error during dependency check:', err);
  process.exit(1);
});

const fs = require('fs').promises;
const path = require('path');

/**
 * Checks if all dependencies for the salon tour feature are available
 */
async function runChecks() {
  console.log('🔍 Checking Tour Dependencies');

  try {
    // Check if tour-related packages are installed in package.json
    const packageJsonPath = path.join(__dirname, '..', 'package.json');
    const packageData = JSON.parse(await fs.readFile(packageJsonPath, 'utf8'));
    
    const requiredPackages = ['three', 'pannellum', 'react-360-view'];
    const missingPackages = [];
    
    for (const pkg of requiredPackages) {
      if (!(packageData.dependencies && packageData.dependencies[pkg]) && 
          !(packageData.devDependencies && packageData.devDependencies[pkg])) {
        missingPackages.push(pkg);
      }
    }
    
    if (missingPackages.length > 0) {
      console.error(`❌ Missing tour dependencies: ${missingPackages.join(', ')}`);
      console.error('   These packages are required for the salon virtual tour feature');
    } else {
      console.log('✅ All tour dependencies are installed');
    }
    
    // Check if tour content files exist
    const tourContentPath = path.join(__dirname, '..', 'public', 'tour');
    try {
      await fs.access(tourContentPath);
      console.log('✅ Tour content directory exists');
      
      // Check for panoramic images
      const panoramicFiles = await fs.readdir(tourContentPath);
      const hasPanoramic = panoramicFiles.some(file => file.endsWith('.jpg') || file.endsWith('.png'));
      
      if (!hasPanoramic) {
        console.warn('⚠️ No panoramic images found in tour directory');
      } else {
        console.log('✅ Panoramic images found');
      }
    } catch (err) {
      console.error('❌ Tour content directory not found');
      console.error('   Create a directory at /public/tour/ with panoramic images');
    }
  } catch (err) {
    console.error('❌ Failed to check tour dependencies:', err.message);
  }
}

module.exports = { runChecks };
