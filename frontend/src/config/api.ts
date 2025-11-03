/**
 * ECONEURA - API Configuration
 * Centralized API URL and correlation ID generation
 */

const getApiUrl = () => {
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }
  
  const hostname = typeof window !== 'undefined' ? window.location.hostname : '';
  return (hostname === 'localhost' || hostname === '127.0.0.1')
    ? 'http://localhost:8080/api'
    : 'https://econeura-backend-prod.azurewebsites.net/api';
};

export const API_URL = getApiUrl();

export function generateCorrelationId(prefix = 'web'): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

