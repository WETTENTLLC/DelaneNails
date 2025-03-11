const mongoose = require('mongoose');
const fs = require('fs').promises;
const path = require('path');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config({ path: './.env' });

/**
 * Check database connection
 */
async function checkDBConnection() {
  console.log('🗄️  CHECKING DATABASE CONNECTION...\n');
  console.log('Checking database configuration...');
  
  // Check for database connection string
  if (!process.env.DATABASE_URL && !process.env.DATABASE) {
    console.error('❌ No database connection string found in environment variables');
    console.error('  Expected either DATABASE_URL or DATABASE to be set');
    return false;
  }
  
  const dbConnectionString = process.env.DATABASE_URL || process.env.DATABASE;
  
  // Check the database type
  let dbType = 'unknown';
  if (dbConnectionString.includes('mongodb')) {
    dbType = 'MongoDB';
  } else if (dbConnectionString.includes('postgres')) {
    dbType = 'PostgreSQL';
  } else if (dbConnectionString.includes('mysql')) {
    dbType = 'MySQL';
  }
  
  console.log(`✅ Database connection string found (${dbType})`);
  
  // Check for MongoDB-specific configuration
  if (dbType === 'MongoDB') {
    if (dbConnectionString.includes('<password>')) {
      if (!process.env.DATABASE_PASSWORD) {
        console.error('❌ Database connection string contains <password> placeholder but DATABASE_PASSWORD is not set');
        return false;
      } else {
        console.log('✅ DATABASE_PASSWORD environment variable is set');
      }
    }
  }
  
  // Try to connect to the database
  console.log('Attempting to connect to database...');
  
  try {
    // Format the connection string if needed
    let formattedConnectionString = dbConnectionString;
    if (dbConnectionString.includes('<password>') && process.env.DATABASE_PASSWORD) {
      formattedConnectionString = dbConnectionString.replace(
        '<password>',
        process.env.DATABASE_PASSWORD
      );
    }
    
    // Set connection options
    const connectionOptions = {
      useNewUrlParser: true,
      useUnifiedTopology: true
    };
    
    // Connect to database
    await mongoose.connect(formattedConnectionString, connectionOptions);
    
    console.log('✅ Successfully connected to database');
    
    // Check connection status
    const { host, port, name } = mongoose.connection;
    console.log(`  - Connected to: ${host}:${port}/${name}`);
    
    // Disconnect after testing
    await mongoose.disconnect();
    console.log('✅ Successfully disconnected from database');
    
    return true;
  } catch (err) {
    console.error(`❌ Failed to connect to database: ${err.message}`);
    return false;
  }
}

/**
 * Check database models
 */
async function checkDBModels() {
  console.log('\nChecking database models...');
  
  const modelsDir = path.join(__dirname, '..', 'models');
  
  try {
    // Check if models directory exists
    await fs.access(modelsDir);
    
    // List model files
    const files = await fs.readdir(modelsDir);
    const modelFiles = files.filter(file => file.endsWith('Model.js'));
    
    if (modelFiles.length === 0) {
      console.warn('⚠️  No model files found in models directory');
    } else {
      console.log(`✅ Found ${modelFiles.length} model files: ${modelFiles.join(', ')}`);
      
      // Check basic structure of each model
      for (const modelFile of modelFiles) {
        const modelPath = path.join(modelsDir, modelFile);
        const modelContent = await fs.readFile(modelPath, 'utf-8');
        
        // Check for common model patterns
        const hasSchema = modelContent.includes('mongoose.Schema');
        const hasModel = modelContent.includes('mongoose.model');
        const hasIndexes = modelContent.includes('.index(');
        const hasMiddleware = modelContent.includes('.pre(') || modelContent.includes('.post(');
        
        console.log(`  - ${modelFile}:`);
        console.log(`    - Has schema: ${hasSchema ? '✅' : '❌'}`);
        console.log(`    - Has model: ${hasModel ? '✅' : '❌'}`);
        console.log(`    - Has indexes: ${hasIndexes ? '✅' : '❌'}`);
        console.log(`    - Has middleware: ${hasMiddleware ? '✅' : '❌'}`);
      }
    }
  } catch (err) {
    if (err.code === 'ENOENT') {
      console.error('❌ Models directory not found');
    } else {
      console.error('❌ Error checking models:', err.message);
    }
  }
}

/**
 * Check database seeding
 */
async function checkDBSeeding() {
  console.log('\nChecking database seeding capability...');
  
  // Check for seeder files
  const possibleSeederLocations = [
    path.join(__dirname, '..', 'seeder.js'),
    path.join(__dirname, '..', 'seeders'),
    path.join(__dirname, '..', 'dev-data', 'data'),
    path.join(__dirname, '..', 'data')
  ];
  
  let seederFound = false;
  
  for (const location of possibleSeederLocations) {
    try {
      await fs.access(location);
      
      if ((await fs.lstat(location)).isDirectory()) {
        const files = await fs.readdir(location);
        const jsonFiles = files.filter(file => file.endsWith('.json'));
        
        if (jsonFiles.length > 0) {
          console.log(`✅ Seed data found in ${location}: ${jsonFiles.join(', ')}`);
          seederFound = true;
        }
      } else if ((await fs.lstat(location)).isFile()) {
        console.log(`✅ Seeder script found: ${location}`);
        seederFound = true;
      }
    } catch (err) {
      // Location doesn't exist, continue to next one
    }
  }
  
  if (!seederFound) {
    console.warn('⚠️  No database seeder files or seed data found');
  }
  
  // Check for import/export script in package.json
  try {
    const packagePath = path.join(__dirname, '..', 'package.json');
    const packageContent = await fs.readFile(packagePath, 'utf-8');
    const packageJson = JSON.parse(packageContent);
    
    const hasImportScript = packageJson.scripts && 
                          (packageJson.scripts['import-data'] || 
                           packageJson.scripts['seed'] || 
                           packageJson.scripts['db:seed']);
    
    const hasDeleteScript = packageJson.scripts && 
                          (packageJson.scripts['delete-data'] || 
                           packageJson.scripts['unseed'] || 
                           packageJson.scripts['db:wipe']);
    
    if (hasImportScript) {
      console.log('✅ Import data script found in package.json');
    } else {
      console.warn('⚠️  No import data script found in package.json');
    }
    
    if (hasDeleteScript) {
      console.log('✅ Delete data script found in package.json');
    } else {
      console.warn('⚠️  No delete data script found in package.json');
    }
    
  } catch (err) {
    console.error('❌ Error checking package.json for seeding scripts:', err.message);
  }
}

/**
 * Checks database connection and models
 */
async function runChecks() {
  console.log('🔍 Checking Database Connection and Models');

  try {
    // Check for database configuration
    const dbConfigPath = path.join(__dirname, '..', 'config', 'database.js');
    try {
      await fs.access(dbConfigPath);
      console.log('✅ Database configuration file exists');
      
      const dbContent = await fs.readFile(dbConfigPath, 'utf8');
      
      // Check for MongoDB URI
      if (!dbContent.includes('MONGODB_URI') && !dbContent.includes('DB_URL')) {
        console.warn('⚠️ Database configuration might be missing MongoDB URI');
      } else {
        console.log('✅ MongoDB URI configuration detected');
      }
      
      // Check for connection options
      if (!dbContent.includes('useNewUrlParser') && !dbContent.includes('useUnifiedTopology')) {
        console.warn('⚠️ Database configuration might be missing recommended connection options');
      }
    } catch (err) {
      console.error('❌ Database configuration file not found');
      console.error('   Create a database config at /config/database.js');
    }
    
    // Check for core models
    const modelDir = path.join(__dirname, '..', 'models');
    try {
      const files = await fs.readdir(modelDir);
      
      const coreModels = ['userModel.js', 'serviceModel.js', 'bookingModel.js', 'reviewModel.js'];
      const missingModels = coreModels.filter(model => !files.includes(model));
      
      if (missingModels.length > 0) {
        console.warn(`⚠️ Missing core models: ${missingModels.join(', ')}`);
      } else {
        console.log('✅ All core models exist');
      }
      
      // Check if models are using Mongoose
      let hasMongooseIssue = false;
      for (const modelFile of files) {
        if (modelFile.endsWith('.js')) {
          const modelContent = await fs.readFile(path.join(modelDir, modelFile), 'utf8');
          if (!modelContent.includes('mongoose') || !modelContent.includes('Schema')) {
            console.warn(`⚠️ Model ${modelFile} might not be using Mongoose Schema`);
            hasMongooseIssue = true;
          }
        }
      }
      
      if (!hasMongooseIssue) {
        console.log('✅ All models appear to be using Mongoose properly');
      }
    } catch (err) {
      console.error('❌ Could not check model directory');
      console.error('   Create a models directory with required models');
    }
    
    // Check for database connection in app
    const appPath = path.join(__dirname, '..', 'app.js');
    try {
      const appContent = await fs.readFile(appPath, 'utf8');
      
      if (!appContent.includes('mongoose.connect')) {
        console.warn('⚠️ Database connection might be missing in app.js');
      } else {
        console.log('✅ Database connection detected in app.js');
      }
    } catch (err) {
      console.error('❌ Could not check app.js for database connection');
    }
    
    // Try to actually connect to the database
    try {
      // This is just a check - we won't actually connect
      console.log('ℹ️ Skipping live database connection test');
      console.log('   To test actual connection, run the database tests separately');
    } catch (err) {
      console.error('❌ Could not test database connection');
    }
  } catch (err) {
    console.error('❌ Failed to check database functionality:', err.message);
  }
}

module.exports = { runChecks };
