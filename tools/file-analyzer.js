const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

// Root directory of the project
const ROOT_DIR = path.resolve(__dirname, '..');
// Extensions to analyze
const EXTENSIONS = ['.js', '.css', '.html', '.jpg', '.png', '.svg'];
// Directories to exclude
const EXCLUDE_DIRS = ['node_modules', '.git', 'dist', 'build'];

// Store file hashes for duplicate detection
const fileHashes = new Map();
// Store results
const duplicateFiles = [];
const possiblyUnusedFiles = [];

// Calculate hash for file content
function getFileHash(content) {
  return crypto.createHash('md5').update(content).digest('hex');
}

// Process all files in directory recursively
function processDirectory(dir) {
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory()) {
      if (!EXCLUDE_DIRS.includes(file)) {
        processDirectory(fullPath);
      }
      return;
    }
    
    const ext = path.extname(file).toLowerCase();
    if (!EXTENSIONS.includes(ext)) {
      return;
    }
    
    try {
      const content = fs.readFileSync(fullPath);
      const hash = getFileHash(content);
      
      if (fileHashes.has(hash)) {
        duplicateFiles.push({
          original: fileHashes.get(hash),
          duplicate: fullPath
        });
      } else {
        fileHashes.set(hash, fullPath);
        
        // Check if JS or CSS file is referenced
        if (ext === '.js' || ext === '.css') {
          checkFileUsage(fullPath, file);
        }
      }
    } catch (error) {
      console.error(`Error processing ${fullPath}:`, error.message);
    }
  });
}

// Check if a file is referenced in HTML files
function checkFileUsage(filePath, fileName) {
  let isUsed = false;
  const relPath = path.relative(ROOT_DIR, filePath);
  
  // Search all HTML files for references
  function searchInDirectory(dir) {
    const files = fs.readdirSync(dir);
    
    for (const file of files) {
      const fullPath = path.join(dir, file);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory()) {
        if (!EXCLUDE_DIRS.includes(file)) {
          searchInDirectory(fullPath);
        }
        continue;
      }
      
      const ext = path.extname(file).toLowerCase();
      if (ext === '.html' || ext === '.js') {
        try {
          const content = fs.readFileSync(fullPath, 'utf8');
          if (content.includes(fileName) || content.includes(relPath)) {
            isUsed = true;
            return true;
          }
        } catch (error) {
          console.error(`Error checking usage in ${fullPath}:`, error.message);
        }
      }
    }
    return false;
  }
  
  if (!searchInDirectory(ROOT_DIR) && !filePath.includes('widget-doctor.js')) {
    possiblyUnusedFiles.push(filePath);
  }
}

// Start the analysis
console.log('Starting file analysis...');
processDirectory(ROOT_DIR);

// Print results
console.log('\n=== DUPLICATE FILES ===');
if (duplicateFiles.length === 0) {
  console.log('No duplicate files found.');
} else {
  duplicateFiles.forEach(({ original, duplicate }) => {
    console.log(`Original: ${original}`);
    console.log(`Duplicate: ${duplicate}`);
    console.log('---');
  });
}

console.log('\n=== POSSIBLY UNUSED FILES ===');
if (possiblyUnusedFiles.length === 0) {
  console.log('No unused files detected.');
} else {
  possiblyUnusedFiles.forEach(file => {
    console.log(file);
  });
}

console.log('\nAnalysis complete. Please verify results before deleting any files.');
