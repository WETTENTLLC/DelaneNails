const Service = require('../models/serviceModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const factory = require('./handlerFactory');

exports.getAllServices = factory.getAll(Service);
exports.getService = factory.getOne(Service, { path: 'reviews' });
exports.createService = factory.createOne(Service);
exports.updateService = factory.updateOne(Service);
exports.deleteService = factory.deleteOne(Service);

exports.getServicesByCategory = catchAsync(async (req, res, next) => {
  const category = req.params.category;
  
  if (!['manicure', 'pedicure', 'nail-art', 'extensions', 'special'].includes(category)) {
    return next(new AppError('Invalid category specified', 400));
  }
  
  const services = await Service.find({ category });
  
  res.status(200).json({
    status: 'success',
    results: services.length,
    data: {
      services
    }
  });
});

exports.getPopularServices = catchAsync(async (req, res, next) => {
  const services = await Service.find({ isPopular: true }).limit(5);
  
  res.status(200).json({
    status: 'success',
    results: services.length,
    data: {
      services
    }
  });
});
