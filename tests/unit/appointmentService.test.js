const { AppointmentService } = require('../../src/services/appointmentService');
const { sampleAppointments } = require('../fixtures/testData');

// Mock the database layer
jest.mock('../../src/repositories/appointmentRepository', () => ({
  AppointmentRepository: jest.fn().mockImplementation(() => ({
    findAll: jest.fn().mockResolvedValue(sampleAppointments),
    findById: jest.fn().mockImplementation((id) => 
      Promise.resolve(sampleAppointments.find(a => a.id === id) || null)
    ),
    create: jest.fn().mockImplementation((appointment) => 
      Promise.resolve({ ...appointment, id: 'new-appt-id' })
    ),
    update: jest.fn().mockImplementation((id, data) => 
      Promise.resolve({ ...sampleAppointments.find(a => a.id === id), ...data })
    ),
    delete: jest.fn().mockResolvedValue(true)
  }))
}));

describe('AppointmentService', () => {
  let service;
  
  beforeEach(() => {
    service = new AppointmentService();
  });
  
  test('should get all appointments', async () => {
    const appointments = await service.getAllAppointments();
    expect(appointments).toEqual(sampleAppointments);
    expect(appointments.length).toBe(2);
  });
  
  test('should get appointment by id', async () => {
    const appointment = await service.getAppointmentById('appt-123');
    expect(appointment).toEqual(sampleAppointments[0]);
  });
  
  test('should return null for non-existent appointment', async () => {
    const appointment = await service.getAppointmentById('nonexistent');
    expect(appointment).toBeNull();
  });
  
  test('should create new appointment', async () => {
    const newAppointment = {
      clientName: 'Alice Brown',
      date: '2023-11-20T10:00:00Z',
      service: 'Nail Art',
      duration: 90,
      price: 65.00,
      status: 'confirmed'
    };
    
    const created = await service.createAppointment(newAppointment);
    expect(created).toEqual({
      ...newAppointment,
      id: 'new-appt-id'
    });
  });
  
  test('should update existing appointment', async () => {
    const updates = {
      status: 'completed',
      price: 50.00
    };
    
    const updated = await service.updateAppointment('appt-123', updates);
    expect(updated.status).toBe('completed');
    expect(updated.price).toBe(50.00);
    expect(updated.clientName).toBe('Jane Doe');
  });
  
  test('should throw error for invalid appointment data', async () => {
    const invalidAppointment = {
      clientName: 'Missing Fields'
      // Missing required fields
    };
    
    await expect(service.createAppointment(invalidAppointment))
      .rejects.toThrow('Invalid appointment data');
  });
});
