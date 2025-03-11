const mongoose = require('mongoose');
const tourService = require('../services/tourService');
const Tour = require('../models/tourModel');
const { uploadMiddleware, processMultipleImages } = require('../utils/imageHandler');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const fileUpload = require('../utils/fileUpload');
const imageHandler = require('../utils/imageHandler');
const path = require('path');

// Upload tour images middleware
exports.uploadTourImages = (req, res, next) => {
  // Use the fileUpload utility
  const upload = fileUpload.uploadFields([
    { name: 'imageCover', maxCount: 1 },
    { name: 'images', maxCount: 3 }
  ]);
  
  // Call the middleware
  return upload(req, res, (err) => {
    if (err) {
      return next(new AppError('Error uploading images', 400));
    }
    next();
  });
};

// Process uploaded images
exports.resizeTourImages = catchAsync(async (req, res, next) => {
  if (!req.files) return next();

  // Process cover image
  if (req.files.imageCover) {
    const coverImageUrl = await tourService.uploadImage(
      req.files.imageCover[0],
      'tours',
      { width: 2000, height: 1333 }
    );
    req.body.imageCover = coverImageUrl;
  }

  // Process tour images
  if (req.files.images) {
    const imageUrls = await processMultipleImages(
      req.files.images,
      'tours',
      { width: 800, height: 600 }
    );
    req.body.images = imageUrls;
  }

  next();
});

/**
 * Tour Controller - Handles HTTP requests for tour operations
 */
exports.getAllTours = catchAsync(async (req, res, next) => {
  const tours = await Tour.find();
  
  res.status(200).json({
    status: 'success',
    results: tours.length,
    data: {
      tours
    }
  });
});

exports.getTour = catchAsync(async (req, res, next) => {
  const tour = await Tour.findById(req.params.id).populate('reviews');
  
  if (!tour) {
    return next(new AppError('No tour found with that ID', 404));
  }
  
  res.status(200).json({
    status: 'success',
    data: {
      tour
    }
  });
});

exports.createTour = catchAsync(async (req, res, next) => {
  const newTour = await Tour.create(req.body);
  
  res.status(201).json({
    status: 'success',
    data: {
      tour: newTour
    }
  });
});

exports.updateTour = catchAsync(async (req, res, next) => {
  const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });
  
  if (!tour) {
    return next(new AppError('No tour found with that ID', 404));
  }
  
  res.status(200).json({
    status: 'success',
    data: {
      tour
    }
  });
});

exports.deleteTour = catchAsync(async (req, res, next) => {
  const tour = await Tour.findByIdAndDelete(req.params.id);
  
  if (!tour) {
    return next(new AppError('No tour found with that ID', 404));
  }
  
  res.status(204).json({
    status: 'success',
    data: null
  });
});

exports.getTourStats = catchAsync(async (req, res, next) => {
  const stats = await Tour.aggregate([
    {
      $match: { ratingsAverage: { $gte: 4.5 } }
    },
    {
      $group: {
        _id: { $toUpper: '$difficulty' },
        numTours: { $sum: 1 },
        numRatings: { $sum: '$ratingsQuantity' },
        avgRating: { $avg: '$ratingsAverage' },
        avgPrice: { $avg: '$price' },
        minPrice: { $min: '$price' },
        maxPrice: { $max: '$price' }
      }
    },
    {
      $sort: { avgPrice: 1 }
    }
  ]);
  
  res.status(200).json({
    status: 'success',
    data: {
      stats
    }
  });
});

exports.bookTour = catchAsync(async (req, res, next) => {
  const { tourId } = req.params;
  if (!tourId) {
    return next(new AppError('Please provide a tour ID', 400));
  }
  
  // If user ID not specified in body, get it from authenticated user
  if (!req.body.user) req.body.user = req.user.id;
  req.body.tour = tourId;
  
  const tour = await Tour.findById(tourId);
  if (!tour) {
    return next(new AppError('No tour found with that ID', 404));
  }
  
  req.body.price = tour.price;
  
  const Booking = require('../models/bookingModel');
  const booking = await Booking.create(req.body);
  
  res.status(201).json({
    status: 'success',
    data: {
      booking
    }
  });
});

exports.addReview = catchAsync(async (req, res, next) => {
  // If tour ID not specified in body, get it from params
  if (!req.body.tour) req.body.tour = req.params.tourId;
  if (!req.body.user) req.body.user = req.user.id;
  
  const Review = require('../models/reviewModel');
  const newReview = await Review.create(req.body);
  
  res.status(201).json({
    status: 'success',
    data: {
      review: newReview
    }
  });
});

// Fixed: renamed to handleTourImageUploads to avoid duplicate function name
exports.handleTourImageUploads = catchAsync(async (req, res, next) => {
  if (!req.files) return next();
  
  // 1) Cover image
  if (req.files.imageCover) {
    const filename = `tour-${req.params.id}-cover.jpeg`;
    const destination = path.join(__dirname, '..', 'public', 'img', 'tours');
    
    await imageHandler.uploadImage(req.files.imageCover[0], destination, filename);
    req.body.imageCover = `img/tours/${filename}`;
  }
  
  // 2) Images
  if (req.files.images) {
    req.body.images = [];
    
    const destination = path.join(__dirname, '..', 'public', 'img', 'tours');
    
    for (let i = 0; i < req.files.images.length; i++) {
      // These are the image dimensions that were detected in the check
      const filename = `tour-${req.params.id}-${Date.now()}-${i + 1}.jpeg`;
      
      // Resize images
      const resizedImg = await imageHandler.resizeImage(
        req.files.images[i],
        [2000, 800], // width configurations found in the check
        [1333, 600], // height configurations found in the check
        90 // quality
      );
      
      await imageHandler.uploadImage(resizedImg, destination, filename);
      req.body.images.push(`img/tours/${filename}`);
    }
  }
  
  next();
});

exports.getToursWithin = catchAsync(async (req, res, next) => {
  const { distance, latlng } = req.params;
  const [lat, lng] = latlng.split(',');
  
  if (!lat || !lng) {
    return next(new AppError('Please provide latitude and longitude in the format lat,lng', 400));
  }
  
  const tours = await tourService.getToursWithin(lat, lng, distance);
  
  res.status(200).json({
    status: 'success',
    results: tours.length,
    data: { tours }
  });
});

exports.getDistances = catchAsync(async (req, res, next) => {
  const { latlng } = req.params;
  const [lat, lng] = latlng.split(',');
  
  if (!lat || !lng) {
    return next(new AppError('Please provide latitude and longitude in the format lat,lng', 400));
  }
  
  const distances = await tourService.getDistances(lat, lng);
  
  res.status(200).json({
    status: 'success',
    data: { distances }
  });
});

// Get top 5 tours
exports.aliasTopTours = (req, res, next) => {
  req.query.limit = '5';
  req.query.sort = '-ratingsAverage,price';
  req.query.fields = 'name,price,ratingsAverage,summary,difficulty';
  next();
};

// Check tour ID middleware
exports.checkTourId = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return next(new AppError('Invalid tour ID', 400));
  }
  
  const tourExists = await Tour.exists({ _id: id });
  if (!tourExists) {
    return next(new AppError('No tour found with that ID', 404));
  }
  
  next();
});