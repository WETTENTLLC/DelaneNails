const request = require('supertest');
const { expect } = require('chai');
const mongoose = require('mongoose');
const app = require('../../app');
const Tour = require('../../models/tourModel');
const User = require('../../models/userModel');
const { signToken } = require('../../utils/auth');

describe('Tour API', () => {
  let adminToken;
  let userToken;
  let testTourId;
  
  before(async () => {
    // Connect to test database if not already connected
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(process.env.TEST_DATABASE_URL, {
        useNewUrlParser: true,
        useUnifiedTopology: true
      });
    }
    
    // Create test users
    const adminUser = await User.create({
      name: 'Admin User',
      email: 'admin@test.com',
      password: 'password123',
      passwordConfirm: 'password123',
      role: 'admin'
    });
    
    const regularUser = await User.create({
      name: 'Regular User',
      email: 'user@test.com',
      password: 'password123',
      passwordConfirm: 'password123'
    });
    
    adminToken = signToken(adminUser._id);
    userToken = signToken(regularUser._id);
    
    // Create a test tour
    const testTour = await Tour.create({
      name: 'Integration Test Tour',
      duration: 5,
      difficulty: 'medium',
      price: 199,
      summary: 'Test tour for integration testing',
      imageCover: 'default-tour.jpg',
      description: 'Detailed description of the test tour'
    });
    
    testTourId = testTour._id;
  });
  
  after(async () => {
    // Clean up test data
    await Tour.deleteMany({ name: /^Integration Test/ });
    await User.deleteMany({ email: /test\.com$/ });
  });
  
  describe('GET /api/v1/tours', () => {
    it('should return all tours', async () => {
      const res = await request(app)
        .get('/api/v1/tours')
        .expect('Content-Type', /json/)
        .expect(200);
        
      expect(res.body.status).to.equal('success');
      expect(res.body.data.tours).to.be.an('array');
    });
    
    it('should filter tours by price', async () => {
      const res = await request(app)
        .get('/api/v1/tours?price[gte]=100')
        .expect(200);
        
      expect(res.body.status).to.equal('success');
      res.body.data.tours.forEach(tour => {
        expect(tour.price).to.be.at.least(100);
      });
    });
  });
  
  describe('GET /api/v1/tours/:id', () => {
    it('should return a specific tour', async () => {
      const res = await request(app)
        .get(`/api/v1/tours/${testTourId}`)
        .expect(200);
        
      expect(res.body.status).to.equal('success');
      expect(res.body.data.tour.name).to.equal('Integration Test Tour');
    });
    
    it('should return 404 for non-existent tour', async () => {
      const nonExistentId = mongoose.Types.ObjectId();
      const res = await request(app)
        .get(`/api/v1/tours/${nonExistentId}`)
        .expect(404);
        
      expect(res.body.status).to.equal('fail');
    });
    
    it('should return 400 for invalid ID format', async () => {
      const res = await request(app)
        .get('/api/v1/tours/invalid-id')
        .expect(400);
        
      expect(res.body.status).to.equal('fail');
    });
  });
  
  describe('POST /api/v1/tours', () => {
    it('should create a new tour when admin is authenticated', async () => {
      const tourData = {
        name: 'Integration Test Tour Created',
        duration: 7,
        difficulty: 'easy',
        price: 299,
        summary: 'A new test tour created via API',
        imageCover: 'test-cover.jpg',
        description: 'Detailed description'
      };
      
      const res = await request(app)
        .post('/api/v1/tours')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(tourData)
        .expect(201);
        
      expect(res.body.status).to.equal('success');
      expect(res.body.data.tour.name).to.equal(tourData.name);
    });
    
    it('should return 401 when not authenticated', async () => {
      const tourData = {
        name: 'Unauthorized Tour',
        duration: 3,
        price: 100
      };
      
      const res = await request(app)
        .post('/api/v1/tours')
        .send(tourData)
        .expect(401);
        
      expect(res.body.status).to.equal('fail');
    });
    
    it('should return 403 when user is not admin', async () => {
      const tourData = {
        name: 'Forbidden Tour',
        duration: 3,
        price: 100
      };
      
      const res = await request(app)
        .post('/api/v1/tours')
        .set('Authorization', `Bearer ${userToken}`)
        .send(tourData)
        .expect(403);
        
      expect(res.body.status).to.equal('fail');
    });
  });
  
  describe('PATCH /api/v1/tours/:id', () => {
    it('should update a tour when admin is authenticated', async () => {
      const updateData = {
        price: 399,
        summary: 'Updated summary for integration test'
      };
      
      const res = await request(app)
        .patch(`/api/v1/tours/${testTourId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send(updateData)
        .expect(200);
        
      expect(res.body.status).to.equal('success');
      expect(res.body.data.tour.price).to.equal(updateData.price);
      expect(res.body.data.tour.summary).to.equal(updateData.summary);
    });
  });
  
  describe('DELETE /api/v1/tours/:id', () => {
    it('should delete a tour when admin is authenticated', async () => {
      // First create a tour to delete
      const tourToDelete = await Tour.create({
        name: 'Integration Test Tour To Delete',
        duration: 2,
        difficulty: 'easy',
        price: 99,
        summary: 'Test tour to be deleted',
        imageCover: 'default-tour.jpg'
      });
      
      await request(app)
        .delete(`/api/v1/tours/${tourToDelete._id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(204);
        
      // Verify tour is deleted
      const deletedTour = await Tour.findById(tourToDelete._id);
      expect(deletedTour).to.be.null;
    });
  });
});
