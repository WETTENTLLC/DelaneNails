const mongoose = require('mongoose');
const { expect } = require('chai');
const sinon = require('sinon');
const tourService = require('../../../services/tourService');
const Tour = require('../../../models/tourModel');
const Booking = require('../../../models/bookingModel');
const Review = require('../../../models/reviewModel');
const AppError = require('../../../utils/appError');
const { uploadImage } = require('../../../utils/imageHandler');

describe('Tour Service', () => {
  beforeEach(() => {
    // Reset all stubs/mocks before each test
    sinon.restore();
  });

  describe('createTour', () => {
    it('should create a tour with valid data', async () => {
      const tourData = {
        name: 'Test Tour',
        duration: 5,
        description: 'A test tour',
        summary: 'Test summary',
        difficulty: 'easy',
        price: 100,
        imageCover: 'test-image.jpg'
      };
      
      const tourStub = sinon.stub(Tour, 'create').resolves(tourData);
      
      const result = await tourService.createTour(tourData);
      
      expect(tourStub.calledOnceWith(tourData)).to.be.true;
      expect(result).to.deep.equal(tourData);
    });
    
    it('should throw error if required fields are missing', async () => {
      const tourData = {
        name: 'Test Tour'
        // Missing required fields
      };
      
      try {
        await tourService.createTour(tourData);
        // Should not reach this line
        expect.fail('Expected error was not thrown');
      } catch (error) {
        expect(error).to.be.instanceOf(AppError);
        expect(error.statusCode).to.equal(400);
      }
    });
    
    it('should handle validation errors', async () => {
      const tourData = {
        name: 'Test Tour',
        duration: 5,
        description: 'A test tour',
        summary: 'Test summary',
        difficulty: 'invalid', // Invalid difficulty value
        price: 100,
        imageCover: 'test-image.jpg'
      };
      
      const validationError = new Error('Validation error');
      validationError.name = 'ValidationError';
      
      sinon.stub(Tour, 'create').rejects(validationError);
      
      try {
        await tourService.createTour(tourData);
        expect.fail('Expected error was not thrown');
      } catch (error) {
        expect(error).to.be.instanceOf(AppError);
        expect(error.statusCode).to.equal(400);
        expect(error.message).to.include('Validation error');
      }
    });
  });

  describe('getTours', () => {
    it('should return filtered and sorted tours', async () => {
      const mockTours = [
        { name: 'Tour A', price: 100 },
        { name: 'Tour B', price: 200 }
      ];
      
      // Mock the Tour.find() query chain
      const queryChain = {
        find: sinon.stub().returnsThis(),
        sort: sinon.stub().returnsThis(),
        select: sinon.stub().returnsThis(),
        skip: sinon.stub().returnsThis(),
        limit: sinon.stub().returnsThis()
      };
      
      queryChain.find.returns(queryChain);
      queryChain.limit.returns(mockTours);
      
      sinon.stub(Tour, 'find').returns(queryChain);
      
      const result = await tourService.getTours({
        price: { gte: '100' },
        sort: 'price',
        fields: 'name,price',
        page: '1',
        limit: '10'
      });
      
      expect(result).to.deep.equal(mockTours);
    });
  });

  describe('getTourById', () => {
    it('should return a tour by id', async () => {
      const mockTour = {
        _id: mongoose.Types.ObjectId(),
        name: 'Test Tour',
        price: 100
      };
      
      const populateStub = sinon.stub().resolves(mockTour);
      const findByIdStub = sinon.stub(Tour, 'findById').returns({
        populate: populateStub
      });
      
      const result = await tourService.getTourById(mockTour._id);
      
      expect(findByIdStub.calledWith(mockTour._id)).to.be.true;
      expect(result).to.deep.equal(mockTour);
    });
    
    it('should throw error for invalid id', async () => {
      try {
        await tourService.getTourById('invalid-id');
        expect.fail('Expected error was not thrown');
      } catch (error) {
        expect(error).to.be.instanceOf(AppError);
        expect(error.statusCode).to.equal(400);
        expect(error.message).to.include('Invalid tour ID');
      }
    });
    
    it('should throw error if tour not found', async () => {
      const validId = mongoose.Types.ObjectId();
      
      const populateStub = sinon.stub().resolves(null);
      sinon.stub(Tour, 'findById').returns({
        populate: populateStub
      });
      
      try {
        await tourService.getTourById(validId);
        expect.fail('Expected error was not thrown');
      } catch (error) {
        expect(error).to.be.instanceOf(AppError);
        expect(error.statusCode).to.equal(404);
        expect(error.message).to.include('Tour not found');
      }
    });
  });

  // Add more test cases for other methods...
});
