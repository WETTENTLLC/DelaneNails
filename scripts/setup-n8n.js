/**
 * Script to help set up n8n integration with DelaneNails
 */
const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Configuration paths
const configDir = path.join(__dirname, '..', 'config');
const n8nConfigPath = path.join(configDir, 'n8n.config.js');
const workflowsDir = path.join(__dirname, '..', 'workflows');
const envPath = path.join(__dirname, '..', '.env');

/**
 * Check if n8n is installed globally
 */
async function checkN8nInstallation() {
  console.log('Checking n8n installation...');
  
  return new Promise((resolve) => {
    const npm = spawn('npm', ['list', '-g', 'n8n']);
    
    npm.stdout.on('data', (data) => {
      if (data.toString().includes('n8n@')) {
        console.log('✅ n8n is installed globally');
        resolve(true);
      }
    });
    
    npm.on('close', (code) => {
      if (code !== 0) {
        console.log('❌ n8n is not installed globally');
        resolve(false);
      }
    });
  });
}

/**
 * Install n8n if not already installed
 */
async function installN8n() {
  const installed = await checkN8nInstallation();
  
  if (!installed) {
    console.log('Installing n8n globally...');
    
    return new Promise((resolve, reject) => {
      const install = spawn('npm', ['install', '-g', 'n8n']);
      
      install.stdout.on('data', (data) => {
        console.log(data.toString());
      });
      
      install.stderr.on('data', (data) => {
        console.error(data.toString());
      });
      
      install.on('close', (code) => {
        if (code === 0) {
          console.log('✅ n8n installed successfully');
          resolve(true);
        } else {
          console.error('❌ Failed to install n8n');
          reject(new Error('Failed to install n8n'));
        }
      });
    });
  }
  
  return Promise.resolve(true);
}

/**
 * Get API configuration from user
 */
async function getApiConfig() {
  return new Promise((resolve) => {
    rl.question('Enter your DelaneNails API URL (e.g., https://api.delanenails.com): ', (apiUrl) => {
      rl.question('Enter your DelaneNails API key: ', (apiKey) => {
        resolve({ apiUrl, apiKey });
      });
    });
  });
}

/**
 * Update .env file with n8n configuration
 */
async function updateEnvFile(config) {
  console.log('Updating environment variables...');
  
  try {
    let envContent = '';
    
    // Read existing .env file if it exists
    try {
      envContent = fs.readFileSync(envPath, 'utf8');
    } catch (error) {
      // File doesn't exist, create it
      console.log('Creating new .env file...');
    }
    
    // Check if variables already exist in .env
    const hasApiUrl = envContent.includes('DELANENAILS_API_URL=');
    const hasApiKey = envContent.includes('DELANENAILS_API_KEY=');
    
    // Prepare new content
    let newContent = envContent;
    
    if (!envContent.endsWith('\n') && envContent.length > 0) {
      newContent += '\n';
    }
    
    if (!hasApiUrl) {
      newContent += `DELANENAILS_API_URL=${config.apiUrl}\n`;
    } else {
      newContent = newContent.replace(
        /DELANENAILS_API_URL=.*/,
        `DELANENAILS_API_URL=${config.apiUrl}`
      );
    }
    
    if (!hasApiKey) {
      newContent += `DELANENAILS_API_KEY=${config.apiKey}\n`;
    } else {
      newContent = newContent.replace(
        /DELANENAILS_API_KEY=.*/,
        `DELANENAILS_API_KEY=${config.apiKey}`
      );
    }
    
    // Add n8n webhook URL if provided
    if (config.webhookUrl) {
      const hasWebhookUrl = envContent.includes('N8N_WEBHOOK_URL=');
      
      if (!hasWebhookUrl) {
        newContent += `N8N_WEBHOOK_URL=${config.webhookUrl}\n`;
      } else {
        newContent = newContent.replace(
          /N8N_WEBHOOK_URL=.*/,
          `N8N_WEBHOOK_URL=${config.webhookUrl}`
        );
      }
    }
    
    // Write updated content
    fs.writeFileSync(envPath, newContent);
    console.log('✅ Environment variables updated');
  } catch (error) {
    console.error('❌ Failed to update environment variables:', error.message);
    throw error;
  }
}

/**
 * Create n8n configuration file
 */
async function createN8nConfig(config) {
  console.log('Creating n8n configuration file...');
  
  try {
    // Ensure config directory exists
    if (!fs.existsSync(configDir)) {
      fs.mkdirSync(configDir, { recursive: true });
    }
    
    // Create configuration content
    const configContent = `/**
 * n8n integration configuration
 */
module.exports = {
  apiUrl: '${config.apiUrl}',
  webhookUrlBase: '${config.webhookUrl || 'http://localhost:5678/webhook/'}',
  workflows: {
    dataImport: 'import',
    dataExport: 'export',
    notifications: 'notifications',
    dataSynchronization: 'sync'
  }
};
`;
    
    // Write configuration file
    fs.writeFileSync(n8nConfigPath, configContent);
    console.log('✅ n8n configuration file created');
  } catch (error) {
    console.error('❌ Failed to create n8n configuration file:', error.message);
    throw error;
  }
}

/**
 * Create or update URL file for n8n workflow
 */
async function createWorkflowUrlFile(config) {
  console.log('Creating workflow URL file...');
  
  try {
    // Ensure workflows directory exists
    if (!fs.existsSync(workflowsDir)) {
      fs.mkdirSync(workflowsDir, { recursive: true });
    }
    
    // Create URL file content
    const urlFilePath = path.join(workflowsDir, 'n8n-data-import.url');
    const urlContent = `[InternetShortcut]
URL=${config.webhookUrl || 'http://localhost:5678/workflow/edit/1'}
IconFile=https://n8n.io/favicon.ico
IconIndex=0
`;
    
    // Write URL file
    fs.writeFileSync(urlFilePath, urlContent);
    console.log('✅ Workflow URL file created');
  } catch (error) {
    console.error('❌ Failed to create workflow URL file:', error.message);
    throw error;
  }
}

/**
 * Main setup function
 */
async function setup() {
  try {
    console.log('🔧 Setting up n8n integration for DelaneNails...');
    
    // Check/Install n8n
    await installN8n();
    
    // Get API configuration
    const apiConfig = await getApiConfig();
    
    // Get n8n webhook URL (optional)
    const webhookUrl = await new Promise((resolve) => {
      rl.question('Enter your n8n webhook URL (optional, press Enter to skip): ', (url) => {
        resolve(url || null);
      });
    });
    
    const config = {
      ...apiConfig,
      webhookUrl
    };
    
    // Update files
    await updateEnvFile(config);
    await createN8nConfig(config);
    await createWorkflowUrlFile(config);
    
    console.log('\n✅ n8n integration setup completed!');
    console.log('\nNext steps:');
    console.log('1. Start n8n with: n8n start');
    console.log('2. Import the workflow from: workflows/n8n-import-workflow.json');
    console.log('3. Configure the webhook URL in n8n');
    console.log('4. Test the integration with your API');
    
    rl.close();
  } catch (error) {
    console.error('❌ Setup failed:', error.message);
    rl.close();
    process.exit(1);
  }
}

// Run setup if called directly
if (require.main === module) {
  setup();
}

module.exports = { setup };
