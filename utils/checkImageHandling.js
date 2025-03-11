const fs = require('fs').promises;
const path = require('path');

/**
 * Checks image uploading and processing functionality
 */
async function runChecks() {
  console.log('🔍 Checking Image Handling');

  try {
    // Check for image upload middleware
    const uploadPath = path.join(__dirname, '..', 'utils', 'imageUpload.js');
    try {
      await fs.access(uploadPath);
      console.log('✅ Image upload utility file exists');
      
      const uploadContent = await fs.readFile(uploadPath, 'utf8');
      
      // Check for common image upload packages
      const hasUploadPackage = uploadContent.includes('multer') || 
                              uploadContent.includes('sharp') || 
                              uploadContent.includes('cloudinary');
                              
      if (!hasUploadPackage) {
        console.warn('⚠️ No image upload package detected in imageUpload.js');
        console.warn('   Consider using multer, sharp, or cloudinary for image handling');
      } else {
        console.log('✅ Image upload package detected');
      }
      
      // Check for image optimization
      if (!uploadContent.includes('resize') && !uploadContent.includes('transform')) {
        console.warn('⚠️ No image optimization or resizing detected');
        console.warn('   Consider adding image optimization for better performance');
      } else {
        console.log('✅ Image optimization functionality detected');
      }
    } catch (err) {
      console.error('❌ Image upload utility file not found');
      console.error('   Create an image upload utility at /utils/imageUpload.js');
    }
    
    // Check for public image directory
    const publicImgPath = path.join(__dirname, '..', 'public', 'img');
    try {
      await fs.access(publicImgPath);
      console.log('✅ Public image directory exists');
      
      // Check subdirectories
      const subdirs = ['nails', 'services', 'gallery', 'users'];
      const missingDirs = [];
      
      for (const dir of subdirs) {
        try {
          await fs.access(path.join(publicImgPath, dir));
        } catch {
          missingDirs.push(dir);
        }
      }
      
      if (missingDirs.length > 0) {
        console.warn(`⚠️ Missing image subdirectories: ${missingDirs.join(', ')}`);
        console.warn('   Consider creating these subdirectories for better organization');
      } else {
        console.log('✅ All recommended image subdirectories exist');
      }
    } catch (err) {
      console.warn('⚠️ Public image directory not found');
      console.warn('   Create an image directory at /public/img/');
    }
    
    // Check for image-related packages in package.json
    const packageJsonPath = path.join(__dirname, '..', 'package.json');
    try {
      const packageJson = JSON.parse(await fs.readFile(packageJsonPath, 'utf8'));
      const dependencies = { ...packageJson.dependencies, ...packageJson.devDependencies };
      
      const imagePackages = ['multer', 'sharp', 'cloudinary', 'aws-sdk'];
      const missingPackages = imagePackages.filter(pkg => !dependencies[pkg]);
      
      if (missingPackages.length === imagePackages.length) {
        console.warn('⚠️ No image processing packages detected in package.json');
        console.warn('   Consider adding packages like multer, sharp, or cloudinary');
      } else {
        console.log('✅ Image processing packages detected in package.json');
      }
    } catch (err) {
      console.error('❌ Could not check package.json for image packages');
    }
  } catch (err) {
    console.error('❌ Failed to check image handling:', err.message);
  }
}

module.exports = { runChecks };
