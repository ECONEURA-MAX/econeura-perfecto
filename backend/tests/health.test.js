/**
 * ECONEURA - Health Check Tests
 * Enterprise-grade health monitoring tests
 */

const request = require('supertest');
const express = require('express');
const healthRouter = require('../api/health');

// Mock app
const app = express();
app.use('/api/health', healthRouter);

describe('Health Check Endpoint', () => {
  describe('GET /api/health', () => {
    it('should return 200 and health status', async () => {
      const response = await request(app)
        .get('/api/health')
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body).toHaveProperty('status');
      expect(response.body).toHaveProperty('timestamp');
      expect(response.body).toHaveProperty('uptime');
      expect(response.body).toHaveProperty('service', 'econeura-backend');
      expect(response.body).toHaveProperty('version');
      expect(response.body).toHaveProperty('checks');
    });

    it('should have valid timestamp format', async () => {
      const response = await request(app)
        .get('/api/health')
        .expect(200);

      const timestamp = new Date(response.body.timestamp);
      expect(timestamp.toISOString()).toBe(response.body.timestamp);
    });

    it('should have positive uptime', async () => {
      const response = await request(app)
        .get('/api/health')
        .expect(200);

      expect(response.body.uptime).toBeGreaterThan(0);
    });

    it('should include database check', async () => {
      const response = await request(app)
        .get('/api/health')
        .expect(200);

      expect(response.body.checks).toHaveProperty('database');
      expect(response.body.checks.database).toHaveProperty('status');
      expect(response.body.checks.database).toHaveProperty('responseTime');
    });

    it('should include redis check', async () => {
      const response = await request(app)
        .get('/api/health')
        .expect(200);

      expect(response.body.checks).toHaveProperty('redis');
      expect(response.body.checks.redis).toHaveProperty('status');
    });

    it('should respond within 2 seconds', async () => {
      const startTime = Date.now();
      await request(app)
        .get('/api/health')
        .expect(200);
      const duration = Date.now() - startTime;

      expect(duration).toBeLessThan(2000);
    });
  });

  describe('GET /api/health/live', () => {
    it('should return 200 for liveness probe', async () => {
      const response = await request(app)
        .get('/api/health/live')
        .expect(200);

      expect(response.body).toHaveProperty('status', 'alive');
      expect(response.body).toHaveProperty('timestamp');
    });

    it('should respond quickly (< 100ms)', async () => {
      const startTime = Date.now();
      await request(app)
        .get('/api/health/live')
        .expect(200);
      const duration = Date.now() - startTime;

      expect(duration).toBeLessThan(100);
    });
  });

  describe('GET /api/health/ready', () => {
    it('should return readiness status', async () => {
      const response = await request(app)
        .get('/api/health/ready')
        .expect(/2[0-9]{2}/); // 200-299 status code

      expect(response.body).toHaveProperty('status');
      expect(response.body).toHaveProperty('checks');
    });

    it('should check critical services', async () => {
      const response = await request(app)
        .get('/api/health/ready');

      if (response.status === 200) {
        expect(response.body.checks).toHaveProperty('database');
        expect(response.body.checks).toHaveProperty('redis');
      }
    });
  });
});

