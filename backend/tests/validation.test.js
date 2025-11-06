/**
 * ECONEURA - Validation Middleware Tests
 * Input validation testing
 */

const Joi = require('joi');
const { validateBody, validateQuery, validateParams } = require('../middleware/validation');

// Mock request/response
const mockRequest = (data, type = 'body') => ({
  [type]: data,
  path: '/test'
});

const mockResponse = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

const mockNext = jest.fn();

describe('Validation Middleware', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('validateBody', () => {
    const schema = Joi.object({
      email: Joi.string().email().required(),
      age: Joi.number().min(18).max(120).required(),
      name: Joi.string().min(2).max(50).optional()
    });

    it('should pass validation with valid data', () => {
      const req = mockRequest({ email: 'test@example.com', age: 25 });
      const res = mockResponse();

      validateBody(schema)(req, res, mockNext);

      expect(mockNext).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
    });

    it('should reject invalid email', () => {
      const req = mockRequest({ email: 'invalid-email', age: 25 });
      const res = mockResponse();

      validateBody(schema)(req, res, mockNext);

      expect(mockNext).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          error: 'Validation failed',
          code: 'VALIDATION_ERROR'
        })
      );
    });

    it('should reject age below minimum', () => {
      const req = mockRequest({ email: 'test@example.com', age: 16 });
      const res = mockResponse();

      validateBody(schema)(req, res, mockNext);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          code: 'VALIDATION_ERROR',
          details: expect.arrayContaining([
            expect.objectContaining({
              field: 'age'
            })
          ])
        })
      );
    });

    it('should reject missing required fields', () => {
      const req = mockRequest({ name: 'John' });
      const res = mockResponse();

      validateBody(schema)(req, res, mockNext);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          code: 'VALIDATION_ERROR',
          details: expect.arrayContaining([
            expect.objectContaining({ field: 'email' }),
            expect.objectContaining({ field: 'age' })
          ])
        })
      );
    });

    it('should strip unknown fields', () => {
      const req = mockRequest({
        email: 'test@example.com',
        age: 25,
        unknownField: 'should be removed'
      });
      const res = mockResponse();

      validateBody(schema)(req, res, mockNext);

      expect(mockNext).toHaveBeenCalled();
      expect(req.body).not.toHaveProperty('unknownField');
    });
  });

  describe('validateQuery', () => {
    const schema = Joi.object({
      page: Joi.number().min(1).default(1),
      limit: Joi.number().min(1).max(100).default(10)
    });

    it('should validate query parameters', () => {
      const req = mockRequest({ page: '2', limit: '20' }, 'query');
      const res = mockResponse();

      validateQuery(schema)(req, res, mockNext);

      expect(mockNext).toHaveBeenCalled();
      expect(req.query.page).toBe(2);
      expect(req.query.limit).toBe(20);
    });

    it('should reject invalid query parameters', () => {
      const req = mockRequest({ page: 'invalid' }, 'query');
      const res = mockResponse();

      validateQuery(schema)(req, res, mockNext);

      expect(res.status).toHaveBeenCalledWith(400);
    });
  });

  describe('validateParams', () => {
    const schema = Joi.object({
      id: Joi.string().uuid().required()
    });

    it('should validate URL parameters', () => {
      const req = mockRequest(
        { id: '550e8400-e29b-41d4-a716-446655440000' },
        'params'
      );
      const res = mockResponse();

      validateParams(schema)(req, res, mockNext);

      expect(mockNext).toHaveBeenCalled();
    });

    it('should reject invalid UUID', () => {
      const req = mockRequest({ id: 'not-a-uuid' }, 'params');
      const res = mockResponse();

      validateParams(schema)(req, res, mockNext);

      expect(res.status).toHaveBeenCalledWith(400);
    });
  });
});

