const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const tourService = require('../../services/tourService');
const Tour = require('../../models/tourModel');
const User = require('../../models/userModel');
const Booking = require('../../models/bookingModel');
const Review = require('../../models/reviewModel');
const AppError = require('../../utils/appError');

let mongoServer;

// Mock the image handler functions
jest.mock('../../utils/imageHandler', () => ({
  uploadImage: jest.fn().mockResolvedValue('http://example.com/test-image.jpg'),
  deleteImage: jest.fn().mockResolvedValue(true)
}));

// Sample data
const sampleTour = {
  name: 'Test Tour',
  duration: 5,
  maxGroupSize: 10,
  difficulty: 'easy',
  price: 497,
  summary: 'Test tour summary',
  description: 'Test tour description',
  imageCover: 'tour-test-cover.jpg',
  startLocation: {
    type: 'Point',
    coordinates: [-73.985130, 40.758896],
    address: '123 Test St',
    description: 'New York, NY'
  }
};

const sampleUser = {
  name: 'Test User',
  email: 'test@example.com',
  password: 'password123',
  role: 'user'
};

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  await mongoose.connect(mongoServer.getUri());
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

beforeEach(async () => {
  // Clear all collections before each test
  await Tour.deleteMany({});
  await User.deleteMany({});
  await Booking.deleteMany({});
  await Review.deleteMany({});
});

describe('TourService', () => {
  describe('createTour', () => {
    it('should create a tour with valid data', async () => {
      const tour = await tourService.createTour(sampleTour);
      expect(tour).toHaveProperty('_id');
      expect(tour.name).toBe(sampleTour.name);
      expect(tour.price).toBe(sampleTour.price);
    });

    it('should throw an error if required fields are missing', async () => {
      await expect(tourService.createTour({
        name: 'Incomplete Tour'
      })).rejects.toThrow(AppError);
    });
  });

  describe('getTours', () => {
    beforeEach(async () => {
      await Tour.create([
        { ...sampleTour, price: 100, ratingsAverage: 4.5 },
        { ...sampleTour, name: 'Another Tour', price: 200, ratingsAverage: 3.7 },
        { ...sampleTour, name: 'Premium Tour', price: 300, ratingsAverage: 4.8 }
      ]);
    });

    it('should get all tours', async () => {
      const tours = await tourService.getTours({});
      expect(tours.length).toBe(3);
    });

    it('should filter tours by price', async () => {
      const tours = await tourService.getTours({ price: { gte: '200' } });
      expect(tours.length).toBe(2);
      expect(tours[0].price).toBeGreaterThanOrEqual(200);
    });

    it('should sort tours by price', async () => {
      const tours = await tourService.getTours({ sort: 'price' });
      expect(tours[0].price).toBe(100);
      expect(tours[2].price).toBe(300);
    });

    it('should paginate results', async () => {
      const tours = await tourService.getTours({ page: '1', limit: '2' });
      expect(tours.length).toBe(2);
    });
  });

  describe('getTourById', () => {
    let tour;

    beforeEach(async () => {
      tour = await Tour.create(sampleTour);
    });

    it('should get a tour by ID', async () => {
      const foundTour = await tourService.getTourById(tour._id);
      expect(foundTour.name).toBe(tour.name);
    });

    it('should throw an error for invalid ID', async () => {
      await expect(tourService.getTourById('invalid-id')).rejects.toThrow(AppError);
    });

    it('should throw an error if tour not found', async () => {
      const nonExistentId = new mongoose.Types.ObjectId();
      await expect(tourService.getTourById(nonExistentId)).rejects.toThrow(AppError);
    });
  });

  // Add more test cases for the remaining service methods
  // Such as updateTour, deleteTour, bookTour, etc.
});
