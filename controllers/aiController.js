const aiService = require('../services/aiService');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

/**
 * Handle user chat message and generate AI response
 */
exports.processMessage = catchAsync(async (req, res, next) => {
  const { message } = req.body;
  
  if (!message) {
    return next(new AppError('Please provide a message', 400));
  }
  
  const response = await aiService.generateResponse(message);
  
  res.status(200).json({
    status: 'success',
    data: {
      response
    }
  });
});

/**
 * Generate nail style recommendations based on user preferences
 */
exports.getNailRecommendations = catchAsync(async (req, res, next) => {
  const { color, occasion, length, shape, season } = req.body;
  
  const preferences = { color, occasion, length, shape, season };
  
  const recommendations = await aiService.recommendNailStyles(preferences);
  
  res.status(200).json({
    status: 'success',
    results: recommendations.length,
    data: {
      recommendations
    }
  });
});

/**
 * Answer questions about nail services and appointments
 */
exports.answerQuestion = catchAsync(async (req, res, next) => {
  const { question } = req.body;
  
  if (!question) {
    return next(new AppError('Please provide a question', 400));
  }
  
  const answer = await aiService.answerQuestion(question);
  
  res.status(200).json({
    status: 'success',
    data: {
      answer
    }
  });
});
