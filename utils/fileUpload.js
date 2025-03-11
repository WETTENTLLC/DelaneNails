const multer = require('multer');
const AppError = require('./appError');
const path = require('path');
const fs = require('fs');

// Create storage directories if they don't exist
const createStorageDirs = () => {
  const dirs = [
    path.join(__dirname, '..', 'public'),
    path.join(__dirname, '..', 'public', 'img'),
    path.join(__dirname, '..', 'public', 'img', 'users'),
    path.join(__dirname, '..', 'public', 'img', 'tours')
  ];
  
  dirs.forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  });
};

// Create directories on module load
createStorageDirs();

// Configure multer storage
const multerStorage = multer.memoryStorage();

// Filter out non-image files
const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image')) {
    cb(null, true);
  } else {
    cb(new AppError('Not an image! Please upload only images.', 400), false);
  }
};

const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter
});

/**
 * File upload utilities
 */
const fileUpload = {
  /**
   * Upload a single file
   * @param {String} fieldName - The form field name for the file
   * @returns {Function} Express middleware for single file upload
   */
  uploadSingle(fieldName) {
    return upload.single(fieldName);
  },
  
  /**
   * Upload multiple files
   * @param {String} fieldName - The form field name for the files
   * @param {Number} maxCount - Maximum number of files to upload
   * @returns {Function} Express middleware for multiple file upload
   */
  uploadMultiple(fieldName, maxCount) {
    return upload.array(fieldName, maxCount);
  },
  
  /**
   * Upload files from multiple fields
   * @param {Array<Object>} fields - Array of objects with name and maxCount
   * @returns {Function} Express middleware for fields file upload
   */
  uploadFields(fields) {
    return upload.fields(fields);
  }
};

module.exports = fileUpload;
