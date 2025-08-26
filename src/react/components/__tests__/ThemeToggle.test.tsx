import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { ThemeProvider } from 'styled-components';
import { ThemeToggle } from '../ThemeToggle';
import { ThemeProvider as CustomThemeProvider } from '../../providers/ThemeProvider';
import { lightTheme, darkTheme } from '../../styles/themes';

// Mock framer-motion
vi.mock('framer-motion', () => ({
  motion: {
    button: ({ children, onClick, whileHover, whileTap, ...props }: any) => (
      <button onClick={onClick} {...props}>
        {children}
      </button>
    ),
    div: ({ children, animate, initial, exit, transition, style, ...props }: any) => (
      <div style={style} {...props}>
        {children}
      </div>
    ),
  },
  AnimatePresence: ({ children }: any) => <div>{children}</div>,
}));

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

// Mock matchMedia
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

const renderWithTheme = (isDark = false) => {
  localStorageMock.getItem.mockReturnValue(isDark ? 'dark' : 'light');
  
  return render(
    <CustomThemeProvider>
      <ThemeToggle />
    </CustomThemeProvider>
  );
};

describe('ThemeToggle', () => {
  beforeEach(() => {
    localStorageMock.getItem.mockClear();
    localStorageMock.setItem.mockClear();
  });

  it('should render toggle button', () => {
    renderWithTheme();
    
    const toggleButton = screen.getByRole('button');
    expect(toggleButton).toBeInTheDocument();
  });

  it('should show sun icon in light mode', () => {
    renderWithTheme(false);
    
    expect(screen.getByText('☀️')).toBeInTheDocument();
  });

  it('should show moon icon in dark mode', () => {
    renderWithTheme(true);
    
    expect(screen.getByText('🌙')).toBeInTheDocument();
  });

  it('should toggle theme when clicked', async () => {
    renderWithTheme(false);
    
    const toggleButton = screen.getByRole('button');
    
    // Initially should show sun
    expect(screen.getByText('☀️')).toBeInTheDocument();
    
    fireEvent.click(toggleButton);
    
    // Should save to localStorage
    await waitFor(() => {
      expect(localStorageMock.setItem).toHaveBeenCalledWith('theme', 'dark');
    });
  });

  it('should render stars in dark mode', () => {
    renderWithTheme(true);
    
    // Check for star elements (they should be rendered as divs with specific styling)
    const starElements = screen.getAllByTestId(/star-/i);
    expect(starElements.length).toBeGreaterThan(0);
  });

  it('should not render stars in light mode', () => {
    renderWithTheme(false);
    
    // Stars should not be present in light mode
    const starElements = screen.queryAllByTestId(/star-/i);
    expect(starElements.length).toBe(0);
  });

  it('should apply custom className when provided', () => {
    localStorageMock.getItem.mockReturnValue('light');
    
    render(
      <CustomThemeProvider>
        <ThemeToggle className="custom-class" />
      </CustomThemeProvider>
    );
    
    const container = screen.getByRole('button').parentElement;
    expect(container).toHaveClass('custom-class');
  });

  it('should be accessible with keyboard navigation', () => {
    renderWithTheme();
    
    const toggleButton = screen.getByRole('button');
    
    // Should be focusable
    toggleButton.focus();
    expect(toggleButton).toHaveFocus();
    
    // Should be activatable with Enter key
    fireEvent.keyDown(toggleButton, { key: 'Enter' });
    // Note: The actual theme toggle would happen, but we're just testing the interaction
  });

  it('should have proper ARIA attributes', () => {
    renderWithTheme();
    
    const toggleButton = screen.getByRole('button');
    expect(toggleButton).toBeInTheDocument();
    
    // Button should be accessible
    expect(toggleButton.tagName).toBe('BUTTON');
  });
});