/**
 * ECONEURA - Test Setup
 * Global test configuration and mocks
 */

// Set test environment
process.env.NODE_ENV = 'test';
process.env.PORT = '8080';
process.env.USE_MOCK_DB = 'true';

// Mock logger to avoid console spam during tests
jest.mock('../services/logger', () => ({
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
  debug: jest.fn()
}));

// Global test timeout
jest.setTimeout(10000);

// Clean up after all tests
afterAll(async () => {
  // Close any open connections
  await new Promise(resolve => setTimeout(resolve, 100));
});

