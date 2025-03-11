const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const csv = require('csv-parser');
const xlsx = require('xlsx');
const axios = require('axios');
const dotenv = require('dotenv');

// Models
const Customer = require('../models/userModel');
const Service = require('../models/serviceModel');
const Booking = require('../models/bookingModel');
const Review = require('../models/reviewModel');
const Staff = require('../models/staffModel');
const Product = require('../models/productModel');

// Load environment variables
dotenv.config();

/**
 * Connect to database
 */
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.DATABASE_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('✅ Database connection successful');
  } catch (err) {
    console.error('❌ Database connection failed:', err.message);
    process.exit(1);
  }
};

/**
 * Clear existing data of specified type
 * 
 * @param {string} type - Type of data to clear
 */
const clearExistingData = async (type) => {
  console.log(`Clearing existing ${type} data...`);
  
  switch (type) {
    case 'customers':
      await Customer.deleteMany({ role: 'user' });
      break;
    case 'appointments':
      await Booking.deleteMany({});
      break;
    case 'services':
      await Service.deleteMany({});
      break;
    case 'products':
      await Product.deleteMany({});
      break;
    case 'staff':
      await Customer.deleteMany({ role: 'staff' });
      break;
    case 'reviews':
      await Review.deleteMany({});
      break;
    default:
      throw new Error(`Unknown data type: ${type}`);
  }
  
  console.log(`✅ Cleared existing ${type} data`);
};

/**
 * Read data from file
 * 
 * @param {string} source - Source format (csv, json, excel)
 * @param {string} filePath - Path to file
 * @returns {Array} Parsed data array
 */
const readDataFromFile = async (source, filePath) => {
  console.log(`Reading ${source} data from ${filePath}...`);
  
  if (!fs.existsSync(filePath)) {
    throw new Error(`File not found: ${filePath}`);
  }
  
  let data = [];
  
  switch (source) {
    case 'csv':
      return new Promise((resolve, reject) => {
        fs.createReadStream(filePath)
          .pipe(csv())
          .on('data', (row) => {
            data.push(row);
          })
          .on('end', () => {
            console.log(`✅ Read ${data.length} records from CSV`);
            resolve(data);
          })
          .on('error', (err) => {
            reject(err);
          });
      });
      
    case 'json':
      const jsonContent = fs.readFileSync(filePath, 'utf8');
      data = JSON.parse(jsonContent);
      console.log(`✅ Read ${data.length} records from JSON`);
      return data;
      
    case 'excel':
      const workbook = xlsx.readFile(filePath);
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      data = xlsx.utils.sheet_to_json(worksheet);
      console.log(`✅ Read ${data.length} records from Excel`);
      return data;
      
    default:
      throw new Error(`Unsupported source format: ${source}`);
  }
};

/**
 * Fetch data from API
 * 
 * @returns {Array} Data from API
 */
const fetchDataFromAPI = async () => {
  console.log('Fetching data from API...');
  
  try {
    const apiKey = process.env.API_KEY;
    if (!apiKey) {
      throw new Error('API key not found in environment variables');
    }
    
    const apiUrl = process.env.IMPORT_API_URL;
    if (!apiUrl) {
      throw new Error('API URL not found in environment variables');
    }
    
    const response = await axios.get(apiUrl, {
      headers: {
        'Authorization': `Bearer ${apiKey}`
      }
    });
    
    if (response.status !== 200) {
      throw new Error(`API returned status code ${response.status}`);
    }
    
    console.log(`✅ Fetched ${response.data.length} records from API`);
    return response.data;
  } catch (err) {
    throw new Error(`API fetch error: ${err.message}`);
  }
};

/**
 * Import data into database
 * 
 * @param {string} type - Type of data to import
 * @param {Array} data - Data to import
 */
const importData = async (type, data) => {
  console.log(`Importing ${data.length} ${type} records...`);
  
  try {
    switch (type) {
      case 'customers':
        await Customer.insertMany(data.map(item => ({
          ...item,
          role: 'user',
          password: item.password || 'changemeplease'
        })));
        break;
        
      case 'appointments':
        await Booking.insertMany(data);
        break;
        
      case 'services':
        await Service.insertMany(data);
        break;
        
      case 'products':
        await Product.insertMany(data);
        break;
        
      case 'staff':
        await Customer.insertMany(data.map(item => ({
          ...item,
          role: 'staff'
        })));
        break;
        
      case 'reviews':
        await Review.insertMany(data);
        break;
        
      default:
        throw new Error(`Unknown data type: ${type}`);
    }
    
    console.log(`✅ Successfully imported ${data.length} ${type} records`);
  } catch (err) {
    throw new Error(`Import error: ${err.message}`);
  }
};

/**
 * Verify imported data
 * 
 * @param {string} type - Type of data to verify
 */
const verifyImport = async (type) => {
  console.log(`Verifying ${type} import...`);
  
  let count;
  
  switch (type) {
    case 'customers':
      count = await Customer.countDocuments({ role: 'user' });
      break;
      
    case 'appointments':
      count = await Booking.countDocuments();
      break;
      
    case 'services':
      count = await Service.countDocuments();
      break;
      
    case 'products':
      count = await Product.countDocuments();
      break;
      
    case 'staff':
      count = await Customer.countDocuments({ role: 'staff' });
      break;
      
    case 'reviews':
      count = await Review.countDocuments();
      break;
      
    default:
      throw new Error(`Unknown data type: ${type}`);
  }
  
  console.log(`✅ Verified ${count} ${type} records in database`);
  return count;
};

/**
 * Main import function
 */
const runImport = async (options) => {
  try {
    console.log('🔄 Starting data import process...');
    console.log('Options:', options);
    
    const { source, type, file, clear } = options;
    
    // Connect to database
    await connectDB();
    
    // Clear existing data if requested
    if (clear === 'true') {
      await clearExistingData(type);
    }
    
    // Get data from source
    let importData;
    if (source === 'api') {
      importData = await fetchDataFromAPI();
    } else {
      importData = await readDataFromFile(source, file);
    }
    
    // Import data
    await importData(type, importData);
    
    // Verify import
    const count = await verifyImport(type);
    
    console.log(`✅ Import process complete. ${count} records imported.`);
    
    // Disconnect from database
    await mongoose.disconnect();
    console.log('Database connection closed');
  } catch (err) {
    console.error('❌ Import failed:', err.message);
    process.exit(1);
  }
};

// Parse command line arguments
const parseArgs = () => {
  const args = process.argv.slice(2);
  const options = {
    source: 'csv',
    type: null,
    file: null,
    clear: 'false'
  };
  
  args.forEach(arg => {
    if (arg.startsWith('--source=')) {
      options.source = arg.replace('--source=', '');
    } else if (arg.startsWith('--type=')) {
      options.type = arg.replace('--type=', '');
    } else if (arg.startsWith('--file=')) {
      options.file = arg.replace('--file=', '');
    } else if (arg.startsWith('--clear=')) {
      options.clear = arg.replace('--clear=', '');
    }
  });
  
  if (!options.type) {
    throw new Error('Type is required (--type=customers|appointments|services|products|staff|reviews)');
  }
  
  if (options.source !== 'api' && !options.file) {
    throw new Error('File path is required for non-API imports (--file=path/to/file)');
  }
  
  return options;
};

// Run import if called directly
if (require.main === module) {
  const options = parseArgs();
  runImport(options).catch(err => {
    console.error('Error in data import:', err);
    process.exit(1);
  });
}

module.exports = {
  runImport,
  verifyImport,
  clearExistingData,
  readDataFromFile,
  fetchDataFromAPI
};
