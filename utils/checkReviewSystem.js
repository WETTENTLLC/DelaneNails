const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Review = require('../models/reviewModel');
const Tour = require('../models/tourModel');
const User = require('../models/userModel');
const fs = require('fs').promises;
const path = require('path');

// Load environment variables
dotenv.config({ path: './.env' });

/**
 * Check review model and relationships
 */
async function checkReviewModel() {
  console.log('⭐ CHECKING REVIEW SYSTEM...\n');
  console.log('Checking Review model...');
  
  // Check if Review model exists and has necessary fields
  try {
    const reviewSchema = Review.schema;
    const requiredFields = ['review', 'rating', 'tour', 'user', 'createdAt'];
    
    const missingFields = requiredFields.filter(field => !reviewSchema.paths[field]);
    
    if (missingFields.length === 0) {
      console.log('✅ Review model has all required fields');
    } else {
      console.error(`❌ Review model is missing fields: ${missingFields.join(', ')}`);
    }
    
    // Check references
    if (reviewSchema.paths.tour.instance === 'ObjectID' && 
        reviewSchema.paths.tour.options.ref === 'Tour') {
      console.log('✅ Review model has proper Tour reference');
    } else {
      console.error('❌ Review model has incorrect Tour reference');
    }
    
    if (reviewSchema.paths.user.instance === 'ObjectID' && 
        reviewSchema.paths.user.options.ref === 'User') {
      console.log('✅ Review model has proper User reference');
    } else {
      console.error('❌ Review model has incorrect User reference');
    }
    
    // Check rating validation
    if (reviewSchema.paths.rating.instance === 'Number' &&
        reviewSchema.paths.rating.options.min === 1 &&
        reviewSchema.paths.rating.options.max === 5) {
      console.log('✅ Review rating has proper validation (1-5 range)');
    } else {
      console.warn('⚠️  Review rating might not have proper validation');
    }
    
    // Check indexes
    const indexes = reviewSchema.indexes();
    if (indexes.some(idx => 
      idx[0].tour === 1 && idx[0].user === 1 && idx[1].unique === true)) {
      console.log('✅ Review model has unique compound index for tour and user');
    } else {
      console.warn('⚠️  Review model may not enforce one review per user-tour combination');
    }
    
    // Check rating calculation static method
    if (typeof Review.calcAverageRatings === 'function') {
      console.log('✅ Review model has calcAverageRatings static method');
    } else {
      console.error('❌ Review model is missing calcAverageRatings static method');
    }
    
    // Check middleware for calculating ratings
    if (reviewSchema.post && 
        (reviewSchema._post.some(post => post.name === 'save') || 
         reviewSchema._posts.some(post => post.name === 'save'))) {
      console.log('✅ Review model has post-save middleware (likely for calculating ratings)');
    } else {
      console.warn('⚠️  Review model may not update tour ratings after save');
    }
    
  } catch (err) {
    console.error('❌ Error checking Review model:', err.message);
  }
}

/**
 * Check if Tour has virtual populate for reviews
 */
async function checkTourVirtualPopulate() {
  console.log('\nChecking Tour model for review relationship...');
  
  try {
    const tourSchema = Tour.schema;
    
    // Check for virtual populate
    const virtuals = tourSchema.virtuals || {};
    const hasReviewsVirtual = virtuals.reviews && 
                             virtuals.reviews.options && 
                             virtuals.reviews.options.ref === 'Review';
    
    if (hasReviewsVirtual) {
      console.log('✅ Tour model has virtual populate for reviews');
    } else {
      console.warn('⚠️  Tour model may not have virtual populate for reviews');
    }
    
    // Check if schema has the fields that reviews will update
    if (tourSchema.paths.ratingsAverage && tourSchema.paths.ratingsQuantity) {
      console.log('✅ Tour model has ratings fields that reviews will update');
    } else {
      console.error('❌ Tour model is missing ratings fields that reviews should update');
    }
  
  } catch (err) {
    console.error('❌ Error checking Tour model for review relationship:', err.message);
  }
}

/**
 * Check review service and controller
 */
async function checkReviewFunctionality() {
  console.log('\nChecking Review functionality...');
  
  // Check review service
  try {
    let reviewService;
    try {
      reviewService = require('../services/reviewService');
      console.log('✅ Review service found');
    } catch (err) {
      console.warn('⚠️  No separate review service found, checking tour service for review functions');
      
      const tourService = require('../services/tourService');
      if (typeof tourService.addReview === 'function') {
        console.log('✅ Tour service has addReview function');
        reviewService = { exists: false };
      } else {
        console.error('❌ No review functionality found in tour service');
        return;
      }
    }
    
    // Check review controller if service exists
    try {
      const reviewController = require('../controllers/reviewController');
      console.log('✅ Review controller found');
      
      const requiredMethods = [
        'createReview',
        'getReview',
        'getAllReviews',
        'updateReview',
        'deleteReview'
      ];
      
      const missingMethods = requiredMethods.filter(method => !reviewController[method]);
      
      if (missingMethods.length === 0) {
        console.log('✅ Review controller has all standard CRUD methods');
      } else {
        console.warn(`⚠️  Review controller is missing methods: ${missingMethods.join(', ')}`);
      }
      
    } catch (err) {
      if (!reviewService.exists) {
        console.warn('⚠️  No separate review controller found, reviews may be handled through tour controller');
        
        try {
          const tourController = require('../controllers/tourController');
          if (typeof tourController.addReview === 'function') {
            console.log('✅ Tour controller has addReview function');
          } else {
            console.error('❌ No review functionality found in tour controller');
          }
        } catch (e) {
          console.error('❌ Error checking tour controller:', e.message);
        }
      } else {
        console.error('❌ Error checking Review controller:', err.message);
      }
    }
    
  } catch (err) {
    console.error('❌ Error checking Review functionality:', err.message);
  }
}

/**
 * Check review routes
 */
async function checkReviewRoutes() {
  console.log('\nChecking Review routes...');
  
  try {
    // First check if there's a dedicated review router
    try {
      const reviewRouter = require('../routes/reviewRoutes');
      console.log('✅ Dedicated review routes found');
      return;
    } catch (err) {
      console.warn('⚠️  No dedicated review routes found, checking tour routes for review endpoints');
    }
    
    // Check if review endpoints are in tour routes
    try {
      const tourRouter = require('../routes/tourRoutes');
      const routerStack = tourRouter.stack || [];
      
      // Check if there are routes with 'review' in the path
      const hasReviewRoutes = routerStack.some(layer => 
        layer.route && layer.route.path && layer.route.path.includes('review'));
      
      if (hasReviewRoutes) {
        console.log('✅ Review endpoints found in tour routes');
      } else {
        console.warn('⚠️  No review endpoints found in tour routes');
      }
      
    } catch (err) {
      console.error('❌ Error checking routes for review endpoints:', err.message);
    }
    
  } catch (err) {
    console.error('❌ Error checking Review routes:', err.message);
  }
}

/**
 * Checks the customer review system components
 */
async function runChecks() {
  console.log('🔍 Checking Review System');

  try {
    // Check for review model
    const modelPath = path.join(__dirname, '..', 'models', 'reviewModel.js');
    try {
      await fs.access(modelPath);
      console.log('✅ Review model file exists');
      
      // Check model content for essential fields
      const modelContent = await fs.readFile(modelPath, 'utf8');
      const requiredFields = ['user', 'rating', 'review', 'createdAt'];
      const missingFields = [];
      
      for (const field of requiredFields) {
        if (!modelContent.includes(field)) {
          missingFields.push(field);
        }
      }
      
      if (missingFields.length > 0) {
        console.warn(`⚠️ Review model might be missing fields: ${missingFields.join(', ')}`);
      }
      
      // Check for rating validation
      if (!modelContent.includes('min') || !modelContent.includes('max')) {
        console.warn('⚠️ Review model might be missing rating validation');
      }
    } catch (err) {
      console.error('❌ Review model file not found');
      console.error('   Create a model file at /models/reviewModel.js');
    }
    
    // Check for review controller
    const controllerPath = path.join(__dirname, '..', 'controllers', 'reviewController.js');
    try {
      await fs.access(controllerPath);
      console.log('✅ Review controller file exists');
      
      // Check controller content for essential functions
      const controllerContent = await fs.readFile(controllerPath, 'utf8');
      const requiredFunctions = ['createReview', 'getReview', 'getAllReviews', 'updateReview', 'deleteReview'];
      const missingFunctions = [];
      
      for (const func of requiredFunctions) {
        if (!controllerContent.includes(func)) {
          missingFunctions.push(func);
        }
      }
      
      if (missingFunctions.length > 0) {
        console.warn(`⚠️ Review controller might be missing functions: ${missingFunctions.join(', ')}`);
      }
    } catch (err) {
      console.error('❌ Review controller file not found');
      console.error('   Create a controller file at /controllers/reviewController.js');
    }
    
    // Check for review routes
    const routesPath = path.join(__dirname, '..', 'routes', 'reviewRoutes.js');
    try {
      await fs.access(routesPath);
      console.log('✅ Review routes file exists');
    } catch (err) {
      console.error('❌ Review routes file not found');
      console.error('   Create a routes file at /routes/reviewRoutes.js');
    }
    
    // Check for frontend review components
    const reviewComponentPath = path.join(__dirname, '..', 'components', 'ReviewSystem.jsx');
    try {
      await fs.access(reviewComponentPath);
      console.log('✅ Review component file exists');
    } catch (err) {
      console.warn('⚠️ Review component file not found');
      console.warn('   Create a component file at /components/ReviewSystem.jsx');
    }
  } catch (err) {
    console.error('❌ Failed to check review system:', err.message);
  }
}

module.exports = { runChecks };

// Run checks only if called directly (not imported)
if (require.main === module) {
  runChecks().catch(err => {
    console.error('Error in review system check:', err);
    process.exit(1);
  });
}

module.exports = { runChecks };
