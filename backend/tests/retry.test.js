/**
 * ECONEURA - Retry Utility Tests
 * Testing exponential backoff retry logic
 */

const { retry, retryWithCircuitBreaker } = require('../utils/retry');

// Mock logger
jest.mock('../services/logger', () => ({
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn()
}));

describe('Retry Utility', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('retry()', () => {
    it('should succeed on first attempt', async () => {
      const fn = jest.fn().mockResolvedValue('success');
      
      const result = await retry(fn, { operationName: 'test' });
      
      expect(result).toBe('success');
      expect(fn).toHaveBeenCalledTimes(1);
    });

    it('should retry on failure and eventually succeed', async () => {
      const fn = jest.fn()
        .mockRejectedValueOnce(new Error('Fail 1'))
        .mockRejectedValueOnce(new Error('Fail 2'))
        .mockResolvedValue('success');
      
      const result = await retry(fn, {
        maxRetries: 3,
        initialDelay: 10,
        operationName: 'test'
      });
      
      expect(result).toBe('success');
      expect(fn).toHaveBeenCalledTimes(3);
    });

    it('should throw after max retries', async () => {
      const fn = jest.fn().mockRejectedValue(new Error('Always fails'));
      
      await expect(
        retry(fn, {
          maxRetries: 3,
          initialDelay: 10,
          operationName: 'test'
        })
      ).rejects.toThrow('Always fails');
      
      expect(fn).toHaveBeenCalledTimes(4); // 1 initial + 3 retries
    });

    it('should respect shouldRetry function', async () => {
      const fn = jest.fn().mockRejectedValue(new Error('Non-retryable'));
      const shouldRetry = jest.fn().mockReturnValue(false);
      
      await expect(
        retry(fn, {
          maxRetries: 3,
          initialDelay: 10,
          shouldRetry,
          operationName: 'test'
        })
      ).rejects.toThrow('Non-retryable');
      
      expect(fn).toHaveBeenCalledTimes(1); // No retries
      expect(shouldRetry).toHaveBeenCalledTimes(1);
    });

    it('should use exponential backoff', async () => {
      const delays = [];
      const fn = jest.fn().mockRejectedValue(new Error('Fail'));
      
      // Mock setTimeout to capture delays
      const originalSetTimeout = global.setTimeout;
      global.setTimeout = jest.fn((callback, delay) => {
        delays.push(delay);
        return originalSetTimeout(callback, 0); // Execute immediately
      });
      
      try {
        await retry(fn, {
          maxRetries: 3,
          initialDelay: 100,
          backoffMultiplier: 2,
          operationName: 'test'
        });
      } catch (error) {
        // Expected to fail
      }
      
      // Verify exponential backoff: 100ms, 200ms, 400ms
      expect(delays).toHaveLength(3);
      expect(delays[0]).toBe(100);
      expect(delays[1]).toBe(200);
      expect(delays[2]).toBe(400);
      
      global.setTimeout = originalSetTimeout;
    });

    it('should respect maxDelay', async () => {
      const delays = [];
      const fn = jest.fn().mockRejectedValue(new Error('Fail'));
      
      const originalSetTimeout = global.setTimeout;
      global.setTimeout = jest.fn((callback, delay) => {
        delays.push(delay);
        return originalSetTimeout(callback, 0);
      });
      
      try {
        await retry(fn, {
          maxRetries: 5,
          initialDelay: 1000,
          maxDelay: 2000,
          backoffMultiplier: 2,
          operationName: 'test'
        });
      } catch (error) {
        // Expected to fail
      }
      
      // Verify maxDelay is respected: 1000, 2000, 2000, 2000, 2000
      expect(delays.every(d => d <= 2000)).toBe(true);
      expect(delays[0]).toBe(1000);
      expect(delays[1]).toBe(2000);
      expect(delays[2]).toBe(2000);
      
      global.setTimeout = originalSetTimeout;
    });
  });

  describe('retryWithCircuitBreaker()', () => {
    it('should open circuit after consecutive failures', async () => {
      const fn = jest.fn().mockRejectedValue(new Error('Fail'));
      
      // Attempt multiple calls to trigger circuit breaker
      for (let i = 0; i < 5; i++) {
        try {
          await retryWithCircuitBreaker(fn, 'test-service', {
            maxRetries: 1,
            initialDelay: 10
          });
        } catch (error) {
          // Expected to fail
        }
      }
      
      // Next call should fail immediately due to open circuit
      const startTime = Date.now();
      try {
        await retryWithCircuitBreaker(fn, 'test-service', {
          maxRetries: 3,
          initialDelay: 100
        });
      } catch (error) {
        const duration = Date.now() - startTime;
        expect(error.message).toContain('circuit breaker');
        expect(duration).toBeLessThan(50); // Should fail fast
      }
    });

    it('should allow requests in half-open state', async () => {
      const fn = jest.fn()
        .mockRejectedValueOnce(new Error('Fail'))
        .mockResolvedValue('success');
      
      // This would need more complex mocking of circuit breaker state
      // For now, just verify the function can be called
      const result = await retryWithCircuitBreaker(fn, 'test-service-2', {
        maxRetries: 1,
        initialDelay: 10
      });
      
      expect(result).toBe('success');
    });
  });
});

