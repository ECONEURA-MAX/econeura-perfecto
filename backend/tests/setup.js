/**
 * ECONEURA - Test Setup
 * Global test configuration and mocks
 */

// Load test environment variables
require('dotenv').config({ path: '.env.test' });

// Set test environment
process.env.NODE_ENV = 'test';
process.env.PORT = '8080';
process.env.USE_MOCK_DB = 'true';

// JWT secrets for testing
process.env.JWT_ACCESS_SECRET = 'test-access-secret-min-64-chars-for-jwt-testing-purposes-only';
process.env.JWT_REFRESH_SECRET = 'test-refresh-secret-min-64-chars-for-jwt-testing-purposes-only';
process.env.JWT_ACCESS_EXPIRY = '15m';
process.env.JWT_REFRESH_EXPIRY = '7d';

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

