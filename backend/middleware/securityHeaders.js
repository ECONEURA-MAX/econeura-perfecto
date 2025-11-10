/**
 * Security Headers Middleware
 * Headers adicionales de seguridad más allá de helmet
 */

function securityHeadersMiddleware(req, res, next) {
  // HSTS (HTTP Strict Transport Security)
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  
  // Prevenir MIME sniffing
  res.setHeader('X-Content-Type-Options', 'nosniff');
  
  // XSS Protection
  res.setHeader('X-XSS-Protection', '1; mode=block');
  
  // Frame options (prevenir clickjacking)
  res.setHeader('X-Frame-Options', 'DENY');
  
  // Permissions Policy
  res.setHeader('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');
  
  // Referrer Policy
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  
  next();
}

module.exports = { securityHeadersMiddleware };

