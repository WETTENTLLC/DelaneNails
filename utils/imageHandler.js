const fs = require('fs').promises;
const path = require('path');
const multer = require('multer');
const AppError = require('./appError');

/**
 * Image storage and processing utility
 */
const imageHandler = {
  /**
   * Upload a single image
   * @param {Object} file - The file object from multer
   * @param {String} destination - The destination directory
   * @param {String} filename - The desired filename
   * @returns {Promise<String>} - The path to the saved file
   */
  async uploadImage(file, destination, filename) {
    try {
      const filePath = path.join(destination, filename);
      await fs.writeFile(filePath, file.buffer);
      return filePath;
    } catch (err) {
      throw new AppError('Error saving image', 500);
    }
  },
  
  /**
   * Delete an image
   * @param {String} imagePath - The path to the image to delete
   * @returns {Promise<void>}
   */
  async deleteImage(imagePath) {
    try {
      await fs.unlink(imagePath);
    } catch (err) {
      throw new AppError('Error deleting image', 500);
    }
  },
  
  /**
   * Process multiple images
   * @param {Array} files - The files array from multer
   * @param {String} destination - The destination directory
   * @param {String} prefix - The filename prefix
   * @returns {Promise<Array<String>>} - The paths to the saved files
   */
  async processMultipleImages(files, destination, prefix) {
    const imagePaths = [];
    
    for (let i = 0; i < files.length; i++) {
      const filename = `${prefix}-${Date.now()}-${i + 1}.jpeg`;
      const filePath = await this.uploadImage(files[i], destination, filename);
      imagePaths.push(filePath);
    }
    
    return imagePaths;
  },
  
  /**
   * Resize image (placeholder - would normally use sharp)
   */
  async resizeImage(file, width, height, quality) {
    // This would normally use sharp to resize images
    // For now, just return the original file
    return file;
  }
};

module.exports = imageHandler;
