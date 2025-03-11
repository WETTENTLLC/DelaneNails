const Tour = require('../models/tourModel');
const Booking = require('../models/bookingModel');
const Review = require('../models/reviewModel');
const AppError = require('../utils/appError');
const { uploadImage, deleteImage } = require('../utils/imageHandler');
const mongoose = require('mongoose');

/**
 * Tour Service - Handles all tour-related operations
 */
class TourService {
  /**
   * Create a new tour
   * @param {Object} tourData - Tour information
   * @returns {Promise<Tour>} Created tour
   */
  async createTour(tourData) {
    try {
      // Validate required fields
      if (!tourData.name || !tourData.duration || !tourData.description) {
        throw new AppError('Missing required tour information', 400);
      }

      // Create new tour
      const tour = await Tour.create(tourData);
      return tour;
    } catch (error) {
      if (error.name === 'ValidationError') {
        throw new AppError(`Validation error: ${error.message}`, 400);
      }
      throw error;
    }
  }

  /**
   * Get all tours with filtering, sorting, and pagination
   * @param {Object} queryParams - Query parameters for filtering, sorting, etc.
   * @returns {Promise<Array>} List of tours
   */
  async getTours(queryParams) {
    try {
      // Build query
      const queryObj = { ...queryParams };
      const excludedFields = ['page', 'sort', 'limit', 'fields'];
      excludedFields.forEach(field => delete queryObj[field]);

      // Advanced filtering
      let queryStr = JSON.stringify(queryObj);
      queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, match => `$${match}`);
      
      let query = Tour.find(JSON.parse(queryStr));

      // Sorting
      if (queryParams.sort) {
        const sortBy = queryParams.sort.split(',').join(' ');
        query = query.sort(sortBy);
      } else {
        query = query.sort('-createdAt');
      }

      // Field limiting
      if (queryParams.fields) {
        const fields = queryParams.fields.split(',').join(' ');
        query = query.select(fields);
      } else {
        query = query.select('-__v');
      }

      // Pagination
      const page = parseInt(queryParams.page) || 1;
      const limit = parseInt(queryParams.limit) || 10;
      const skip = (page - 1) * limit;
      query = query.skip(skip).limit(limit);

      const tours = await query;
      return tours;
    } catch (error) {
      throw new AppError(`Error retrieving tours: ${error.message}`, 500);
    }
  }

  /**
   * Get a single tour by ID
   * @param {string} tourId - Tour ID
   * @returns {Promise<Tour>} Tour object
   */
  async getTourById(tourId) {
    try {
      if (!mongoose.Types.ObjectId.isValid(tourId)) {
        throw new AppError('Invalid tour ID', 400);
      }

      const tour = await Tour.findById(tourId).populate({
        path: 'reviews',
        select: 'review rating user'
      });

      if (!tour) {
        throw new AppError('Tour not found', 404);
      }

      return tour;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Update a tour
   * @param {string} tourId - Tour ID
   * @param {Object} updateData - Data to update
   * @returns {Promise<Tour>} Updated tour
   */
  async updateTour(tourId, updateData) {
    try {
      if (!mongoose.Types.ObjectId.isValid(tourId)) {
        throw new AppError('Invalid tour ID', 400);
      }

      const tour = await Tour.findByIdAndUpdate(tourId, updateData, {
        new: true,
        runValidators: true
      });

      if (!tour) {
        throw new AppError('Tour not found', 404);
      }

      return tour;
    } catch (error) {
      if (error.name === 'ValidationError') {
        throw new AppError(`Validation error: ${error.message}`, 400);
      }
      throw error;
    }
  }

  /**
   * Delete a tour
   * @param {string} tourId - Tour ID
   * @returns {Promise<void>}
   */
  async deleteTour(tourId) {
    try {
      if (!mongoose.Types.ObjectId.isValid(tourId)) {
        throw new AppError('Invalid tour ID', 400);
      }

      const tour = await Tour.findById(tourId);
      
      if (!tour) {
        throw new AppError('Tour not found', 404);
      }

      // Delete associated images
      if (tour.images && tour.images.length > 0) {
        for (const image of tour.images) {
          await deleteImage(image);
        }
      }

      // Delete the tour
      await Tour.findByIdAndDelete(tourId);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get tour statistics
   * @returns {Promise<Array>} Tour statistics
   */
  async getTourStats() {
    try {
      const stats = await Tour.aggregate([
        {
          $match: { ratingsAverage: { $gte: 4 } }
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

      return stats;
    } catch (error) {
      throw new AppError(`Error getting tour statistics: ${error.message}`, 500);
    }
  }

  /**
   * Book a tour
   * @param {string} tourId - Tour ID
   * @param {string} userId - User ID
   * @param {Object} bookingData - Booking details
   * @returns {Promise<Booking>} Created booking
   */
  async bookTour(tourId, userId, bookingData) {
    try {
      if (!mongoose.Types.ObjectId.isValid(tourId) || !mongoose.Types.ObjectId.isValid(userId)) {
        throw new AppError('Invalid tour or user ID', 400);
      }

      // Check if tour exists
      const tour = await Tour.findById(tourId);
      if (!tour) {
        throw new AppError('Tour not found', 404);
      }

      // Create booking
      const booking = await Booking.create({
        tour: tourId,
        user: userId,
        price: tour.price,
        date: bookingData.date,
        participants: bookingData.participants || 1,
        ...bookingData
      });

      return booking;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Add a review to a tour
   * @param {string} tourId - Tour ID
   * @param {string} userId - User ID
   * @param {Object} reviewData - Review details
   * @returns {Promise<Review>} Created review
   */
  async addReview(tourId, userId, reviewData) {
    try {
      if (!mongoose.Types.ObjectId.isValid(tourId) || !mongoose.Types.ObjectId.isValid(userId)) {
        throw new AppError('Invalid tour or user ID', 400);
      }

      // Check if user has booked this tour
      const hasBooked = await Booking.exists({ tour: tourId, user: userId });
      if (!hasBooked) {
        throw new AppError('You can only review tours you have booked', 403);
      }

      // Create review
      const review = await Review.create({
        tour: tourId,
        user: userId,
        review: reviewData.review,
        rating: reviewData.rating
      });

      return review;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Upload tour images
   * @param {string} tourId - Tour ID
   * @param {Array} files - Image files
   * @returns {Promise<Tour>} Updated tour
   */
  async uploadTourImages(tourId, files) {
    try {
      if (!mongoose.Types.ObjectId.isValid(tourId)) {
        throw new AppError('Invalid tour ID', 400);
      }

      if (!files || files.length === 0) {
        throw new AppError('No images provided', 400);
      }

      const tour = await Tour.findById(tourId);
      if (!tour) {
        throw new AppError('Tour not found', 404);
      }

      const uploadPromises = files.map(file => uploadImage(file, 'tours'));
      const imageUrls = await Promise.all(uploadPromises);

      tour.images = [...(tour.images || []), ...imageUrls];
      await tour.save();

      return tour;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Find tours near location
   * @param {number} latitude - Latitude
   * @param {number} longitude - Longitude
   * @param {number} distance - Distance in kilometers
   * @returns {Promise<Array>} List of tours
   */
  async getToursWithin(latitude, longitude, distance) {
    try {
      const radius = distance / 6378.1; // Convert km to radians

      if (!latitude || !longitude) {
        throw new AppError('Please provide latitude and longitude', 400);
      }

      const tours = await Tour.find({
        startLocation: {
          $geoWithin: {
            $centerSphere: [[longitude, latitude], radius]
          }
        }
      });

      return tours;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Calculate distances to tours from point
   * @param {number} latitude - Latitude
   * @param {number} longitude - Longitude
   * @returns {Promise<Array>} Tours with distances
   */
  async getDistances(latitude, longitude) {
    try {
      if (!latitude || !longitude) {
        throw new AppError('Please provide latitude and longitude', 400);
      }

      const distances = await Tour.aggregate([
        {
          $geoNear: {
            near: {
              type: 'Point',
              coordinates: [parseFloat(longitude), parseFloat(latitude)]
            },
            distanceField: 'distance',
            distanceMultiplier: 0.001 // Convert meters to kilometers
          }
        },
        {
          $project: {
            distance: 1,
            name: 1
          }
        }
      ]);

      return distances;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = new TourService();
