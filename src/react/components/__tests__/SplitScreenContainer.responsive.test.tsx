import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { ThemeProvider } from 'styled-components';
import { SplitScreenContainer } from '../SplitScreenContainer';
import { lightTheme } from '../../styles/themes';
import * as useResponsiveModule from '../../hooks/useResponsive';
import * as useSwipeNavigationModule from '../../hooks/useSwipeNavigation';

// Mock the hooks
vi.mock('../../hooks/useResponsive');
vi.mock('../../hooks/useSwipeNavigation');
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
    button: ({ children, onClick, ...props }: any) => (
      <button onClick={onClick} {...props}>{children}</button>
    ),
  },
  AnimatePresence: ({ children }: any) => <div>{children}</div>,
}));

// Mock the panel components
vi.mock('../SeriousPanel', () => ({
  SeriousPanel: ({ content }: { content: string }) => (
    <div data-testid="serious-panel">{content}</div>
  ),
}));

vi.mock('../FunPanel', () => ({
  FunPanel: ({ content }: { content: string }) => (
    <div data-testid="fun-panel">{content}</div>
  ),
}));

vi.mock('../LoadingAnimations', () => ({
  LoadingAnimations: () => <div data-testid="loading-animations">Loading...</div>,
}));

const mockUseResponsive = vi.mocked(useResponsiveModule.useResponsive);
const mockUseSwipeNavigation = vi.mocked(useSwipeNavigationModule.useSwipeNavigation);

const renderWithTheme = (props: any) => {
  return render(
    <ThemeProvider theme={lightTheme}>
      <SplitScreenContainer {...props} />
    </ThemeProvider>
  );
};

describe('SplitScreenContainer - Responsive', () => {
  const mockResults = {
    serious: 'This is a serious analysis',
    fun: 'This is a fun interpretation',
  };

  beforeEach(() => {
    mockUseSwipeNavigation.mockReturnValue({
      isSwipeActive: false,
      swipeDirection: null,
      swipeDistance: 0,
    });
  });

  describe('Desktop Layout', () => {
    beforeEach(() => {
      mockUseResponsive.mockReturnValue({
        isMobile: false,
        isTablet: false,
        isDesktop: true,
        screenWidth: 1200,
        screenHeight: 800,
        orientation: 'landscape',
        isTouchDevice: false,
      });
    });

    it('should render both panels side by side on desktop', () => {
      renderWithTheme({ results: mockResults, isLoading: false });

      expect(screen.getByTestId('serious-panel')).toBeInTheDocument();
      expect(screen.getByTestId('fun-panel')).toBeInTheDocument();
      expect(screen.queryByText('🎯 Serious')).not.toBeInTheDocument();
      expect(screen.queryByText('🎉 Fun')).not.toBeInTheDocument();
    });

    it('should not show mobile navigation on desktop', () => {
      renderWithTheme({ results: mockResults, isLoading: false });

      expect(screen.queryByText('🎯 Serious')).not.toBeInTheDocument();
      expect(screen.queryByText('🎉 Fun')).not.toBeInTheDocument();
    });
  });

  describe('Mobile Layout', () => {
    beforeEach(() => {
      mockUseResponsive.mockReturnValue({
        isMobile: true,
        isTablet: false,
        isDesktop: false,
        screenWidth: 400,
        screenHeight: 800,
        orientation: 'portrait',
        isTouchDevice: true,
      });
    });

    it('should render mobile navigation buttons', () => {
      renderWithTheme({ results: mockResults, isLoading: false });

      expect(screen.getByText('🎯 Serious')).toBeInTheDocument();
      expect(screen.getByText('🎉 Fun')).toBeInTheDocument();
    });

    it('should show serious panel by default', () => {
      renderWithTheme({ results: mockResults, isLoading: false });

      expect(screen.getByTestId('serious-panel')).toBeInTheDocument();
      expect(screen.queryByTestId('fun-panel')).not.toBeInTheDocument();
    });

    it('should switch to fun panel when fun button is clicked', async () => {
      renderWithTheme({ results: mockResults, isLoading: false });

      const funButton = screen.getByText('🎉 Fun');
      fireEvent.click(funButton);

      await waitFor(() => {
        expect(screen.getByTestId('fun-panel')).toBeInTheDocument();
        expect(screen.queryByTestId('serious-panel')).not.toBeInTheDocument();
      });
    });

    it('should switch back to serious panel when serious button is clicked', async () => {
      renderWithTheme({ results: mockResults, isLoading: false });

      // First switch to fun
      const funButton = screen.getByText('🎉 Fun');
      fireEvent.click(funButton);

      await waitFor(() => {
        expect(screen.getByTestId('fun-panel')).toBeInTheDocument();
      });

      // Then switch back to serious
      const seriousButton = screen.getByText('🎯 Serious');
      fireEvent.click(seriousButton);

      await waitFor(() => {
        expect(screen.getByTestId('serious-panel')).toBeInTheDocument();
        expect(screen.queryByTestId('fun-panel')).not.toBeInTheDocument();
      });
    });

    it('should show swipe indicator on touch devices', () => {
      renderWithTheme({ results: mockResults, isLoading: false });

      expect(screen.getByText('👈 Swipe to switch panels 👉')).toBeInTheDocument();
    });

    it('should not show swipe indicator on non-touch devices', () => {
      mockUseResponsive.mockReturnValue({
        isMobile: true,
        isTablet: false,
        isDesktop: false,
        screenWidth: 400,
        screenHeight: 800,
        orientation: 'portrait',
        isTouchDevice: false,
      });

      renderWithTheme({ results: mockResults, isLoading: false });

      expect(screen.queryByText('👈 Swipe to switch panels 👉')).not.toBeInTheDocument();
    });

    it('should setup swipe navigation with correct handlers', () => {
      renderWithTheme({ results: mockResults, isLoading: false });

      expect(mockUseSwipeNavigation).toHaveBeenCalledWith(
        expect.any(Object), // ref
        expect.objectContaining({
          onSwipeLeft: expect.any(Function),
          onSwipeRight: expect.any(Function),
        }),
        expect.objectContaining({
          threshold: 50,
          enabled: true,
        })
      );
    });

    it('should not setup swipe navigation when no results', () => {
      renderWithTheme({ results: null, isLoading: false });

      expect(mockUseSwipeNavigation).toHaveBeenCalledWith(
        expect.any(Object),
        expect.any(Object),
        expect.objectContaining({
          enabled: false,
        })
      );
    });
  });

  describe('Loading State', () => {
    it('should show loading animations when loading', () => {
      mockUseResponsive.mockReturnValue({
        isMobile: false,
        isTablet: false,
        isDesktop: true,
        screenWidth: 1200,
        screenHeight: 800,
        orientation: 'landscape',
        isTouchDevice: false,
      });

      renderWithTheme({ results: null, isLoading: true });

      expect(screen.getByTestId('loading-animations')).toBeInTheDocument();
    });
  });

  describe('Empty State', () => {
    it('should show empty state when no results and not loading', () => {
      mockUseResponsive.mockReturnValue({
        isMobile: false,
        isTablet: false,
        isDesktop: true,
        screenWidth: 1200,
        screenHeight: 800,
        orientation: 'landscape',
        isTouchDevice: false,
      });

      renderWithTheme({ results: null, isLoading: false });

      expect(screen.getByText(/Enter a "What if..." scenario above/)).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    beforeEach(() => {
      mockUseResponsive.mockReturnValue({
        isMobile: true,
        isTablet: false,
        isDesktop: false,
        screenWidth: 400,
        screenHeight: 800,
        orientation: 'portrait',
        isTouchDevice: true,
      });
    });

    it('should have proper ARIA labels on navigation buttons', () => {
      renderWithTheme({ results: mockResults, isLoading: false });

      const seriousButton = screen.getByLabelText('View serious analysis');
      const funButton = screen.getByLabelText('View fun interpretation');

      expect(seriousButton).toBeInTheDocument();
      expect(funButton).toBeInTheDocument();
    });

    it('should have proper role and aria-label on container', () => {
      renderWithTheme({ results: mockResults, isLoading: false });

      const container = screen.getByRole('main');
      expect(container).toHaveAttribute('aria-label', 'What If Simulator Results');
    });
  });
});