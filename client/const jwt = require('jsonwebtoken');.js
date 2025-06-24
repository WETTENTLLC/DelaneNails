const jwt = require('jsonwebtoken');
const User = require('../models/userModel');
const Service = require('../models/serviceModel');
const Appointment = require('../models/appointmentModel');

/**
 * Creates test users with different roles
 */
exports.createTestUsers = async () => {
  // Create a regular user
  const testUser = await User.create({
    name: 'Test User',
    email: 'testuser@example.com',
    password: 'password123',
    passwordConfirm: 'password123',
    phone: '1234567890'
  });
  
  // Create a stylist
  const testStylist = await User.create({
    name: 'Test Stylist',
    email: 'teststylist@example.com',
    password: 'password123',
    passwordConfirm: 'password123',
    phone: '2345678901',
    role: 'stylist'
  });
  
  // Create an admin
  const testAdmin = await User.create({
    name: 'Test Admin',
    email: 'testadmin@example.com',
    password: 'password123',
    passwordConfirm: 'password123',
    phone: '3456789012',
    role: 'admin'
  });
  
  return { testUser, testStylist, testAdmin };
};

/**
 * Creates a JWT token for a user
 */
exports.generateToken = (user) => {
  return jwt.sign({ id: user._id }, process.env.JWT_SECRET || 'test-secret-key', {
    expiresIn: process.env.JWT_EXPIRES_IN || '1d'
  });
};

/**
 * Creates test services for different categories
 */
exports.createTestServices = async () => {
  const services = [];
  
  // Create a manicure service
  services.push(await Service.create({
    name: 'Basic Manicure',
    description: 'A classic manicure service',
    duration: 30,
    price: 25,
    category: 'manicure'
  }));
  
  // Create a pedicure service
  services.push(await Service.create({
    name: 'Luxury Pedicure',
    description: 'A relaxing pedicure treatment',
    duration: 45,
    price: 40,
    category: 'pedicure'
  }));
  
  // Create a nail-art service
  services.push(await Service.create({
    name: 'Custom Nail Art',
    description: 'Creative designs for your nails',
    duration: 60,
    price: 55,
    category: 'nail-art'
  }));
  
  return services;
};

/**
 * Creates test appointments
 */
exports.createTestAppointments = async (user, stylist, service) => {
  // Create a future appointment
  const futureDate = new Date();
  futureDate.setDate(futureDate.getDate() + 3);
  
  const appointment = await Appointment.create({
    service: service._id,
    user: user._id, 
    stylist: stylist._id,
    price: service.price,
    appointmentDate: futureDate,
    status: 'pending'
  });
  
  return appointment;
};

/**
 * Cleans up the database
 */
exports.cleanupDatabase = async () => {
  await User.deleteMany({});
  await Service.deleteMany({});
  await Appointment.deleteMany({});
};
