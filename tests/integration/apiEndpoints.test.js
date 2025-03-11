const request = require('supertest');
const { setupTestEnvironment } = require('../setup');
const app = require('../../src/app');

describe('NailAide API Endpoints', () => {
  let testEnv;
  
  beforeAll(async () => {
    testEnv = await setupTestEnvironment();
  });
  
  afterAll(async () => {
    await testEnv.teardown();
  });
  
  describe('Appointments API', () => {
    test('GET /api/appointments should return all appointments', async () => {
      const response = await request(app)
        .get('/api/appointments')
        .set('Accept', 'application/json');
      
      expect(response.status).toBe(200);
      expect(response.body).toBeInstanceOf(Array);
      expect(response.body.length).toBe(2);
      expect(response.body[0]).toHaveProperty('clientName');
      expect(response.body[0]).toHaveProperty('service');
    });
    
    test('GET /api/appointments/:id should return a single appointment', async () => {
      const response = await request(app)
        .get('/api/appointments/appt-123')
        .set('Accept', 'application/json');
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('id', 'appt-123');
      expect(response.body).toHaveProperty('clientName', 'Jane Doe');
    });
    
    test('POST /api/appointments should create a new appointment', async () => {
      const newAppointment = {
        clientName: 'New Client',
        date: '2023-12-01T13:00:00Z',
        service: 'Full Set Acrylics',
        duration: 120,
        price: 75.00,
        status: 'confirmed'
      };
      
      const response = await request(app)
        .post('/api/appointments')
        .send(newAppointment)
        .set('Accept', 'application/json')
        .set('Content-Type', 'application/json');
      
      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('id');
      expect(response.body.clientName).toBe(newAppointment.clientName);
    });
    
    test('PUT /api/appointments/:id should update an appointment', async () => {
      const updates = {
        status: 'rescheduled',
        date: '2023-11-16T15:00:00Z'
      };
      
      const response = await request(app)
        .put('/api/appointments/appt-123')
        .send(updates)
        .set('Accept', 'application/json')
        .set('Content-Type', 'application/json');
      
      expect(response.status).toBe(200);
      expect(response.body.status).toBe('rescheduled');
      expect(response.body.date).toBe('2023-11-16T15:00:00Z');
    });
    
    test('DELETE /api/appointments/:id should delete an appointment', async () => {
      const response = await request(app)
        .delete('/api/appointments/appt-124')
        .set('Accept', 'application/json');
      
      expect(response.status).toBe(204);
      
      // Verify it's deleted
      const getResponse = await request(app)
        .get('/api/appointments/appt-124')
        .set('Accept', 'application/json');
        
      expect(getResponse.status).toBe(404);
    });
  });
  
  describe('Error handling', () => {
    test('Should return 404 for non-existent resources', async () => {
      const response = await request(app)
        .get('/api/appointments/non-existent-id')
        .set('Accept', 'application/json');
      
      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('error');
    });
    
    test('Should return 400 for invalid data', async () => {
      const invalidData = {
        // Missing required fields
        clientName: 'Invalid Client'
      };
      
      const response = await request(app)
        .post('/api/appointments')
        .send(invalidData)
        .set('Accept', 'application/json')
        .set('Content-Type', 'application/json');
      
      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
    });
  });
});
