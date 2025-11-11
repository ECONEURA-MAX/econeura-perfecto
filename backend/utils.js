/**
 * ECONEURA - Utilities
 * Helper functions comunes
 */

const crypto = require('crypto');

function correlationId() {
  return crypto.randomBytes(16).toString('hex');
}

module.exports = {
  correlationId
};
