const { setupDatabase } = require('../src/utils/database');
const { generateTestData } = require('./fixtures/testData');

// Configure the test environment
async function setupTestEnvironment() {
  // Use test configuration instead of production
  process.env.NODE_ENV = 'test';
  
  // Initialize test database
  const db = await setupDatabase({
    useTestCredentials: true,
    clearExistingData: true
  });
  
  // Load fixtures
  await generateTestData(db);
  
  return {
    db,
    teardown: async () => {
      // Clean up resources after tests
      await db.close();
    }
  };
}

module.exports = { setupTestEnvironment };
