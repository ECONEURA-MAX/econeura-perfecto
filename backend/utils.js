/**
 * ECONEURA MAX PREMIUM - Utility Functions
 * Funciones de utilidad para servicios automáticos
 */

/**
 * Generar ID de correlación único
 */
function correlationId() {
  return 'corr_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}

/**
 * Obtener timestamp ISO actual
 */
function nowIso() {
  return new Date().toISOString();
}

/**
 * Generar ID único
 */
function generateId(prefix = 'id') {
  return prefix + '-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
}

/**
 * Validar email
 */
function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Sanitizar string
 */
function sanitizeString(str) {
  if (typeof str !== 'string') return '';
    return str.replace(/[<>"'&]/g, function(match) {
    switch (match) {
      case '<': return '&lt;';
      case '>': return '&gt;';
      case '"': return '&quot;';
      case "'": return '&#x27;';
      case '&': return '&amp;';
      default: return match;
    }
  });
}

/**
 * Formatear fecha
 */
function formatDate(date, format = 'iso') {
  const d = new Date(date);
  
  switch (format) {
    case 'iso':
      return d.toISOString();
    case 'date':
      return d.toLocaleDateString();
    case 'datetime':
      return d.toLocaleString();
    case 'time':
      return d.toLocaleTimeString();
    default:
      return d.toString();
  }
}

/**
 * Calcular diferencia de tiempo en minutos
 */
function timeDiffMinutes(startTime, endTime) {
  const start = new Date(startTime);
  const end = new Date(endTime);
  return Math.floor((end - start) / (1000 * 60));
}

/**
 * Generar hash simple
 */
function simpleHash(str) {
  let hash = 0;
  if (str.length === 0) return hash.toString();
  
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  
  return Math.abs(hash).toString(36);
}

/**
 * Validar objeto requerido
 */
function validateRequired(obj, requiredFields) {
  const missing = [];
  
  requiredFields.forEach(field => {
    if (!obj[field]) {
      missing.push(field);
    }
  });
  
  return {
    valid: missing.length === 0,
    missing
  };
}

/**
 * Retry con backoff exponencial
 */
async function retryWithBackoff(fn, maxRetries = 3, baseDelay = 1000) {
  let lastError;
  
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      
      if (i === maxRetries - 1) {
        throw lastError;
      }
      
      const delay = baseDelay * Math.pow(2, i);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
}

/**
 * Debounce function
 */
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

/**
 * Throttle function
 */
function throttle(func, limit) {
  let inThrottle;
  return function(...args) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}

/**
 * Deep clone object
 */
function deepClone(obj) {
  if (obj === null || typeof obj !== 'object') return obj;
  if (obj instanceof Date) return new Date(obj.getTime());
  if (obj instanceof Array) return obj.map(item => deepClone(item));
  if (typeof obj === 'object') {
    const clonedObj = {};
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        clonedObj[key] = deepClone(obj[key]);
      }
    }
    return clonedObj;
  }
}

/**
 * Merge objects deeply
 */
function deepMerge(target, source) {
  const result = deepClone(target);
  
  for (const key in source) {
    if (source.hasOwnProperty(key)) {
      if (typeof source[key] === 'object' && source[key] !== null && !Array.isArray(source[key])) {
        result[key] = deepMerge(result[key] || {}, source[key]);
      } else {
        result[key] = source[key];
      }
    }
  }
  
  return result;
}

/**
 * Sleep function
 */
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Random string generator
 */
function randomString(length = 10) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  
  return result;
}

/**
 * Parse JSON safely
 */
function safeJsonParse(str, defaultValue = null) {
  try {
    return JSON.parse(str);
  } catch (error) {
    return defaultValue;
  }
}

/**
 * Stringify JSON safely
 */
function safeJsonStringify(obj, defaultValue = '{}') {
  try {
    return JSON.stringify(obj);
  } catch (error) {
    return defaultValue;
  }
}

/**
 * Check if value is empty
 */
function isEmpty(value) {
  if (value === null || value === undefined) return true;
  if (typeof value === 'string') return value.trim().length === 0;
  if (Array.isArray(value)) return value.length === 0;
  if (typeof value === 'object') return Object.keys(value).length === 0;
  return false;
}

/**
 * Capitalize first letter
 */
function capitalize(str) {
  if (typeof str !== 'string' || str.length === 0) return str;
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * Convert to camelCase
 */
function toCamelCase(str) {
  return str.replace(/([-_][a-z])/gi, ($1) => {
    return $1.toUpperCase().replace('-', '').replace('_', '');
  });
}

/**
 * Convert to snake_case
 */
function toSnakeCase(str) {
  return str.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
}

/**
 * Convert to kebab-case
 */
function toKebabCase(str) {
  return str.replace(/([A-Z])/g, '-$1').toLowerCase();
}

module.exports = {
  correlationId,
  nowIso,
  generateId,
  isValidEmail,
  sanitizeString,
  formatDate,
  timeDiffMinutes,
  simpleHash,
  validateRequired,
  retryWithBackoff,
  debounce,
  throttle,
  deepClone,
  deepMerge,
  sleep,
  randomString,
  safeJsonParse,
  safeJsonStringify,
  isEmpty,
  capitalize,
  toCamelCase,
  toSnakeCase,
  toKebabCase
};

