const Appointment = require('../models/appointmentModel');
const Service = require('../models/serviceModel');
const User = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const factory = require('./handlerFactory');

exports.getAllAppointments = factory.getAll(Appointment);
exports.getAppointment = factory.getOne(Appointment);
exports.updateAppointment = factory.updateOne(Appointment);
exports.deleteAppointment = factory.deleteOne(Appointment);

exports.createAppointment = catchAsync(async (req, res, next) => {
  // Ensure required fields are provided
  if (!req.body.service) {
    return next(new AppError('Please select a service', 400));
  }
  if (!req.body.appointmentDate) {
    return next(new AppError('Please select an appointment date', 400));
  }
  if (!req.body.stylist) {
    return next(new AppError('Please select a stylist', 400));
  }
  
  // Check if service exists
  const service = await Service.findById(req.body.service);
  if (!service) {
    return next(new AppError('No service found with that ID', 404));
  }
  
  // Check if stylist exists and is actually a stylist
  const stylist = await User.findById(req.body.stylist);
  if (!stylist || stylist.role !== 'stylist') {
    return next(new AppError('No stylist found with that ID', 404));
  }
  
  // Set the price from the service
  req.body.price = service.price;
  
  // Set user to current logged in user
  if (!req.body.user) req.body.user = req.user.id;
  
  // Check for appointment conflicts
  const appointmentDate = new Date(req.body.appointmentDate);
  const appointmentEnd = new Date(appointmentDate.getTime() + service.duration * 60000);
  
  const conflictingAppointment = await Appointment.findOne({
    stylist: req.body.stylist,
    status: { $in: ['pending', 'confirmed'] },
    $or: [
      {
        appointmentDate: { 
          $lt: appointmentEnd,
          $gte: appointmentDate
        }
      },
      {
        appointmentDate: {
          $lte: appointmentDate
        },
        // Assuming we have endTime field or calculating it from appointmentDate + service.duration
        // This is a simplified check - would need refinement for production
      }
    ]
  });
  
  if (conflictingAppointment) {
    return next(new AppError('This time slot is already booked. Please select another time.', 400));
  }
  
  // Create appointment
  const appointment = await Appointment.create(req.body);
  
  res.status(201).json({
    status: 'success',
    data: {
      appointment
    }
  });
});

exports.getUserAppointments = catchAsync(async (req, res, next) => {
  const appointments = await Appointment.find({ user: req.user.id });
  
  res.status(200).json({
    status: 'success',
    results: appointments.length,
    data: {
      appointments
    }
  });
});

exports.getStylistSchedule = catchAsync(async (req, res, next) => {
  const stylistId = req.params.stylistId || req.user.id;
  const startDate = req.query.date ? new Date(req.query.date) : new Date();
  
  // Set time to beginning of day
  startDate.setHours(0, 0, 0, 0);
  
  // End date is 7 days after start date
  const endDate = new Date(startDate);
  endDate.setDate(endDate.getDate() + 7);
  
  const appointments = await Appointment.find({
    stylist: stylistId,
    appointmentDate: {
      $gte: startDate,
      $lt: endDate
    },
    status: { $in: ['pending', 'confirmed'] }
  }).sort('appointmentDate');
  
  res.status(200).json({
    status: 'success',
    data: {
      appointments
    }
  });
});

exports.updateAppointmentStatus = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const { status } = req.body;
  
  if (!['pending', 'confirmed', 'completed', 'cancelled'].includes(status)) {
    return next(new AppError('Invalid status value', 400));
  }
  
  const appointment = await Appointment.findByIdAndUpdate(
    id, 
    { status }, 
    { new: true, runValidators: true }
  );
  
  if (!appointment) {
    return next(new AppError('No appointment found with that ID', 404));
  }
  
  res.status(200).json({
    status: 'success',
    data: {
      appointment
    }
  });
});
