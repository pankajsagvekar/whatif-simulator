import '@testing-library/jest-dom';
import { vi } from 'vitest';
import React from 'react';

// Extend expect with jest-dom matchers
import { expect } from 'vitest';
import * as matchers from '@testing-library/jest-dom/matchers';

expect.extend(matchers);

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(), // deprecated
    removeListener: vi.fn(), // deprecated
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Mock framer-motion for all tests
vi.mock('framer-motion', () => ({
  motion: {
    div: 'div',
    h1: 'h1',
    h2: 'h2',
    p: 'p',
    input: 'input',
    button: 'button',
    span: 'span',
  },
  AnimatePresence: ({ children }: { children: React.ReactNode }) => children,
}));

// Mock ReactBits animation library
vi.mock('reactbits-animation', () => ({
  Bounce: ({ children }: { children: React.ReactNode }) => React.createElement('div', { 'data-testid': 'reactbits-bounce' }, children),
  ClickSpark: ({ children }: { children: React.ReactNode }) => React.createElement('div', { 'data-testid': 'reactbits-clickspark' }, children),
  BounceIn: ({ children }: { children: React.ReactNode }) => children,
  FadeIn: ({ children }: { children: React.ReactNode }) => children,
  SlideIn: ({ children }: { children: React.ReactNode }) => children,
}));