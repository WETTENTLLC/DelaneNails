const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({
  clientName: {
    type: String,
    required: [true, 'Client name is required'],
    trim: true
  },
  service: {
    type: String,
    required: [true, 'Service type is required'],
    trim: true
  },
  date: {
    type: Date,
    required: [true, 'Appointment date is required']
  },
  duration: {
    type: Number,
    required: [true, 'Duration in minutes is required'],
    min: [15, 'Duration must be at least 15 minutes']
  },
  phone: {
    type: String,
    required: [true, 'Phone number is required'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    trim: true,
    lowercase: true,
    match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please provide a valid email address']
  },
  notes: {
    type: String,
    trim: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Method to check if an appointment overlaps with existing ones
appointmentSchema.statics.checkOverlap = async function(appointmentData, excludeId = null) {
  const startTime = new Date(appointmentData.date);
  const endTime = new Date(startTime.getTime() + appointmentData.duration * 60000);
  
  const query = {
    date: {
      $lt: endTime
    },
    $expr: {
      $gt: [
        { $add: ['$date', { $multiply: ['$duration', 60000] }] },
        startTime
      ]
    }
  };
  
  // Exclude the current appointment if updating
  if (excludeId) {
    query._id = { $ne: excludeId };
  }
  
  const overlappingAppointment = await this.findOne(query);
  return overlappingAppointment;
};

const Appointment = mongoose.model('Appointment', appointmentSchema);

module.exports = Appointment;
