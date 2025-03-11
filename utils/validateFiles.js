const fs = require('fs').promises;
const path = require('path');
const { execSync } = require('child_process');

/**
 * Validates all project files for errors and structural issues
 */
async function validateFiles() {
  console.log('🔎 VALIDATING PROJECT FILES...\n');
  
  // Directories to skip
  const skipDirs = ['node_modules', '.git', 'public/img', 'logs', 'coverage', 'dist', 'build'];
  // File extensions to check
  const validExtensions = ['.js', '.json', '.html', '.css', '.pug', '.ejs'];
  
  const issues = [];
  
  /**
   * Scan directory recursively
   * @param {string} dir - Directory to scan
   * @returns {Promise<void>}
   */
  async function scanDirectory(dir) {
    try {
      const entries = await fs.readdir(dir, { withFileTypes: true });
      
      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        
        // Skip directories in the skipDirs list
        if (entry.isDirectory()) {
          const dirName = path.basename(fullPath);
          if (!skipDirs.includes(dirName)) {
            await scanDirectory(fullPath);
          }
          continue;
        }
        
        // Check only files with valid extensions
        const ext = path.extname(fullPath).toLowerCase();
        if (!validExtensions.includes(ext)) continue;
        
        // Validate file
        await validateFile(fullPath, ext);
      }
    } catch (error) {
      issues.push({
        path: dir,
        type: 'directory-error',
        message: `Error reading directory: ${error.message}`
      });
    }
  }
  
  /**
   * Validate a specific file
   * @param {string} filePath - Path to the file
   * @param {string} extension - File extension
   * @returns {Promise<void>}
   */
  async function validateFile(filePath, extension) {
    try {
      const content = await fs.readFile(filePath, 'utf8');
      
      // Skip empty files
      if (!content.trim()) {
        issues.push({
          path: filePath,
          type: 'empty-file',
          message: 'File is empty'
        });
        return;
      }
      
      // Validate JavaScript files
      if (extension === '.js') {
        validateJavaScript(filePath, content);
      }
      
      // Validate JSON files
      else if (extension === '.json') {
        validateJSON(filePath, content);
      }
      
      // Validate HTML files
      else if (extension === '.html') {
        validateHTML(filePath, content);
      }
      
      // Check for placeholder content
      checkForPlaceholderContent(filePath, content);
      
    } catch (error) {
      issues.push({
        path: filePath,
        type: 'file-error',
        message: `Error reading file: ${error.message}`
      });
    }
  }
  
  /**
   * Validate JavaScript file
   * @param {string} filePath - Path to the file
   * @param {string} content - File content
   */
  function validateJavaScript(filePath, content) {
    // Check for syntax errors
    try {
      // Use Node's built-in module to check syntax
      require('vm').runInNewContext(content, {}, { filename: filePath });
    } catch (error) {
      issues.push({
        path: filePath,
        type: 'js-syntax-error',
        message: `Syntax error: ${error.message}`,
        line: error.lineNumber
      });
    }
    
    // Check for common coding issues
    if (content.includes('console.log') && !filePath.includes('utils')) {
      issues.push({
        path: filePath,
        type: 'js-console-log',
        message: 'Production code should not contain console.log statements'
      });
    }
    
    if (content.includes('TODO') || content.includes('FIXME')) {
      issues.push({
        path: filePath,
        type: 'js-todo',
        message: 'File contains TODO or FIXME comments'
      });
    }
    
    // Check for hardcoded credentials
    const credRegexes = [
      /const\s+API_KEY\s*=\s*['"][^'"]+['"]/i,
      /const\s+SECRET\s*=\s*['"][^'"]+['"]/i,
      /password\s*:\s*['"][^'"]+['"]/i,
      /apiKey\s*:\s*['"][^'"]+['"]/i
    ];
    
    for (const regex of credRegexes) {
      if (regex.test(content)) {
        issues.push({
          path: filePath,
          type: 'js-hardcoded-credentials',
          message: 'Possible hardcoded credentials found'
        });
        break;
      }
    }
  }
  
  /**
   * Validate JSON file
   * @param {string} filePath - Path to the file
   * @param {string} content - File content
   */
  function validateJSON(filePath, content) {
    try {
      JSON.parse(content);
    } catch (error) {
      issues.push({
        path: filePath,
        type: 'json-syntax-error',
        message: `Invalid JSON: ${error.message}`
      });
    }
  }
  
  /**
   * Validate HTML file
   * @param {string} filePath - Path to the file
   * @param {string} content - File content
   */
  function validateHTML(filePath, content) {
    // Check for unclosed tags (very basic check)
    const openTags = content.match(/<[^\/!][^>]*>/g) || [];
    const closeTags = content.match(/<\/[^>]*>/g) || [];
    
    if (openTags.length !== closeTags.length) {
      issues.push({
        path: filePath,
        type: 'html-unclosed-tags',
        message: 'Possible unclosed HTML tags'
      });
    }
    
    // Check for placeholder content
    if (content.includes('Lorem ipsum') || 
        content.includes('placeholder') || 
        content.includes('dummy text')) {
      issues.push({
        path: filePath,
        type: 'html-placeholder',
        message: 'HTML contains placeholder text'
      });
    }
  }
  
  /**
   * Check for placeholder or demo content
   * @param {string} filePath - Path to the file
   * @param {string} content - File content
   */
  function checkForPlaceholderContent(filePath, content) {
    const placeholderPatterns = [
      'example.com',
      'example@',
      'placeholder',
      'REPLACE THIS',
      'YOUR_',
      'CHANGE_ME',
      'test123',
      'dummy',
      'demo user',
      'demo data',
      'demo mode'
    ];
    
    for (const pattern of placeholderPatterns) {
      if (content.toLowerCase().includes(pattern.toLowerCase())) {
        issues.push({
          path: filePath,
          type: 'placeholder-content',
          message: `File contains placeholder content: "${pattern}"`
        });
        break;
      }
    }
  }
  
  // Start validation from project root
  const rootDir = path.join(__dirname, '..');
  await scanDirectory(rootDir);
  
  // Print validation results
  console.log(`\n📋 VALIDATION RESULTS: Found ${issues.length} issues\n`);
  
  // Group issues by type
  const issuesByType = {};
  for (const issue of issues) {
    if (!issuesByType[issue.type]) {
      issuesByType[issue.type] = [];
    }
    issuesByType[issue.type].push(issue);
  }
  
  // Print issues by type
  for (const type in issuesByType) {
    const typeIssues = issuesByType[type];
    console.log(`\n🔹 ${type.toUpperCase()} (${typeIssues.length} issues):`);
    
    for (const issue of typeIssues) {
      const relativePath = path.relative(rootDir, issue.path);
      console.log(`  - ${relativePath}: ${issue.message}`);
    }
  }
  
  console.log('\n✅ File validation completed\n');
  
  return {
    totalIssues: issues.length,
    issuesByType,
    issues
  };
}

// Run the validation if called directly
if (require.main === module) {
  validateFiles().catch(err => {
    console.error('Error during file validation:', err);
    process.exit(1);
  });
}

module.exports = validateFiles;
