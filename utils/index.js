/**
 * Exports all check utilities for easy importing
 */

const runAllChecks = require('./runAllChecks');
const checkTourDependencies = require('./checkTourDependencies');
const checkAuthSystem = require('./checkAuthSystem');
const checkBookingSystem = require('./checkBookingSystem');
const checkReviewSystem = require('./checkReviewSystem');
const checkErrorAndSecurity = require('./checkErrorAndSecurity');
const checkImageHandling = require('./checkImageHandling');
const checkDatabaseConnection = require('./checkDatabaseConnection');
const checkAIAgent = require('./checkAIAgent');
const checkDeploymentSettings = require('./checkDeploymentSettings');

module.exports = {
  runAllChecks,
  checkTourDependencies,
  checkAuthSystem,
  checkBookingSystem,
  checkReviewSystem,
  checkErrorAndSecurity,
  checkImageHandling,
  checkDatabaseConnection,
  checkAIAgent,
  checkDeploymentSettings
};
