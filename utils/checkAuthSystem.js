const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
const { promisify } = require('util');
const User = require('../models/userModel');
const fs = require('fs').promises;
const path = require('path');

// Load environment variables
dotenv.config({ path: './.env' });

/**
 * Check authentication system components
 */
async function checkAuthComponents() {
  console.log('🔐 CHECKING AUTHENTICATION SYSTEM...\n');
  
  // Check JWT secret
  console.log('Checking JWT configuration...');
  if (!process.env.JWT_SECRET) {
    console.error('❌ JWT_SECRET environment variable is missing');
  } else if (process.env.JWT_SECRET.length < 32) {
    console.warn('⚠️  JWT_SECRET should be at least 32 characters for security');
  } else {
    console.log('✅ JWT_SECRET is properly configured');
  }

  if (!process.env.JWT_EXPIRES_IN) {
    console.warn('⚠️  JWT_EXPIRES_IN environment variable is missing, tokens will not expire');
  } else {
    console.log('✅ JWT_EXPIRES_IN is set to', process.env.JWT_EXPIRES_IN);
  }
  
  // Check password hashing
  console.log('\nChecking password hashing functionality...');
  try {
    const testPassword = 'password123';
    const hashedPassword = await bcrypt.hash(testPassword, 12);
    const isPasswordCorrect = await bcrypt.compare(testPassword, hashedPassword);
    
    if (isPasswordCorrect) {
      console.log('✅ Password hashing and comparison working correctly');
    } else {
      console.error('❌ Password comparison failed');
    }
  } catch (err) {
    console.error('❌ Error during password hashing test:', err.message);
  }
  
  // Check token generation and verification
  console.log('\nChecking JWT token functionality...');
  try {
    const payload = { id: 'test-user-id' };
    const token = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN || '90d'
    });
    
    if (!token) {
      console.error('❌ JWT token generation failed');
    } else {
      console.log('✅ JWT token generation successful');
      
      const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
      if (decoded.id === payload.id) {
        console.log('✅ JWT token verification successful');
      } else {
        console.error('❌ JWT token verification failed');
      }
    }
  } catch (err) {
    console.error('❌ Error during JWT test:', err.message);
  }
}

/**
 * Check user model and methods
 */
async function checkUserModel() {
  console.log('\nChecking User model...');
  
  // Check if User model exists and has necessary fields
  try {
    const userSchema = User.schema;
    const requiredFields = ['name', 'email', 'password', 'role'];
    
    const missingFields = requiredFields.filter(field => !userSchema.paths[field]);
    
    if (missingFields.length === 0) {
      console.log('✅ User model has all required fields');
    } else {
      console.error(`❌ User model is missing fields: ${missingFields.join(', ')}`);
    }
    
    // Check if password hashing middleware exists
    if (userSchema._pre && userSchema._pre.some(pre => pre.name === 'save')) {
      console.log('✅ User model has pre-save middleware (likely for password hashing)');
    } else {
      console.warn('⚠️  User model may not have pre-save middleware for password hashing');
    }
    
    // Create test user instance to check instance methods
    const testUser = new User({
      name: 'Test User',
      email: 'test@example.com',
      password: 'password123'
    });
    
    if (typeof testUser.correctPassword === 'function') {
      console.log('✅ User model has correctPassword instance method');
    } else {
      console.error('❌ User model is missing correctPassword instance method');
    }
    
    if (typeof testUser.changedPasswordAfter === 'function') {
      console.log('✅ User model has changedPasswordAfter instance method');
    } else {
      console.error('❌ User model is missing changedPasswordAfter instance method');
    }
    
    if (typeof testUser.createPasswordResetToken === 'function') {
      console.log('✅ User model has createPasswordResetToken instance method');
    } else {
      console.warn('⚠️  User model is missing createPasswordResetToken instance method');
    }
    
  } catch (err) {
    console.error('❌ Error checking User model:', err.message);
  }
}

/**
 * Check auth controller
 */
async function checkAuthController() {
  console.log('\nChecking Auth Controller...');
  
  try {
    const authController = require('../controllers/authController');
    
    const requiredMethods = [
      'signup',
      'login',
      'logout',
      'protect',
      'restrictTo',
      'forgotPassword',
      'resetPassword',
      'updatePassword'
    ];
    
    const missingMethods = requiredMethods.filter(method => !authController[method]);
    
    if (missingMethods.length === 0) {
      console.log('✅ Auth Controller has all required methods');
    } else {
      console.error(`❌ Auth Controller is missing methods: ${missingMethods.join(', ')}`);
    }
    
  } catch (err) {
    console.error('❌ Error checking Auth Controller:', err.message);
  }
}

/**
 * Checks authentication system components
 */
async function runChecks() {
  console.log('🔍 Checking Authentication System');

  try {
    // Check for auth configuration
    const configPath = path.join(__dirname, '..', 'config', 'auth.js');
    try {
      await fs.access(configPath);
      console.log('✅ Auth configuration file exists');
      
      // Simple content check
      const configContent = await fs.readFile(configPath, 'utf8');
      if (!configContent.includes('JWT_SECRET') || 
          !configContent.includes('JWT_EXPIRES_IN')) {
        console.warn('⚠️ Auth config might be missing important JWT settings');
      }
    } catch (err) {
      console.error('❌ Auth configuration file not found');
      console.error('   Create a config file at /config/auth.js');
    }
    
    // Check for auth model
    const modelPath = path.join(__dirname, '..', 'models', 'userModel.js');
    try {
      await fs.access(modelPath);
      console.log('✅ User model file exists');
      
      // Check model content for essential authentication methods
      const modelContent = await fs.readFile(modelPath, 'utf8');
      if (!modelContent.includes('correctPassword') || 
          !modelContent.includes('bcrypt')) {
        console.warn('⚠️ User model might be missing password comparison functionality');
      }
      
      if (!modelContent.includes('changedPasswordAfter')) {
        console.warn('⚠️ User model might be missing password change tracking');
      }
    } catch (err) {
      console.error('❌ User model file not found');
      console.error('   Create a model file at /models/userModel.js');
    }
    
    // Check for auth controllers
    const authControllerPath = path.join(__dirname, '..', 'controllers', 'authController.js');
    try {
      await fs.access(authControllerPath);
      console.log('✅ Auth controller file exists');
      
      // Check controller content for essential authentication functions
      const controllerContent = await fs.readFile(authControllerPath, 'utf8');
      const requiredFunctions = ['login', 'signup', 'protect', 'forgotPassword', 'resetPassword'];
      const missingFunctions = [];
      
      for (const func of requiredFunctions) {
        if (!controllerContent.includes(func)) {
          missingFunctions.push(func);
        }
      }
      
      if (missingFunctions.length > 0) {
        console.warn(`⚠️ Auth controller might be missing functions: ${missingFunctions.join(', ')}`);
      }
    } catch (err) {
      console.error('❌ Auth controller file not found');
      console.error('   Create a controller file at /controllers/authController.js');
    }
  } catch (err) {
    console.error('❌ Failed to check auth system:', err.message);
  }
}

// Run checks only if called directly (not imported)
if (require.main === module) {
  runChecks().catch(err => {
    console.error('Error in auth system check:', err);
    process.exit(1);
  });
}

module.exports = { runChecks };
