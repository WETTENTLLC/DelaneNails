const express = require('express');
const aiController = require('../controllers/aiController');
const authController = require('../controllers/authController');

const router = express.Router();

// Public routes
router.post('/question', aiController.answerQuestion);

// Protected routes
router.use(authController.protect);
router.post('/message', aiController.processMessage);
router.post('/recommendations', aiController.getNailRecommendations);

module.exports = router;
