const fs = require('fs').promises;
const path = require('path');

/**
 * Checks deployment settings and configuration
 */
async function runChecks() {
  console.log('🔍 Checking Deployment Settings');

  try {
    // Check for production configuration
    const configPath = path.join(__dirname, '..', 'config', 'config.js');
    try {
      await fs.access(configPath);
      console.log('✅ Main config file exists');
      
      const configContent = await fs.readFile(configPath, 'utf8');
      if (configContent.includes('production') && configContent.includes('development')) {
        console.log('✅ Environment-specific configurations detected');
      } else {
        console.warn('⚠️ No environment-specific configurations found');
        console.warn('   Consider adding separate production/development settings');
      }
    } catch (err) {
      console.warn('⚠️ Main config file not found');
      console.warn('   Consider creating a centralized config file');
    }
    
    // Check for environment variables
    const envPath = path.join(__dirname, '..', '.env');
    try {
      await fs.access(envPath);
      console.log('✅ .env file exists');
      
      // Check for gitignore entry
      try {
        const gitignorePath = path.join(__dirname, '..', '.gitignore');
        const gitignoreContent = await fs.readFile(gitignorePath, 'utf8');
        
        if (gitignoreContent.includes('.env')) {
          console.log('✅ .env file is properly ignored in git');
        } else {
          console.error('❌ .env file is not in .gitignore');
          console.error('   Add .env to .gitignore to prevent exposing sensitive data');
        }
      } catch (err) {
        console.warn('⚠️ No .gitignore file found');
      }
      
      // Check for example env file
      try {
        await fs.access(path.join(__dirname, '..', '.env.example'));
        console.log('✅ .env.example template file exists');
      } catch (err) {
        console.warn('⚠️ No .env.example template file found');
        console.warn('   Consider adding a template file for easier deployment');
      }
      
    } catch (err) {
      console.error('❌ .env file not found');
      console.error('   Create a .env file with necessary environment variables');
    }
    
    // Check for package.json scripts
    const packageJsonPath = path.join(__dirname, '..', 'package.json');
    try {
      const packageJson = JSON.parse(await fs.readFile(packageJsonPath, 'utf8'));
      const scripts = packageJson.scripts || {};
      
      // Check for start script
      if (scripts.start) {
        console.log('✅ start script found in package.json');
      } else {
        console.error('❌ No start script in package.json');
        console.error('   Add a start script for production deployment');
      }
      
      // Check for build script (if using a framework)
      if (scripts.build) {
        console.log('✅ build script found in package.json');
      } else {
        console.warn('⚠️ No build script in package.json');
        console.warn('   Add a build script if using a frontend framework');
      }
      
      // Check for deployment scripts
      const hasDeployScript = Object.keys(scripts).some(
        script => script.includes('deploy') || script.includes('prod')
      );
      
      if (hasDeployScript) {
        console.log('✅ Deployment script found in package.json');
      } else {
        console.warn('⚠️ No deployment script in package.json');
        console.warn('   Consider adding a deployment script');
      }
      
    } catch (err) {
      console.error('❌ Could not check package.json scripts');
    }
    
    // Check for Procfile (Heroku)
    const procfilePath = path.join(__dirname, '..', 'Procfile');
    try {
      await fs.access(procfilePath);
      console.log('✅ Procfile exists (for Heroku deployment)');
    } catch (err) {
      console.info('ℹ️ No Procfile found (only needed for Heroku deployment)');
    }
    
    // Check for deployment config files
    const deploymentFiles = [
      { name: 'vercel.json', platform: 'Vercel' },
      { name: 'netlify.toml', platform: 'Netlify' },
      { name: '.github/workflows/deploy.yml', platform: 'GitHub Actions' },
      { name: 'docker-compose.yml', platform: 'Docker' },
      { name: 'Dockerfile', platform: 'Docker' },
      { name: 'nginx.conf', platform: 'Nginx' },
      { name: 'pm2.config.js', platform: 'PM2' }
    ];
    
    let foundDeploymentFiles = false;
    
    for (const file of deploymentFiles) {
      try {
        await fs.access(path.join(__dirname, '..', file.name));
        console.log(`✅ ${file.name} found (${file.platform} deployment)`);
        foundDeploymentFiles = true;
      } catch (err) {
        // File not found, skip
      }
    }
    
    if (!foundDeploymentFiles) {
      console.warn('⚠️ No deployment configuration files found');
      console.warn('   Consider adding configuration for your target platform');
    }
    
    // Check for SSL/TLS certificates
    const sslDir = path.join(__dirname, '..', 'ssl');
    try {
      await fs.access(sslDir);
      const sslFiles = await fs.readdir(sslDir);
      
      if (sslFiles.some(file => file.includes('.key')) && 
          sslFiles.some(file => file.includes('.crt') || file.includes('.pem'))) {
        console.log('✅ SSL certificate files found');
        
        // Check if SSL certs are in .gitignore
        try {
          const gitignorePath = path.join(__dirname, '..', '.gitignore');
          const gitignoreContent = await fs.readFile(gitignorePath, 'utf8');
          
          if (gitignoreContent.includes('ssl/') || gitignoreContent.includes('*.key')) {
            console.log('✅ SSL certificates are properly ignored in git');
          } else {
            console.error('❌ SSL certificates might not be ignored in git');
            console.error('   Add ssl/ directory or *.key, *.pem patterns to .gitignore');
          }
        } catch (err) {
          // Gitignore check already handled above
        }
      } else {
        console.info('ℹ️ SSL directory exists but no certificate/key pair found');
      }
    } catch (err) {
      console