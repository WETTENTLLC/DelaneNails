const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const app = require('../app');
const Appointment = require('../models/appointment');

let mongoServer;

// Setup in-memory MongoDB server for testing
beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  await mongoose.connect(mongoServer.getUri(), {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
});

// Clean up after all tests
afterAll(async () => {
  await mongoose.connection.close();
  await mongoServer.stop();
});

// Clear test data before each test
beforeEach(async () => {
  await Appointment.deleteMany({});
});

describe('Appointment Routes', () => {
  // Test data
  const validAppointment = {
    clientName: 'Test Client',
    service: 'Manicure',
    date: new Date('2023-12-15T10:00:00'),
    duration: 60,
    phone: '123-456-7890',
    email: 'test@example.com'
  };

  describe('GET /api/appointments', () => {
    test('should return empty array when no appointments exist', async () => {
      const response = await request(app).get('/api/appointments');
      
      expect(response.statusCode).toBe(200);
      expect(response.body).toEqual([]);
    });

    test('should return all appointments', async () => {
      await Appointment.create(validAppointment);
      await Appointment.create({
        ...validAppointment,
        clientName: 'Another Client',
        email: 'another@example.com'
      });

      const response = await request(app).get('/api/appointments');
      
      expect(response.statusCode).toBe(200);
      expect(response.body.length).toBe(2);
      expect(response.body[0]).toHaveProperty('clientName', 'Test Client');
    });

    test('should filter appointments by date range', async () => {
      await Appointment.create(validAppointment);
      await Appointment.create({
        ...validAppointment,
        date: new Date('2023-12-20T14:00:00')
      });

      const response = await request(app)
        .get('/api/appointments')
        .query({ 
          startDate: '2023-12-19', 
          endDate: '2023-12-21' 
        });
      
      expect(response.statusCode).toBe(200);
      expect(response.body.length).toBe(1);
    });
  });

  describe('GET /api/appointments/:id', () => {
    test('should return a specific appointment', async () => {
      const appointment = await Appointment.create(validAppointment);
      
      const response = await request(app).get(`/api/appointments/${appointment._id}`);
      
      expect(response.statusCode).toBe(200);
      expect(response.body).toHaveProperty('clientName', validAppointment.clientName);
    });

    test('should return 404 for non-existent appointment', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const response = await request(app).get(`/api/appointments/${fakeId}`);
      
      expect(response.statusCode).toBe(404);
    });

    test('should return 400 for invalid ID format', async () => {
      const response = await request(app).get('/api/appointments/invalid-id');
      
      expect(response.statusCode).toBe(400);
    });
  });

  describe('POST /api/appointments', () => {
    test('should create a new appointment with valid data', async () => {
      const response = await request(app)
        .post('/api/appointments')
        .send(validAppointment);
      
      expect(response.statusCode).toBe(201);
      expect(response.body).toHaveProperty('clientName', validAppointment.clientName);
      
      // Verify it was stored in the database
      const appointments = await Appointment.find({});
      expect(appointments.length).toBe(1);
    });

    test('should reject appointment with missing required fields', async () => {
      const invalidAppointment = {
        clientName: 'Test Client',
        // Missing service, date, and other required fields
      };

      const response = await request(app)
        .post('/api/appointments')
        .send(invalidAppointment);
      
      expect(response.statusCode).toBe(400);
    });

    test('should reject appointment with invalid email format', async () => {
      const invalidAppointment = {
        ...validAppointment,
        email: 'invalid-email'
      };

      const response = await request(app)
        .post('/api/appointments')
        .send(invalidAppointment);
      
      expect(response.statusCode).toBe(400);
    });

    test('should reject appointment that overlaps with existing one', async () => {
      // Create an appointment
      await Appointment.create(validAppointment);
      
      // Try to create another appointment at the same time
      const response = await request(app)
        .post('/api/appointments')
        .send(validAppointment);
      
      expect(response.statusCode).toBe(409); // Conflict
    });
  });

  describe('PUT /api/appointments/:id', () => {
    test('should update an existing appointment', async () => {
      const appointment = await Appointment.create(validAppointment);
      
      const updatedData = {
        clientName: 'Updated Client',
        service: 'Pedicure'
      };

      const response = await request(app)
        .put(`/api/appointments/${appointment._id}`)
        .send(updatedData);
      
      expect(response.statusCode).toBe(200);
      expect(response.body).toHaveProperty('clientName', updatedData.clientName);
      expect(response.body).toHaveProperty('service', updatedData.service);
      
      // The unchanged fields should remain
      expect(response.body).toHaveProperty('email', validAppointment.email);
    });

    test('should return 404 when updating non-existent appointment', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const response = await request(app)
        .put(`/api/appointments/${fakeId}`)
        .send({ clientName: 'Updated Client' });
      
      expect(response.statusCode).toBe(404);
    });

    test('should reject update with invalid data', async () => {
      const appointment = await Appointment.create(validAppointment);
      
      const invalidUpdate = {
        email: 'invalid-email'
      };

      const response = await request(app)
        .put(`/api/appointments/${appointment._id}`)
        .send(invalidUpdate);
      
      expect(response.statusCode).toBe(400);
    });
  });

  describe('DELETE /api/appointments/:id', () => {
    test('should delete an existing appointment', async () => {
      const appointment = await Appointment.create(validAppointment);
      
      const response = await request(app).delete(`/api/appointments/${appointment._id}`);
      
      expect(response.statusCode).toBe(200);
      
      // Verify it was removed from the database
      const found = await Appointment.findById(appointment._id);
      expect(found).toBeNull();
    });

    test('should return 404 when deleting non-existent appointment', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const response = await request(app).delete(`/api/appointments/${fakeId}`);
      
      expect(response.statusCode).toBe(404);
    });
  });

  describe('Integration scenarios', () => {
    test('should reflect updates in subsequent GET requests', async () => {
      // Create an appointment
      const createResponse = await request(app)
        .post('/api/appointments')
        .send(validAppointment);
      
      const appointmentId = createResponse.body._id;
      
      // Update the appointment
      await request(app)
        .put(`/api/appointments/${appointmentId}`)
        .send({ service: 'Updated Service' });
      
      // Get the appointment
      const getResponse = await request(app).get(`/api/appointments/${appointmentId}`);
      
      expect(getResponse.body).toHaveProperty('service', 'Updated Service');
    });

    test('complete CRUD lifecycle', async () => {
      // Create
      const createResponse = await request(app)
        .post('/api/appointments')
        .send(validAppointment);
      
      expect(createResponse.statusCode).toBe(201);
      const appointmentId = createResponse.body._id;
      
      // Read
      const getResponse = await request(app).get(`/api/appointments/${appointmentId}`);
      expect(getResponse.statusCode).toBe(200);
      
      // Update
      const updateResponse = await request(app)
        .put(`/api/appointments/${appointmentId}`)
        .send({ clientName: 'Updated Name' });
      
      expect(updateResponse.statusCode).toBe(200);
      expect(updateResponse.body).toHaveProperty('clientName', 'Updated Name');
      
      // Delete
      const deleteResponse = await request(app).delete(`/api/appointments/${appointmentId}`);
      expect(deleteResponse.statusCode).toBe(200);
      
      // Verify deleted
      const verifyResponse = await request(app).get(`/api/appointments/${appointmentId}`);
      expect(verifyResponse.statusCode).toBe(404);
    });
  });
});
