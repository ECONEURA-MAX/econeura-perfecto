/**
 * ECONEURA - JWT Service Tests
 * Testing JWT token generation and verification
 */

const {
  generateAccessToken,
  generateRefreshToken,
  generateTokenPair,
  verifyAccessToken,
  verifyRefreshToken,
  extractToken,
  decodeToken,
  isTokenExpired
} = require('../services/jwtService');

describe('JWT Service', () => {
  const testUserId = 'test-user-123';
  const testClaims = {
    email: 'test@econeura.com',
    name: 'Test User',
    role: 'user'
  };

  describe('generateAccessToken()', () => {
    it('should generate a valid access token', () => {
      const token = generateAccessToken(testUserId, testClaims);
      
      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
      expect(token.split('.')).toHaveLength(3); // JWT structure
    });

    it('should include user claims in token', () => {
      const token = generateAccessToken(testUserId, testClaims);
      const decoded = decodeToken(token);
      
      expect(decoded.userId).toBe(testUserId);
      expect(decoded.email).toBe(testClaims.email);
      expect(decoded.name).toBe(testClaims.name);
      expect(decoded.role).toBe(testClaims.role);
      expect(decoded.type).toBe('access');
    });
  });

  describe('generateRefreshToken()', () => {
    it('should generate a valid refresh token', () => {
      const token = generateRefreshToken(testUserId);
      
      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
      expect(token.split('.')).toHaveLength(3);
    });

    it('should include jti in refresh token', () => {
      const token = generateRefreshToken(testUserId);
      const decoded = decodeToken(token);
      
      expect(decoded.userId).toBe(testUserId);
      expect(decoded.type).toBe('refresh');
      expect(decoded.jti).toBeDefined();
      expect(typeof decoded.jti).toBe('string');
    });
  });

  describe('generateTokenPair()', () => {
    it('should generate both access and refresh tokens', () => {
      const result = generateTokenPair(testUserId, testClaims);
      
      expect(result).toHaveProperty('accessToken');
      expect(result).toHaveProperty('refreshToken');
      expect(result).toHaveProperty('expiresIn');
      expect(result).toHaveProperty('tokenType', 'Bearer');
    });

    it('should generate different tokens', () => {
      const result = generateTokenPair(testUserId, testClaims);
      
      expect(result.accessToken).not.toBe(result.refreshToken);
    });
  });

  describe('verifyAccessToken()', () => {
    it('should verify a valid access token', () => {
      const token = generateAccessToken(testUserId, testClaims);
      const decoded = verifyAccessToken(token);
      
      expect(decoded.userId).toBe(testUserId);
      expect(decoded.email).toBe(testClaims.email);
    });

    it('should reject an invalid token', () => {
      expect(() => {
        verifyAccessToken('invalid.token.here');
      }).toThrow();
    });

    it('should reject a refresh token as access token', () => {
      const refreshToken = generateRefreshToken(testUserId);
      
      expect(() => {
        verifyAccessToken(refreshToken);
      }).toThrow('Invalid token type');
    });
  });

  describe('verifyRefreshToken()', () => {
    it('should verify a valid refresh token', () => {
      const token = generateRefreshToken(testUserId);
      const decoded = verifyRefreshToken(token);
      
      expect(decoded.userId).toBe(testUserId);
      expect(decoded.type).toBe('refresh');
    });

    it('should reject an access token as refresh token', () => {
      const accessToken = generateAccessToken(testUserId, testClaims);
      
      expect(() => {
        verifyRefreshToken(accessToken);
      }).toThrow('Invalid token type');
    });
  });

  describe('extractToken()', () => {
    it('should extract token from Bearer header', () => {
      const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...';
      const result = extractToken(`Bearer ${token}`);
      
      expect(result).toBe(token);
    });

    it('should return null for missing header', () => {
      expect(extractToken(null)).toBeNull();
      expect(extractToken(undefined)).toBeNull();
    });

    it('should return null for invalid header format', () => {
      expect(extractToken('InvalidFormat')).toBeNull();
      expect(extractToken('Basic token123')).toBeNull();
    });
  });

  describe('decodeToken()', () => {
    it('should decode token without verification', () => {
      const token = generateAccessToken(testUserId, testClaims);
      const decoded = decodeToken(token);
      
      expect(decoded).toBeDefined();
      expect(decoded.userId).toBe(testUserId);
      expect(decoded.email).toBe(testClaims.email);
    });

    it('should return null for invalid token', () => {
      const result = decodeToken('invalid');
      expect(result).toBeNull();
    });
  });

  describe('isTokenExpired()', () => {
    it('should return false for fresh token', () => {
      const token = generateAccessToken(testUserId, testClaims);
      const expired = isTokenExpired(token);
      
      expect(expired).toBe(false);
    });

    it('should return true for invalid token', () => {
      const expired = isTokenExpired('invalid');
      
      expect(expired).toBe(true);
    });
  });
});

