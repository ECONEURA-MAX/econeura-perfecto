import '@testing-library/jest-dom';
import { expect, afterEach, vi } from 'vitest';
import { cleanup } from '@testing-library/react';
import React from 'react';

// Cleanup after each test
afterEach(() => {
    vi.clearAllTimers();
    vi.restoreAllMocks();
    vi.clearAllMocks();
  cleanup();
});

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Mock IntersectionObserver
global.IntersectionObserver = class IntersectionObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  takeRecords() { return []; }
  unobserve() {}
} as any;

// Suppress console errors in tests
global.console = {
  ...console,
  error: vi.fn(),
  warn: vi.fn(),
};

// Mock React JSX
global.React = React;

// Mock jsxDEV and jsx functions for React 18
global.jsxDEV = React.createElement;
global.jsx = React.createElement;

// Mock React.createElement for compatibility
global.React.createElement = React.createElement;

// Mock window for tests
global.window = window;
global.document = document;

// Ensure window is available globally
if (typeof global.window === 'undefined') {
  global.window = window;
}

if (typeof global.document === 'undefined') {
  global.document = document;
}

// Mock React.createElement globally
global.createElement = React.createElement;

// Ensure jsxDEV is available globally
if (typeof global.jsxDEV !== 'function') {
  global.jsxDEV = React.createElement;
}

// Mock React.createElement for JSX
if (typeof global.React.createElement !== 'function') {
  global.React.createElement = React.createElement;
}

// Mock jsxDEV globally for all tests
Object.defineProperty(global, 'jsxDEV', {
  value: React.createElement,
  writable: true,
  configurable: true
});

// Mock jsx globally for all tests
Object.defineProperty(global, 'jsx', {
  value: React.createElement,
  writable: true,
  configurable: true
});
