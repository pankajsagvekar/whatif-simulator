import { renderHook, act } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import { useResponsive } from '../useResponsive';

// Mock window properties
const mockWindow = {
  innerWidth: 1024,
  innerHeight: 768,
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
  matchMedia: vi.fn(),
};

Object.defineProperty(window, 'innerWidth', {
  writable: true,
  configurable: true,
  value: 1024,
});

Object.defineProperty(window, 'innerHeight', {
  writable: true,
  configurable: true,
  value: 768,
});

Object.defineProperty(navigator, 'maxTouchPoints', {
  writable: true,
  configurable: true,
  value: 0,
});

describe('useResponsive', () => {
  let addEventListenerSpy: any;
  let removeEventListenerSpy: any;

  beforeEach(() => {
    addEventListenerSpy = vi.spyOn(window, 'addEventListener');
    removeEventListenerSpy = vi.spyOn(window, 'removeEventListener');
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should return desktop state for large screens', () => {
    window.innerWidth = 1200;
    window.innerHeight = 800;

    const { result } = renderHook(() => useResponsive());

    expect(result.current.isDesktop).toBe(true);
    expect(result.current.isTablet).toBe(false);
    expect(result.current.isMobile).toBe(false);
    expect(result.current.screenWidth).toBe(1200);
    expect(result.current.screenHeight).toBe(800);
    expect(result.current.orientation).toBe('landscape');
  });

  it('should return tablet state for medium screens', () => {
    window.innerWidth = 900;
    window.innerHeight = 600;

    const { result } = renderHook(() => useResponsive());

    expect(result.current.isDesktop).toBe(false);
    expect(result.current.isTablet).toBe(true);
    expect(result.current.isMobile).toBe(false);
    expect(result.current.screenWidth).toBe(900);
    expect(result.current.screenHeight).toBe(600);
  });

  it('should return mobile state for small screens', () => {
    window.innerWidth = 600;
    window.innerHeight = 800;

    const { result } = renderHook(() => useResponsive());

    expect(result.current.isDesktop).toBe(false);
    expect(result.current.isTablet).toBe(false);
    expect(result.current.isMobile).toBe(true);
    expect(result.current.screenWidth).toBe(600);
    expect(result.current.screenHeight).toBe(800);
    expect(result.current.orientation).toBe('portrait');
  });

  it('should detect portrait orientation', () => {
    window.innerWidth = 400;
    window.innerHeight = 800;

    const { result } = renderHook(() => useResponsive());

    expect(result.current.orientation).toBe('portrait');
  });

  it('should detect landscape orientation', () => {
    window.innerWidth = 800;
    window.innerHeight = 400;

    const { result } = renderHook(() => useResponsive());

    expect(result.current.orientation).toBe('landscape');
  });

  it('should detect touch device', () => {
    Object.defineProperty(navigator, 'maxTouchPoints', {
      writable: true,
      configurable: true,
      value: 1,
    });

    const { result } = renderHook(() => useResponsive());

    expect(result.current.isTouchDevice).toBe(true);
  });

  it('should detect non-touch device', () => {
    Object.defineProperty(navigator, 'maxTouchPoints', {
      writable: true,
      configurable: true,
      value: 0,
    });

    // Also remove ontouchstart if it exists
    delete (window as any).ontouchstart;

    const { result } = renderHook(() => useResponsive());

    expect(result.current.isTouchDevice).toBe(false);
  });

  it('should add event listeners on mount', () => {
    renderHook(() => useResponsive());

    expect(addEventListenerSpy).toHaveBeenCalledWith('resize', expect.any(Function));
    expect(addEventListenerSpy).toHaveBeenCalledWith('orientationchange', expect.any(Function));
  });

  it('should remove event listeners on unmount', () => {
    const { unmount } = renderHook(() => useResponsive());

    unmount();

    expect(removeEventListenerSpy).toHaveBeenCalledWith('resize', expect.any(Function));
    expect(removeEventListenerSpy).toHaveBeenCalledWith('orientationchange', expect.any(Function));
  });

  it('should update state on window resize', () => {
    const { result } = renderHook(() => useResponsive());

    // Initial state
    expect(result.current.isMobile).toBe(false);

    // Simulate resize to mobile
    act(() => {
      window.innerWidth = 500;
      window.innerHeight = 800;
      window.dispatchEvent(new Event('resize'));
    });

    expect(result.current.isMobile).toBe(true);
    expect(result.current.screenWidth).toBe(500);
    expect(result.current.screenHeight).toBe(800);
  });


});