// Jest setup file

// Extend Jest with custom matchers
expect.extend({
  toBeWithinRange(received, floor, ceiling) {
    const pass = received >= floor && received <= ceiling;
    if (pass) {
      return {
        message: () => `expected ${received} not to be within range ${floor} - ${ceiling}`,
        pass: true,
      };
    } else {
      return {
        message: () => `expected ${received} to be within range ${floor} - ${ceiling}`,
        pass: false,
      };
    }
  },
});

// Set up global test timeout
jest.setTimeout(30000);

// Mock global fetch for API tests
global.fetch = jest.fn();

// Console error/warning control
const originalConsoleError = console.error;
const originalConsoleWarn = console.warn;

console.error = message => {
  if (
    typeof message === 'string' && 
    (message.includes('test was not wrapped in act') || 
     message.includes('not wrapped in act'))
  ) {
    return;
  }
  originalConsoleError(message);
};

console.warn = message => {
  if (
    typeof message === 'string' && 
    message.includes('componentWillReceiveProps has been renamed')
  ) {
    return;
  }
  originalConsoleWarn(message);
};

// Clean up mocks between tests
afterEach(() => {
  jest.clearAllMocks();
});
