const mongoose = require('mongoose');
const tourService = require('../../services/tourService');
const Tour = require('../../models/tourModel');
const Booking = require('../../models/bookingModel');
const Review = require('../../models/reviewModel');
const AppError = require('../../utils/appError');
const imageHandler = require('../../utils/imageHandler');

// Mock the models and dependencies
jest.mock('../../models/tourModel');
jest.mock('../../models/bookingModel');
jest.mock('../../models/reviewModel');
jest.mock('../../utils/imageHandler');

describe('Tour Service Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  
  describe('createTour', () => {
    it('should create a tour with valid data', async () => {
      const tourData = {
        name: 'Test Tour',
        duration: 5,
        maxGroupSize: 10,
        difficulty: 'easy',
        price: 497,
        summary: 'Test tour summary',
        description: 'Test tour description'
      };
      
      const expectedTour = { ...tourData, _id: 'tour123' };
      
      Tour.create.mockResolvedValue(expectedTour);
      
      const result = await tourService.createTour(tourData);
      
      expect(Tour.create).toHaveBeenCalledWith(tourData);
      expect(result).toEqual(expectedTour);
    });
    
    it('should throw an error if required fields are missing', async () => {
      const invalidTourData = {
        name: 'Incomplete Tour'
      };
      
      const validationError = new mongoose.Error.ValidationError();
      validationError.name = 'ValidationError';
      validationError.message = 'Tour validation failed';
      
      Tour.create.mockRejectedValue(validationError);
      
      await expect(tourService.createTour(invalidTourData)).rejects.toThrow(AppError);
    });
  });
  
  describe('getTours', () => {
    it('should apply filters correctly', async () => {
      const queryParams = { price: { gte: '100' }, difficulty: 'easy' };
      
      const mockQuery = {
        find: jest.fn().mockReturnThis(),
        sort: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockResolvedValue([{ name: 'Test Tour', price: 100 }])
      };
      
      Tour.find = jest.fn().mockReturnValue(mockQuery);
      
      await tourService.getTours(queryParams);
      
      expect(Tour.find).toHaveBeenCalledWith(expect.objectContaining({
        price: { $gte: '100' },
        difficulty: 'easy'
      }));
    });
    
    it('should apply sorting correctly', async () => {
      const queryParams = { sort: 'price,-ratingsAverage' };
      
      const mockQuery = {
        find: jest.fn().mockReturnThis(),
        sort: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockResolvedValue([{ name: 'Test Tour', price: 100 }])
      };
      
      Tour.find = jest.fn().mockReturnValue(mockQuery);
      
      await tourService.getTours(queryParams);
      
      expect(mockQuery.sort).toHaveBeenCalledWith('price -ratingsAverage');
    });
    
    it('should apply field limiting correctly', async () => {
      const queryParams = { fields: 'name,price,duration' };
      
      const mockQuery = {
        find: jest.fn().mockReturnThis(),
        sort: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockResolvedValue([{ name: 'Test Tour', price: 100 }])
      };
      
      Tour.find = jest.fn().mockReturnValue(mockQuery);
      
      await tourService.getTours(queryParams);
      
      expect(mockQuery.select).toHaveBeenCalledWith('name price duration');
    });
    
    it('should apply pagination correctly', async () => {
      const queryParams = { page: '2', limit: '10' };
      
      const mockQuery = {
        find: jest.fn().mockReturnThis(),
        sort: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockResolvedValue([{ name: 'Test Tour', price: 100 }])
      };
      
      Tour.find = jest.fn().mockReturnValue(mockQuery);
      
      await tourService.getTours(queryParams);
      
      expect(mockQuery.skip).toHaveBeenCalledWith(10); // (page-1) * limit
      expect(mockQuery.limit).toHaveBeenCalledWith(10);
    });
  });
  
  describe('getTourById', () => {
    it('should get a tour by ID', async () => {
      const tourId = 'valid-tour-id';
      const expectedTour = { _id: tourId, name: 'Test Tour' };
      
      const mockPopulateMethod = jest.fn().mockResolvedValue(expectedTour);
      Tour.findById = jest.fn().mockReturnValue({
        populate: mockPopulateMethod
      });
      
      mongoose.Types.ObjectId.isValid = jest.fn().mockReturnValue(true);
      
      const result = await tourService.getTourById(tourId);
      
      expect(Tour.findById).toHaveBeenCalledWith(tourId);
      expect(result).toEqual(expectedTour);
    });
    
    it('should throw error for invalid tour ID', async () => {
      const invalidTourId = 'invalid-id';
      
      mongoose.Types.ObjectId.isValid = jest.fn().mockReturnValue(false);
      
      await expect(tourService.getTourById(invalidTourId)).rejects.toThrow(AppError);
    });
    
    it('should throw error if tour not found', async () => {
      const tourId = 'non-existent-tour-id';
      
      const mockPopulateMethod = jest.fn().mockResolvedValue(null);
      Tour.findById = jest.fn().mockReturnValue({
        populate: mockPopulateMethod
      });
      
      mongoose.Types.ObjectId.isValid = jest.fn().mockReturnValue(true);
      
      await expect(tourService.getTourById(tourId)).rejects.toThrow(AppError);
    });
  });
  
  describe('updateTour', () => {
    it('should update a tour successfully', async () => {
      const tourId = 'valid-tour-id';
      const updateData = { price: 599, summary: 'Updated summary' };
      const updatedTour = { _id: tourId, ...updateData };
      
      Tour.findByIdAndUpdate = jest.fn().mockResolvedValue(updatedTour);
      mongoose.Types.ObjectId.isValid = jest.fn().mockReturnValue(true);
      
      const result = await tourService.updateTour(tourId, updateData);
      
      expect(Tour.findByIdAndUpdate).toHaveBeenCalledWith(
        tourId, 
        updateData, 
        { new: true, runValidators: true }
      );
      expect(result).toEqual(updatedTour);
    });
    
    it('should throw error for invalid tour ID', async () => {
      const invalidTourId = 'invalid-id';
      const updateData = { price: 599 };
      
      mongoose.Types.ObjectId.isValid = jest.fn().mockReturnValue(false);
      
      await expect(tourService.updateTour(invalidTourId, updateData)).rejects.toThrow(AppError);
    });
    
    it('should throw error if tour not found', async () => {
      const tourId = 'non-existent-tour-id';
      const updateData = { price: 599 };
      
      Tour.findByIdAndUpdate = jest.fn().mockResolvedValue(null);
      mongoose.Types.ObjectId.isValid = jest.fn().mockReturnValue(true);
      
      await expect(tourService.updateTour(tourId, updateData)).rejects.toThrow(AppError);
    });
  });
  
  describe('deleteTour', () => {
    it('should delete a tour and its images', async () => {
      const tourId = 'valid-tour-id';
      const mockTour = { 
        _id: tourId, 
        images: ['image1.jpg', 'image2.jpg'] 
      };
      
      Tour.findById = jest.fn().mockResolvedValue(mockTour);
      Tour.findByIdAndDelete = jest.fn().mockResolvedValue({});
      mongoose.Types.ObjectId.isValid = jest.fn().mockReturnValue(true);
      imageHandler.deleteImage = jest.fn().mockResolvedValue(true);
      
      await tourService.deleteTour(tourId);
      
      expect(Tour.findById).toHaveBeenCalledWith(tourId);
      expect(imageHandler.deleteImage).toHaveBeenCalledTimes(2);
      expect(Tour.findByIdAndDelete).toHaveBeenCalledWith(tourId);
    });
    
    it('should throw error for invalid tour ID', async () => {
      const invalidTourId = 'invalid-id';
      
      mongoose.Types.ObjectId.isValid = jest.fn().mockReturnValue(false);
      
      await expect(tourService.deleteTour(invalidTourId)).rejects.toThrow(AppError);
    });
    
    it('should throw error if tour not found', async () => {
      const tourId = 'non-existent-tour-id';
      
      Tour.findById = jest.fn().mockResolvedValue(null);
      mongoose.Types.ObjectId.isValid = jest.fn().mockReturnValue(true);
      
      await expect(tourService.deleteTour(tourId)).rejects.toThrow(AppError);
    });
  });
  
  describe('getTourStats', () => {
    it('should return aggregated tour statistics', async () => {
      const mockStats = [
        { _id: 'EASY', numTours: 3, avgRating: 4.5, avgPrice: 297 },
        { _id: 'MEDIUM', numTours: 2, avgRating: 4.2, avgPrice: 497 }
      ];
      
      Tour.aggregate = jest.fn().mockResolvedValue(mockStats);
      
      const result = await tourService.getTourStats();
      
      expect(Tour.aggregate).toHaveBeenCalled();
      expect(result).toEqual(mockStats);
    });
  });
  
  describe('bookTour', () => {
    it('should create a booking for a tour', async () => {
      const tourId = 'valid-tour-id';
      const userId = 'valid-user-id';
      const bookingData = { date: new Date(), participants: 2 };
      
      const mockTour = { _id: tourId, price: 299 };
      const expectedBooking = { 
        _id: 'booking123',
        tour: tourId,
        user: userId,
        price: mockTour.price,
        ...bookingData
      };
      
      Tour.findById = jest.fn().mockResolvedValue(mockTour);
      Booking.create = jest.fn().mockResolvedValue(expectedBooking);
      mongoose.Types.ObjectId.isValid = jest.fn().mockReturnValue(true);
      
      const result = await tourService.bookTour(tourId, userId, bookingData);
      
      expect(Tour.findById).toHaveBeenCalledWith(tourId);
      expect(Booking.create).toHaveBeenCalledWith({
        tour: tourId,
        user: userId,
        price: mockTour.price,
        participants: bookingData.participants,
        date: bookingData.date
      });
      expect(result).toEqual(expectedBooking);
    });
    
    it('should throw error for invalid IDs', async () => {
      const invalidTourId = 'invalid-tour-id';
      const userId = 'valid-user-id';
      const bookingData = { date: new Date() };
      
      mongoose.Types.ObjectId.isValid = jest.fn()
        .mockImplementation(id => id === userId);
      
      await expect(tourService.bookTour(invalidTourId, userId, bookingData))
        .rejects.toThrow(AppError);
    });
    
    it('should throw error if tour not found', async () => {
      const tourId = 'non-existent-tour-id';
      const userId = 'valid-user-id';
      const bookingData = { date: new Date() };
      
      Tour.findById = jest.fn().mockResolvedValue(null);
      mongoose.Types.ObjectId.isValid = jest.fn().mockReturnValue(true);
      
      await expect(tourService.bookTour(tourId, userId, bookingData))
        .rejects.toThrow(AppError);
    });
  });
  
  describe('addReview', () => {
    it('should add a review to a tour', async () => {
      const tourId = 'valid-tour-id';
      const userId = 'valid-user-id';
      const reviewData = { review: 'Great tour!', rating: 5 };
      
      const expectedReview = { 
        _id: 'review123',
        tour: tourId,
        user: userId,
        ...reviewData
      };
      
      Booking.exists = jest.fn().mockResolvedValue(true);
      Review.create = jest.fn().mockResolvedValue(expectedReview);
      mongoose.Types.ObjectId.isValid = jest.fn().mockReturnValue(true);
      
      const result = await tourService.addReview(tourId, userId, reviewData);
      
      expect(Booking.exists).toHaveBeenCalledWith({ tour: tourId, user: userId });
      expect(Review.create).toHaveBeenCalledWith({
        tour: tourId,
        user: userId,
        review: reviewData.review,
        rating: reviewData.rating
      });
      expect(result).toEqual(expectedReview);
    });
    
    it('should throw error for invalid IDs', async () => {
      const invalidTourId = 'invalid-tour-id';
      const userId = 'valid-user-id';
      const reviewData = { review: 'Great tour!', rating: 5 };
      
      mongoose.Types.ObjectId.isValid = jest.fn()
        .mockImplementation(id => id === userId);
      
      await expect(tourService.addReview(invalidTourId, userId, reviewData))
        .rejects.toThrow(AppError);
    });
    
    it('should throw error if user has not booked the tour', async () => {
      const tourId = 'valid-tour-id';
      const userId = 'valid-user-id';
      const reviewData = { review: 'Great tour!', rating: 5 };
      
      Booking.exists = jest.fn().mockResolvedValue(false);
      mongoose.Types.ObjectId.isValid = jest.fn().mockReturnValue(true);
      
      await expect(tourService.addReview(tourId, userId, reviewData))
        .rejects.toThrow(AppError);
    });
  });
  
  describe('uploadTourImages', () => {
    it('should upload and attach images to a tour', async () => {
      const tourId = 'valid-tour-id';
      const files = [
        { originalname: 'image1.jpg' },
        { originalname: 'image2.jpg' }
      ];
      
      const mockTour = { 
        _id: tourId, 
        images: ['existing-image.jpg'],
        save: jest.fn().mockResolvedValue({
          _id: tourId,
          images: ['existing-image.jpg', 'image1.jpg', 'image2.jpg']
        })
      };
      
      Tour.findById = jest.fn().mockResolvedValue(mockTour);
      mongoose.Types.ObjectId.isValid = jest.fn().mockReturnValue(true);
      imageHandler.uploadImage = jest.fn()
        .mockImplementation((file) => Promise.resolve(file.originalname));
      
      const result = await tourService.uploadTourImages(tourId, files);
      
      expect(Tour.findById).toHaveBeenCalledWith(tourId);
      expect(imageHandler.uploadImage).toHaveBeenCalledTimes(2);
      expect(mockTour.images).toEqual(['existing-image.jpg', 'image1.jpg', 'image2.jpg']);
      expect(mockTour.save).toHaveBeenCalled();
    });
    
    it('should throw error for invalid tour ID', async () => {
      const invalidTourId = 'invalid-id';
      const files = [{ originalname: 'image1.jpg' }];
      
      mongoose.Types.ObjectId.isValid = jest.fn().mockReturnValue(false);
      
      await expect(tourService.uploadTourImages(invalidTourId, files))
        .rejects.toThrow(AppError);
    });
    
    it('should throw error if no files provided', async () => {
      const tourId = 'valid-tour-id';
      const files = [];
      
      mongoose.Types.ObjectId.isValid = jest.fn().mockReturnValue(true);
      
      await expect(tourService.uploadTourImages(tourId, files))
        .rejects.toThrow(AppError);
    });
    
    it('should throw error if tour not found', async () => {
      const tourId = 'non-existent-tour-id';
      const files = [{ originalname: 'image1.jpg' }];
      
      Tour.findById = jest.fn().mockResolvedValue(null);
      mongoose.Types.ObjectId.isValid = jest.fn().mockReturnValue(true);
      
      await expect(tourService.uploadTourImages(tourId, files))
        .rejects.toThrow(AppError);
    });
  });
  
  describe('getToursWithin', () => {
    it('should find tours within a specified distance', async () => {
      const latitude = 40.758896;
      const longitude = -73.985130;
      const distance = 10; // 10km radius
      
      const expectedTours = [
        { name: 'Tour 1', distance: 2.5 },
        { name: 'Tour 2', distance: 5.7 }
      ];
      
      Tour.find = jest.fn().mockResolvedValue(expectedTours);
      
      const result = await tourService.getToursWithin(latitude, longitude, distance);
      
      expect(Tour.find).toHaveBeenCalledWith({
        startLocation: {
          $geoWithin: {
            $centerSphere: [[longitude, latitude], expect.any(Number)]
          }
        }
      });
      expect(result).toEqual(expectedTours);
    });
    
    it('should throw error if coordinates not provided', async () => {
      await expect(tourService.getToursWithin(null, -73.985130, 10))
        .rejects.toThrow(AppError);
      
      await expect(tourService.getToursWithin(40.758896, null, 10))
        .rejects.toThrow(AppError);
    });
  });
  
  describe('getDistances', () => {
    it('should calculate distances from point to all tours', async () => {
      const latitude = 40.758896;
      const longitude = -73.985130;
      
      const expectedDistances = [
        { distance: 2.5, name: 'Tour 1' },
        { distance: 5.7, name: 'Tour 2' }
      ];
      
      Tour.aggregate = jest.fn().mockResolvedValue(expectedDistances);
      
      const result = await tourService.getDistances(latitude, longitude);
      
      expect(Tour.aggregate).toHaveBeenCalledWith([
        {
          $geoNear: {
            near: {
              type: 'Point',
              coordinates: [parseFloat(longitude), parseFloat(latitude)]
            },
            distanceField: 'distance',
            distanceMultiplier: 0.001
          }
        },
        {
          $project: {
            distance: 1,
            name: 1
          }
        }
      ]);
      expect(result).toEqual(expectedDistances);
    });
    
    it('should throw error if coordinates not provided', async () => {
      await expect(tourService.getDistances(null, -73.985130))
        .rejects.toThrow(AppError);
      
      await expect(tourService.getDistances(40.758896, null))
        .rejects.toThrow(AppError);
    });
  });
});
