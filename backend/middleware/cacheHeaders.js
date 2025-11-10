/**
 * Cache Headers Middleware
 * Control de cache por tipo de endpoint
 */

function noCacheMiddleware(req, res, next) {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  res.setHeader('Surrogate-Control', 'no-store');
  next();
}

function cacheMiddleware(maxAge = 3600) {
  return (req, res, next) => {
    res.setHeader('Cache-Control', `public, max-age=${maxAge}`);
    next();
  };
}

module.exports = {
  noCacheMiddleware,
  cacheMiddleware
};

