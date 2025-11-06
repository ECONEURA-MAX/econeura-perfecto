/**
 * ECONEURA - Auth Middleware Tests
 * Testing authentication middleware
 */

const { authMiddleware, optionalAuthMiddleware, requireRole, requireAdmin } = require('../middleware/auth');
const { generateAccessToken } = require('../services/jwtService');

// Mock dependencies
jest.mock('../services/logger', () => ({
  warn: jest.fn(),
  error: jest.fn(),
  debug: jest.fn()
}));

jest.mock('../services/tokenStore', () => ({
  isTokenBlacklisted: jest.fn().mockResolvedValue(false)
}));

describe('Auth Middleware', () => {
  let mockReq;
  let mockRes;
  let mockNext;

  beforeEach(() => {
    mockReq = {
      headers: {},
      path: '/test',
      ip: '127.0.0.1'
    };
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis()
    };
    mockNext = jest.fn();
    jest.clearAllMocks();
  });

  describe('authMiddleware', () => {
    it('should authenticate valid token', async () => {
      const token = generateAccessToken('user-123', {
        email: 'test@econeura.com',
        name: 'Test User',
        role: 'user'
      });

      mockReq.headers.authorization = `Bearer ${token}`;

      await authMiddleware(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalled();
      expect(mockReq.user).toBeDefined();
      expect(mockReq.user.id).toBe('user-123');
      expect(mockReq.user.email).toBe('test@econeura.com');
    });

    it('should reject request without token', async () => {
      await authMiddleware(mockReq, mockRes, mockNext);

      expect(mockNext).not.toHaveBeenCalled();
      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          code: 'NO_TOKEN'
        })
      );
    });

    it('should reject invalid token', async () => {
      mockReq.headers.authorization = 'Bearer invalid-token';

      await authMiddleware(mockReq, mockRes, mockNext);

      expect(mockNext).not.toHaveBeenCalled();
      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          code: 'INVALID_TOKEN'
        })
      );
    });
  });

  describe('optionalAuthMiddleware', () => {
    it('should attach user if token is valid', async () => {
      const token = generateAccessToken('user-123', {
        email: 'test@econeura.com',
        name: 'Test User'
      });

      mockReq.headers.authorization = `Bearer ${token}`;

      await optionalAuthMiddleware(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalled();
      expect(mockReq.user).toBeDefined();
      expect(mockReq.user.id).toBe('user-123');
    });

    it('should continue without user if no token', async () => {
      await optionalAuthMiddleware(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalled();
      expect(mockReq.user).toBeUndefined();
    });

    it('should continue without user if token is invalid', async () => {
      mockReq.headers.authorization = 'Bearer invalid-token';

      await optionalAuthMiddleware(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalled();
      expect(mockReq.user).toBeUndefined();
    });
  });

  describe('requireRole', () => {
    it('should allow user with correct role', () => {
      mockReq.user = {
        id: 'user-123',
        role: 'admin'
      };

      const middleware = requireRole('admin', 'superadmin');
      middleware(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalled();
    });

    it('should reject user without authentication', () => {
      const middleware = requireRole('admin');
      middleware(mockReq, mockRes, mockNext);

      expect(mockNext).not.toHaveBeenCalled();
      expect(mockRes.status).toHaveBeenCalledWith(401);
    });

    it('should reject user with wrong role', () => {
      mockReq.user = {
        id: 'user-123',
        role: 'user'
      };

      const middleware = requireRole('admin');
      middleware(mockReq, mockRes, mockNext);

      expect(mockNext).not.toHaveBeenCalled();
      expect(mockRes.status).toHaveBeenCalledWith(403);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          code: 'FORBIDDEN'
        })
      );
    });
  });

  describe('requireAdmin', () => {
    it('should allow admin user', () => {
      mockReq.user = {
        id: 'admin-123',
        role: 'admin'
      };

      requireAdmin(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalled();
    });

    it('should reject non-admin user', () => {
      mockReq.user = {
        id: 'user-123',
        role: 'user'
      };

      requireAdmin(mockReq, mockRes, mockNext);

      expect(mockNext).not.toHaveBeenCalled();
      expect(mockRes.status).toHaveBeenCalledWith(403);
    });
  });
});

