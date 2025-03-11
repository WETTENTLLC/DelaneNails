const express = require('express');
const tourController = require('../controllers/tourController');
const authMiddleware = require('../middleware/authMiddleware');
const { uploadMultiple } = require('../utils/fileUpload');

const router = express.Router();

// Public routes - specific routes must come BEFORE parameter routes
router.get('/stats', tourController.getTourStats);
router.get('/top-5', tourController.aliasTopTours, tourController.getAllTours);
router.get('/tours-within/:distance/center/:latlng', tourController.getToursWithin);
router.get('/distances/:latlng', tourController.getDistances);

// Standard routes
router.get('/', tourController.getAllTours);
router.get('/:id', tourController.checkTourId, tourController.getTour);

// Protected routes - only authenticated users
router.use(authMiddleware.protect);

router.post('/:id/bookings', tourController.checkTourId, tourController.bookTour);
router.post('/:id/reviews', tourController.checkTourId, tourController.addReview);

// Restricted to admin and tour guides
router.use(authMiddleware.restrictTo('admin', 'tour-guide'));

router.post('/', tourController.createTour);
router.patch('/:id', tourController.checkTourId, tourController.updateTour);
router.delete('/:id', tourController.checkTourId, tourController.deleteTour);
router.patch(
  '/:id/images',
  tourController.checkTourId,
  uploadMultiple('images', 5),
  tourController.handleTourImageUploads
);

module.exports = router;
