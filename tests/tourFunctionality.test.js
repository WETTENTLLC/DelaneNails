const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../app');
const Tour = require('../models/tourModel');
const User = require('../models/userModel');
const Booking = require('../models/bookingModel');
const Review = require('../models/reviewModel');

let token;
let adminToken;
let tourId;
let userId;
let bookingId;

// Sample tour data
const sampleTour = {
  name: "Deluxe Nail Experience",
  duration: 2,
  maxGroupSize: 3,
  difficulty: "easy",
  price: 99.99,
  summary: "Luxury nail treatment for everyone",
  description: "A complete luxury treatment for nails including massage, nail art, and premium care",
  startLocation: {
    type: "Point",
    coordinates: [-122.4194, 37.7749],
    address: "123 Beauty Street",
    description: "San Francisco"
  }
};

// Test suite for tour functionality
describe('Tour Functionality Tests', () => {
  
  // Setup before all tests
  beforeAll(async () => {
    // Connect to test database if needed
    // Clear database collections
    await Tour.deleteMany({});
    await Booking.deleteMany({});
    await Review.deleteMany({});
    
    // Create a test user and get token
    const loginResponse = await request(app)
      .post('/api/v1/users/login')
      .send({
        email: 'test@example.com',
        password: 'password123'
      });
      
    token = loginResponse.body.token;
    
    // Create an admin user and get token
    const adminLoginResponse = await request(app)
      .post('/api/v1/users/login')
      .send({
        email: 'admin@example.com',
        password: 'admin123'
      });
      
    adminToken = adminLoginResponse.body.token;
    userId = loginResponse.body.data.user._id;
  });
  
  afterAll(async () => {
    // Close database connection
    await mongoose.connection.close();
  });
  
  // Test CRUD Operations
  describe('CRUD Operations', () => {
    
    test('Create a new tour', async () => {
      const response = await request(app)
        .post('/api/v1/tours')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(sampleTour);
        
      expect(response.status).toBe(201);
      expect(response.body.status).toBe('success');
      expect(response.body.data.tour).toHaveProperty('_id');
      expect(response.body.data.tour.name).toBe(sampleTour.name);
      
      // Store the tour ID for future tests
      tourId = response.body.data.tour._id;
    });
    
    test('Get all tours', async () => {
      const response = await request(app)
        .get('/api/v1/tours');
        
      expect(response.status).toBe(200);
      expect(response.body.status).toBe('success');
      expect(Array.isArray(response.body.data.tours)).toBe(true);
      expect(response.body.data.tours.length).toBeGreaterThan(0);
    });
    
    test('Get tour by ID', async () => {
      const response = await request(app)
        .get(`/api/v1/tours/${tourId}`);
        
      expect(response.status).toBe(200);
      expect(response.body.status).toBe('success');
      expect(response.body.data.tour._id).toBe(tourId);
    });
    
    test('Update tour', async () => {
      const response = await request(app)
        .patch(`/api/v1/tours/${tourId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ price: 129.99 });
        
      expect(response.status).toBe(200);
      expect(response.body.status).toBe('success');
      expect(response.body.data.tour.price).toBe(129.99);
    });
  });
  
  // Test Filtering, Sorting, and Pagination
  describe('Filtering, Sorting, and Pagination', () => {
    
    // Create additional tours for testing
    beforeAll(async () => {
      await Tour.create([
        {
          ...sampleTour,
          name: "Budget Nail Care",
          price: 39.99,
          ratingsAverage: 3.5
        },
        {
          ...sampleTour,
          name: "Premium Nail Treatment",
          price: 149.99,
          ratingsAverage: 4.8
        }
      ]);
    });
    
    test('Filter tours by price', async () => {
      const response = await request(app)
        .get('/api/v1/tours')
        .query({ price: { gte: '100' } });
        
      expect(response.status).toBe(200);
      expect(response.body.data.tours.every(tour => tour.price >= 100)).toBe(true);
    });
    
    test('Sort tours by price ascending', async () => {
      const response = await request(app)
        .get('/api/v1/tours')
        .query({ sort: 'price' });
        
      const prices = response.body.data.tours.map(tour => tour.price);
      const sortedPrices = [...prices].sort((a, b) => a - b);
      
      expect(response.status).toBe(200);
      expect(prices).toEqual(sortedPrices);
    });
    
    test('Limit fields returned', async () => {
      const response = await request(app)
        .get('/api/v1/tours')
        .query({ fields: 'name,price,duration' });
        
      const tour = response.body.data.tours[0];
      
      expect(response.status).toBe(200);
      expect(Object.keys(tour).sort()).toEqual(['_id', 'name', 'price', 'duration'].sort());
    });
    
    test('Paginate results', async () => {
      const response = await request(app)
        .get('/api/v1/tours')
        .query({ page: '1', limit: '2' });
        
      expect(response.status).toBe(200);
      expect(response.body.data.tours.length).toBe(2);
    });
  });
  
  // Test Review Functionality
  describe('Reviews', () => {
    
    test('Add review to tour', async () => {
      const response = await request(app)
        .post(`/api/v1/tours/${tourId}/reviews`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          review: "Great nail treatment!",
          rating: 5
        });
        
      expect(response.status).toBe(201);
      expect(response.body.status).toBe('success');
      expect(response.body.data.review).toHaveProperty('_id');
      expect(response.body.data.review.review).toBe('Great nail treatment!');
    });
    
    test('Get tour with populated reviews', async () => {
      const response = await request(app)
        .get(`/api/v1/tours/${tourId}`);
        
      expect(response.status).toBe(200);
      expect(Array.isArray(response.body.data.tour.reviews)).toBe(true);
      expect(response.body.data.tour.reviews.length).toBeGreaterThan(0);
    });
  });
  
  // Test Booking Functionality
  describe('Bookings', () => {
    
    test('Book a tour', async () => {
      const response = await request(app)
        .post(`/api/v1/tours/${tourId}/bookings`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
          participants: 2
        });
        
      expect(response.status).toBe(201);
      expect(response.body.status).toBe('success');
      expect(response.body.data.booking).toHaveProperty('_id');
      
      bookingId = response.body.data.booking._id;
    });
    
    test('Cannot book same tour twice', async () => {
      const response = await request(app)
        .post(`/api/v1/tours/${tourId}/bookings`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          date: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000), // 10 days from now
          participants: 1
        });
        
      expect(response.status).toBe(400);
    });
  });
  
  // Test Geospatial Functionality
  describe('Geospatial Features', () => {
    
    test('Get tours within distance', async () => {
      const response = await request(app)
        .get(`/api/v1/tours/tours-within/50/center/37.7749,-122.4194`);
        
      expect(response.status).toBe(200);
      expect(Array.isArray(response.body.data.tours)).toBe(true);
    });
    
    test('Get distances to tours', async () => {
      const response = await request(app)
        .get(`/api/v1/tours/distances/37.7749,-122.4194`);
        
      expect(response.status).toBe(200);
      expect(Array.isArray(response.body.data.distances)).toBe(true);
    });
  });
  
  // Test Image Upload
  describe('Image Handling', () => {
    
    test('Upload tour images', async () => {
      // This would require a multi-part form data request with actual image files
      // Mocking it here, but in a real test you would use fs to read test images
      
      const response = await request(app)
        .patch(`/api/v1/tours/${tourId}/images`)
        .set('Authorization', `Bearer ${adminToken}`)
        .attach('images', Buffer.from('fake image data'), {
          filename: 'test-image.jpg',
          contentType: 'image/jpeg'
        });
        
      expect(response.status).toBe(200);
    });
  });
  
  // Test Error Handling
  describe('Error Handling', () => {
    
    test('Invalid tour ID returns 404', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const response = await request(app)
        .get(`/api/v1/tours/${fakeId}`);
        
      expect(response.status).toBe(404);
    });
    
    test('Invalid data for tour creation returns 400', async () => {
      const response = await request(app)
        .post('/api/v1/tours')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ name: 'Incomplete Tour' });
        
      expect(response.status).toBe(400);
    });
    
    test('Unauthorized access returns 401', async () => {
      const response = await request(app)
        .post('/api/v1/tours')
        .send(sampleTour);
        
      expect(response.status).toBe(401);
    });
    
    test('Delete tour', async () => {
      const response = await request(app)
        .delete(`/api/v1/tours/${tourId}`)
        .set('Authorization', `Bearer ${adminToken}`);
        
      expect(response.status).toBe(204);
      
      // Verify tour is deleted
      const getTour = await request(app).get(`/api/v1/tours/${tourId}`);
      expect(getTour.status).toBe(404);
    });
  });
});
