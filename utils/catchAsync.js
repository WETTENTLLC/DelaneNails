/**
 * Wrapper function to catch async errors and pass them to the error handler
 * @param {Function} fn - Async function to wrap
 * @returns {Function} Express middleware function
 */
module.exports = fn => {
  return (req, res, next) => {
    fn(req, res, next).catch(next);
  };
};
