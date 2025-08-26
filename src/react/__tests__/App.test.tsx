import React from 'react';
import { render, screen } from '@testing-library/react';
import { vi, describe, test, expect } from 'vitest';
import { ThemeProvider } from '../providers/ThemeProvider';
import App from '../App';

// Mock framer-motion to avoid animation issues in tests
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

// Mock the ReactWhatIfService
vi.mock('../services/ReactWhatIfService', () => ({
  ReactWhatIfService: vi.fn().mockImplementation(() => ({
    validateInput: vi.fn().mockReturnValue({ isValid: true }),
    processScenario: vi.fn().mockResolvedValue({
      seriousVersion: 'Serious outcome',
      funVersion: 'Fun outcome',
      processingTime: 1000,
    }),
  })),
}));

const renderWithTheme = (component: React.ReactElement) => {
  return render(
    <ThemeProvider>
      {component}
    </ThemeProvider>
  );
};

describe('App Component', () => {
  test('renders the main title', () => {
    renderWithTheme(<App />);
    expect(screen.getByText('What If Simulator')).toBeInTheDocument();
  });

  test('renders the subtitle', () => {
    renderWithTheme(<App />);
    expect(screen.getByText('Explore scenarios with serious analysis and creative fun')).toBeInTheDocument();
  });

  test('renders the input section', () => {
    renderWithTheme(<App />);
    expect(screen.getByText('Explore Possibilities')).toBeInTheDocument();
  });

  test('renders the empty state message', () => {
    renderWithTheme(<App />);
    expect(screen.getByText(/Enter a "What if..." scenario above/)).toBeInTheDocument();
  });
});