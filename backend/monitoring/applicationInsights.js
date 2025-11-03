const logger = require('../services/logger');
function initializeApplicationInsights() { return false; }
function isInitialized() { return false; }
function flush() { return Promise.resolve(); }
const requestTrackingMiddleware = (req, res, next) => { next(); };
module.exports = { initializeApplicationInsights, requestTrackingMiddleware, isInitialized, flush };
