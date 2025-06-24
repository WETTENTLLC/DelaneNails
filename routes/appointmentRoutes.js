const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const Appointment = require('../models/appointment');

// Helper function to validate MongoDB ObjectId
const isValidObjectId = (id) => {
  return mongoose.Types.ObjectId.isValid(id);
};

// GET all appointments with optional date range filtering
router.get('/', async (req, res) => {
  try {
    let query = {};
    
    // Add date filtering if provided
    if (req.query.startDate || req.query.endDate) {
      query.date = {};
      
      if (req.query.startDate) {
        query.date.$gte = new Date(req.query.startDate);
      }
      
      if (req.query.endDate) {
        query.date.$lte = new Date(req.query.endDate);
      }
    }
    
    const appointments = await Appointment.find(query).sort({ date: 1 });
    res.status(200).json(appointments);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching appointments', error: error.message });
  }
});

// GET a specific appointment by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Validate ObjectId format
    if (!isValidObjectId(id)) {
      return res.status(400).json({ message: 'Invalid appointment ID format' });
    }
    
    const appointment = await Appointment.findById(id);
    
    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }
    
    res.status(200).json(appointment);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching appointment', error: error.message });
  }
});

// POST a new appointment
router.post('/', async (req, res) => {
  try {
    // Check for overlapping appointments
    const overlappingAppointment = await Appointment.checkOverlap(req.body);
    if (overlappingAppointment) {
      return res.status(409).json({ 
        message: 'This appointment time conflicts with an existing appointment',
        conflictingAppointment: overlappingAppointment
      });
    }
    
    const appointment = new Appointment(req.body);
    const savedAppointment = await appointment.save();
    
    res.status(201).json(savedAppointment);
  } catch (error) {
    // Handle validation errors
    if (error.name === 'ValidationError') {
      return res.status(400).json({ 
        message: 'Invalid appointment data', 
        errors: Object.values(error.errors).map(err => err.message)
      });
    }
    res.status(500).json({ message: 'Error creating appointment', error: error.message });
  }
});

// PUT update an existing appointment
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Validate ObjectId format
    if (!isValidObjectId(id)) {
      return res.status(400).json({ message: 'Invalid appointment ID format' });
    }
    
    const appointment = await Appointment.findById(id);
    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }
    
    // If date or duration changed, check for overlaps
    if ((req.body.date || req.body.duration) && 
        (String(req.body.date) !== String(appointment.date) || req.body.duration !== appointment.duration)) {
      
      const appointmentData = {
        ...appointment.toObject(),
        ...req.body
      };
      
      const overlappingAppointment = await Appointment.checkOverlap(appointmentData, id);
      if (overlappingAppointment) {
        return res.status(409).json({ 
          message: 'This appointment time conflicts with an existing appointment',
          conflictingAppointment: overlappingAppointment
        });
      }
    }
    
    // Update and validate
    Object.keys(req.body).forEach(key => {
      appointment[key] = req.body[key];
    });
    
    const updatedAppointment = await appointment.save();
    res.status(200).json(updatedAppointment);
  } catch (error) {
    // Handle validation errors
    if (error.name === 'ValidationError') {
      return res.status(400).json({ 
        message: 'Invalid appointment data', 
        errors: Object.values(error.errors).map(err => err.message)
      });
    }
    res.status(500).json({ message: 'Error updating appointment', error: error.message });
  }
});

// DELETE an appointment
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Validate ObjectId format
    if (!isValidObjectId(id)) {
      return res.status(400).json({ message: 'Invalid appointment ID format' });
    }
    
    const appointment = await Appointment.findByIdAndDelete(id);
    
    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }
    
    res.status(200).json({ message: 'Appointment deleted successfully', appointment });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting appointment', error: error.message });
  }
});

module.exports = router;
