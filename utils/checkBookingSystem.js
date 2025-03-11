const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Booking = require('../models/bookingModel');
const Tour = require('../models/tourModel');
const User = require('../models/userModel');
const fs = require('fs').promises;
const path = require('path');

// Load environment variables
dotenv.config({ path: './.env' });

/**
 * Check booking model and relationships
 */
async function checkBookingModel() {
  console.log('🎟️  CHECKING BOOKING SYSTEM...\n');
  console.log('Checking Booking model...');
  
  // Check if Booking model exists and has necessary fields
  try {
    const bookingSchema = Booking.schema;
    const requiredFields = ['tour', 'user', 'price', 'date', 'status'];
    
    const missingFields = requiredFields.filter(field => !bookingSchema.paths[field]);
    
    if (missingFields.length === 0) {
      console.log('✅ Booking model has all required fields');
    } else {
      console.error(`❌ Booking model is missing fields: ${missingFields.join(', ')}`);
    }
    
    // Check references
    if (bookingSchema.paths.tour.instance === 'ObjectID' && 
        bookingSchema.paths.tour.options.ref === 'Tour') {
      console.log('✅ Booking model has proper Tour reference');
    } else {
      console.error('❌ Booking model has incorrect Tour reference');
    }
    
    if (bookingSchema.paths.user.instance === 'ObjectID' && 
        bookingSchema.paths.user.options.ref === 'User') {
      console.log('✅ Booking model has proper User reference');
    } else {
      console.error('❌ Booking model has incorrect User reference');
    }
    
    // Check indexes
    const indexes = bookingSchema.indexes();
    if (indexes.some(idx => 
      idx[0].tour === 1 && idx[0].user === 1 && idx[1].unique === true)) {
      console.log('✅ Booking model has unique compound index for tour and user');
    } else {
      console.warn('⚠️  Booking model may not enforce unique bookings per user-tour combination');
    }
    
  } catch (err) {
    console.error('❌ Error checking Booking model:', err.message);
  }
}

/**
 * Check booking service and controller
 */
async function checkBookingFunctionality() {
  console.log('\nChecking Booking functionality...');
  
  // Check booking service
  try {
    let bookingService;
    try {
      bookingService = require('../services/bookingService');
      console.log('✅ Booking service found');
    } catch (err) {
      console.warn('⚠️  No separate booking service found, checking tour service for booking functions');
      
      const tourService = require('../services/tourService');
      if (typeof tourService.bookTour === 'function') {
        console.log('✅ Tour service has bookTour function');
        bookingService = { exists: false };
      } else {
        console.error('❌ No booking functionality found in tour service');
        return;
      }
    }
    
    // Check booking controller if service exists
    try {
      const bookingController = require('../controllers/bookingController');
      console.log('✅ Booking controller found');
      
      const requiredMethods = [
        'createBooking',
        'getBooking',
        'getAllBookings',
        'updateBooking',
        'deleteBooking'
      ];
      
      const missingMethods = requiredMethods.filter(method => !bookingController[method]);
      
      if (missingMethods.length === 0) {
        console.log('✅ Booking controller has all standard CRUD methods');
      } else {
        console.warn(`⚠️  Booking controller is missing methods: ${missingMethods.join(', ')}`);
      }
      
    } catch (err) {
      if (!bookingService.exists) {
        console.warn('⚠️  No separate booking controller found, booking may be handled through tour controller');
        
        try {
          const tourController = require('../controllers/tourController');
          if (typeof tourController.bookTour === 'function') {
            console.log('✅ Tour controller has bookTour function');
          } else {
            console.error('❌ No booking functionality found in tour controller');
          }
        } catch (e) {
          console.error('❌ Error checking tour controller:', e.message);
        }
      } else {
        console.error('❌ Error checking Booking controller:', err.message);
      }
    }
    
  } catch (err) {
    console.error('❌ Error checking Booking functionality:', err.message);
  }
}

/**
 * Check booking routes
 */
async function checkBookingRoutes() {
  console.log('\nChecking Booking routes...');
  
  try {
    // First check if there's a dedicated booking router
    try {
      const bookingRouter = require('../routes/bookingRoutes');
      console.log('✅ Dedicated booking routes found');
      return;
    } catch (err) {
      console.warn('⚠️  No dedicated booking routes found, checking tour routes for booking endpoints');
    }
    
    // Check if booking endpoints are in tour routes
    try {
      const tourRouter = require('../routes/tourRoutes');
      const routerStack = tourRouter.stack || [];
      
      // Check if there are routes with 'booking' in the path
      const hasBookingRoutes = routerStack.some(layer => 
        layer.route && layer.route.path && layer.route.path.includes('booking'));
      
      if (hasBookingRoutes) {
        console.log('✅ Booking endpoints found in tour routes');
      } else {
        console.warn('⚠️  No booking endpoints found in tour routes');
      }
      
    } catch (err) {
      console.error('❌ Error checking routes for booking endpoints:', err.message);
    }
    
  } catch (err) {
    console.error('❌ Error checking Booking routes:', err.message);
  }
}

/**
 * Checks the nail appointment booking system components
 */
async function runChecks() {
  console.log('🔍 Checking Booking System');

  try {
    // Check for booking model
    const modelPath = path.join(__dirname, '..', 'models', 'bookingModel.js');
    try {
      await fs.access(modelPath);
      console.log('✅ Booking model file exists');
      
      // Check model content for essential fields
      const modelContent = await fs.readFile(modelPath, 'utf8');
      const requiredFields = ['user', 'service', 'date', 'time', 'price'];
      const missingFields = [];
      
      for (const field of requiredFields) {
        if (!modelContent.includes(field)) {
          missingFields.push(field);
        }
      }
      
      if (missingFields.length > 0) {
        console.warn(`⚠️ Booking model might be missing fields: ${missingFields.join(', ')}`);
      }
    } catch (err) {
      console.error('❌ Booking model file not found');
      console.error('   Create a model file at /models/bookingModel.js');
    }
    
    // Check for booking controller
    const controllerPath = path.join(__dirname, '..', 'controllers', 'bookingController.js');
    try {
      await fs.access(controllerPath);
      console.log('✅ Booking controller file exists');
      
      // Check controller content for essential functions
      const controllerContent = await fs.readFile(controllerPath, 'utf8');
      const requiredFunctions = ['createBooking', 'getBooking', 'getAllBookings', 'updateBooking', 'deleteBooking'];
      const missingFunctions = [];
      
      for (const func of requiredFunctions) {
        if (!controllerContent.includes(func)) {
          missingFunctions.push(func);
        }
      }
      
      if (missingFunctions.length > 0) {
        console.warn(`⚠️ Booking controller might be missing functions: ${missingFunctions.join(', ')}`);
      }
      
      // Check for availability checking logic
      if (!controllerContent.includes('checkAvailability') && 
          !controllerContent.includes('isTimeSlotAvailable')) {
        console.warn('⚠️ Booking controller might be missing availability checking functionality');
      }
    } catch (err) {
      console.error('❌ Booking controller file not found');
      console.error('   Create a controller file at /controllers/bookingController.js');
    }
    
    // Check for booking routes
    const routesPath = path.join(__dirname, '..', 'routes', 'bookingRoutes.js');
    try {
      await fs.access(routesPath);
      console.log('✅ Booking routes file exists');
    } catch (err) {
      console.error('❌ Booking routes file not found');
      console.error('   Create a routes file at /routes/bookingRoutes.js');
    }
    
    // Check for service model (needed for bookings)
    const serviceModelPath = path.join(__dirname, '..', 'models', 'serviceModel.js');
    try {
      await fs.access(serviceModelPath);
      console.log('✅ Service model file exists (required for booking system)');
    } catch (err) {
      console.warn('⚠️ Service model file not found');
      console.warn('   Create a model file at /models/serviceModel.js for nail service definitions');
    }
  } catch (err) {
    console.error('❌ Failed to check booking system:', err.message);
  }
}

async function checkBookingModels() {
  console.log('  Checking booking models...');
  // Implementation here
}

async function checkCalendarIntegration() {
  console.log('  Checking calendar integration...');
  // Implementation here
}

module.exports = { runChecks };
