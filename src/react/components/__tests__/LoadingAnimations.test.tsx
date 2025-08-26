import React from 'react';
import { render, screen, waitFor, act } from '@testing-library/react';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { ThemeProvider } from 'styled-components';
import { 
  LoadingAnimations, 
  ThinkingLoader, 
  TypingLoader, 
  ProcessingLoader 
} from '../LoadingAnimations';
import { lightTheme } from '../../styles/themes';

// Mock framer-motion
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
    p: ({ children, ...props }: any) => <p {...props}>{children}</p>,
  },
  AnimatePresence: ({ children }: any) => <div>{children}</div>,
}));

// Mock AnimationEngine
vi.mock('../../services/AnimationEngine', () => ({
  animationEngine: {
    getLoadingAnimation: vi.fn((type: string) => ({
      animate: type === 'thinking' 
        ? { y: [0, -10, 0], scale: [1, 1.1, 1], rotate: [0, 5, -5, 0] }
        : { opacity: [0.3, 1, 0.3], scale: [0.8, 1, 0.8] },
      transition: { duration: type === 'thinking' ? 1.2 : 0.8, repeat: Infinity }
    })),
    getStaggeredChildren: vi.fn(() => ({
      hidden: { opacity: 0 },
      visible: { opacity: 1, transition: { staggerChildren: 0.2 } }
    }))
  }
}));

const renderWithTheme = (component: React.ReactElement) => {
  return render(
    <ThemeProvider theme={lightTheme}>
      {component}
    </ThemeProvider>
  );
};

describe('LoadingAnimations', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.clearAllMocks();
  });

  describe('Basic Rendering', () => {
    it('should render thinking animation by default', () => {
      renderWithTheme(<LoadingAnimations />);
      
      expect(screen.getByText('🤔')).toBeInTheDocument();
      expect(screen.getByText('Processing')).toBeInTheDocument();
      expect(screen.getByText(/% complete/)).toBeInTheDocument();
    });

    it('should render typing animation when type is typing', () => {
      renderWithTheme(<LoadingAnimations type="typing" />);
      
      expect(screen.getByText('🤖')).toBeInTheDocument();
      expect(screen.getByText('Processing')).toBeInTheDocument();
    });

    it('should render processing animation with both thinking and typing', () => {
      renderWithTheme(<LoadingAnimations type="processing" />);
      
      expect(screen.getByText('🤔')).toBeInTheDocument();
      expect(screen.getByText('🤖')).toBeInTheDocument();
      expect(screen.getByText('Processing')).toBeInTheDocument();
    });

    it('should display custom message when provided', () => {
      const customMessage = 'Custom loading message';
      renderWithTheme(<LoadingAnimations message={customMessage} />);
      
      expect(screen.getByText(customMessage)).toBeInTheDocument();
    });

    it('should display custom progress when provided', () => {
      renderWithTheme(<LoadingAnimations progress={75} />);
      
      expect(screen.getByText('75% complete')).toBeInTheDocument();
    });
  });

  describe('Animation Integration', () => {
    it('should use AnimationEngine for animations', () => {
      renderWithTheme(<LoadingAnimations type="thinking" />);
      
      // Component should render without errors
      expect(screen.getByText('🤔')).toBeInTheDocument();
      expect(screen.getByText('Processing')).toBeInTheDocument();
    });
  });

  describe('Specialized Loading Components', () => {
    it('should render ThinkingLoader correctly', () => {
      const message = 'Thinking hard...';
      renderWithTheme(<ThinkingLoader message={message} />);
      
      expect(screen.getByText('🤔')).toBeInTheDocument();
      expect(screen.getByText(message)).toBeInTheDocument();
    });

    it('should render TypingLoader correctly', () => {
      const message = 'Typing response...';
      renderWithTheme(<TypingLoader message={message} />);
      
      expect(screen.getByText('🤖')).toBeInTheDocument();
      expect(screen.getByText(message)).toBeInTheDocument();
    });

    it('should render ProcessingLoader correctly', () => {
      const message = 'Processing data...';
      const onComplete = vi.fn();
      renderWithTheme(
        <ProcessingLoader 
          message={message} 
          progress={60} 
          onComplete={onComplete} 
        />
      );
      
      expect(screen.getByText('🤔')).toBeInTheDocument();
      expect(screen.getByText('🤖')).toBeInTheDocument();
      expect(screen.getByText(message)).toBeInTheDocument();
      expect(screen.getByText('60% complete')).toBeInTheDocument();
    });
  });
});