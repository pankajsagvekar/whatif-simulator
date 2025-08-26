import { renderHook } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import { useSwipeNavigation } from '../useSwipeNavigation';
import { RefObject } from 'react';

// Mock element for testing
const createMockElement = () => ({
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
});

describe('useSwipeNavigation', () => {
  let mockElement: ReturnType<typeof createMockElement>;
  let mockRef: RefObject<HTMLElement>;
  let mockHandlers: {
    onSwipeLeft: ReturnType<typeof vi.fn>;
    onSwipeRight: ReturnType<typeof vi.fn>;
    onSwipeStart: ReturnType<typeof vi.fn>;
    onSwipeEnd: ReturnType<typeof vi.fn>;
  };

  beforeEach(() => {
    mockElement = createMockElement();
    mockRef = { current: mockElement as any };
    mockHandlers = {
      onSwipeLeft: vi.fn(),
      onSwipeRight: vi.fn(),
      onSwipeStart: vi.fn(),
      onSwipeEnd: vi.fn(),
    };
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should add event listeners when enabled', () => {
    renderHook(() => useSwipeNavigation(mockRef, mockHandlers, { enabled: true }));

    expect(mockElement.addEventListener).toHaveBeenCalledWith('touchstart', expect.any(Function), { passive: false });
    expect(mockElement.addEventListener).toHaveBeenCalledWith('touchmove', expect.any(Function), { passive: false });
    expect(mockElement.addEventListener).toHaveBeenCalledWith('touchend', expect.any(Function), { passive: true });
    expect(mockElement.addEventListener).toHaveBeenCalledWith('touchcancel', expect.any(Function), { passive: true });
  });

  it('should not add event listeners when disabled', () => {
    renderHook(() => useSwipeNavigation(mockRef, mockHandlers, { enabled: false }));

    expect(mockElement.addEventListener).not.toHaveBeenCalled();
  });

  it('should not add event listeners when element is null', () => {
    const nullRef = { current: null };
    renderHook(() => useSwipeNavigation(nullRef, mockHandlers));

    expect(mockElement.addEventListener).not.toHaveBeenCalled();
  });

  it('should remove event listeners on unmount', () => {
    const { unmount } = renderHook(() => useSwipeNavigation(mockRef, mockHandlers));

    unmount();

    expect(mockElement.removeEventListener).toHaveBeenCalledWith('touchstart', expect.any(Function));
    expect(mockElement.removeEventListener).toHaveBeenCalledWith('touchmove', expect.any(Function));
    expect(mockElement.removeEventListener).toHaveBeenCalledWith('touchend', expect.any(Function));
    expect(mockElement.removeEventListener).toHaveBeenCalledWith('touchcancel', expect.any(Function));
  });

  it('should call onSwipeStart on touchstart', () => {
    renderHook(() => useSwipeNavigation(mockRef, mockHandlers));

    const touchStartHandler = mockElement.addEventListener.mock.calls.find(
      call => call[0] === 'touchstart'
    )?.[1];

    const mockTouchEvent = {
      touches: [{ clientX: 100, clientY: 100 }],
    };

    touchStartHandler?.(mockTouchEvent);

    expect(mockHandlers.onSwipeStart).toHaveBeenCalled();
  });

  it('should call onSwipeLeft for left swipe', () => {
    renderHook(() => useSwipeNavigation(mockRef, mockHandlers, { threshold: 50 }));

    const touchStartHandler = mockElement.addEventListener.mock.calls.find(
      call => call[0] === 'touchstart'
    )?.[1];
    const touchMoveHandler = mockElement.addEventListener.mock.calls.find(
      call => call[0] === 'touchmove'
    )?.[1];
    const touchEndHandler = mockElement.addEventListener.mock.calls.find(
      call => call[0] === 'touchend'
    )?.[1];

    // Simulate touch start
    const startTime = Date.now();
    vi.spyOn(Date, 'now').mockReturnValue(startTime);
    
    touchStartHandler?.({
      touches: [{ clientX: 200, clientY: 100 }],
    });

    // Simulate touch move (required to set touchMoveRef)
    touchMoveHandler?.({
      touches: [{ clientX: 150, clientY: 100 }],
      preventDefault: vi.fn(),
    });

    // Simulate touch end (swipe left)
    vi.spyOn(Date, 'now').mockReturnValue(startTime + 200);
    
    touchEndHandler?.({});

    expect(mockHandlers.onSwipeLeft).toHaveBeenCalled();
    expect(mockHandlers.onSwipeRight).not.toHaveBeenCalled();
  });

  it('should call onSwipeRight for right swipe', () => {
    renderHook(() => useSwipeNavigation(mockRef, mockHandlers, { threshold: 50 }));

    const touchStartHandler = mockElement.addEventListener.mock.calls.find(
      call => call[0] === 'touchstart'
    )?.[1];
    const touchMoveHandler = mockElement.addEventListener.mock.calls.find(
      call => call[0] === 'touchmove'
    )?.[1];
    const touchEndHandler = mockElement.addEventListener.mock.calls.find(
      call => call[0] === 'touchend'
    )?.[1];

    // Simulate touch start
    const startTime = Date.now();
    vi.spyOn(Date, 'now').mockReturnValue(startTime);
    
    touchStartHandler?.({
      touches: [{ clientX: 100, clientY: 100 }],
    });

    // Simulate touch move (required to set touchMoveRef)
    touchMoveHandler?.({
      touches: [{ clientX: 150, clientY: 100 }],
      preventDefault: vi.fn(),
    });

    // Simulate touch end (swipe right)
    vi.spyOn(Date, 'now').mockReturnValue(startTime + 200);
    
    touchEndHandler?.({});

    expect(mockHandlers.onSwipeRight).toHaveBeenCalled();
    expect(mockHandlers.onSwipeLeft).not.toHaveBeenCalled();
  });

  it('should not trigger swipe for insufficient distance', () => {
    renderHook(() => useSwipeNavigation(mockRef, mockHandlers, { threshold: 100 }));

    const touchStartHandler = mockElement.addEventListener.mock.calls.find(
      call => call[0] === 'touchstart'
    )?.[1];
    const touchEndHandler = mockElement.addEventListener.mock.calls.find(
      call => call[0] === 'touchend'
    )?.[1];

    // Simulate touch start
    const startTime = Date.now();
    vi.spyOn(Date, 'now').mockReturnValue(startTime);
    
    touchStartHandler?.({
      touches: [{ clientX: 100, clientY: 100 }],
    });

    // Simulate touch end with small distance (less than threshold)
    vi.spyOn(Date, 'now').mockReturnValue(startTime + 200);
    
    touchEndHandler?.({
      changedTouches: [{ clientX: 130, clientY: 100 }], // Only 30px movement
    });

    expect(mockHandlers.onSwipeLeft).not.toHaveBeenCalled();
    expect(mockHandlers.onSwipeRight).not.toHaveBeenCalled();
  });

  it('should not trigger swipe for vertical movement', () => {
    renderHook(() => useSwipeNavigation(mockRef, mockHandlers, { threshold: 50 }));

    const touchStartHandler = mockElement.addEventListener.mock.calls.find(
      call => call[0] === 'touchstart'
    )?.[1];
    const touchEndHandler = mockElement.addEventListener.mock.calls.find(
      call => call[0] === 'touchend'
    )?.[1];

    // Simulate touch start
    const startTime = Date.now();
    vi.spyOn(Date, 'now').mockReturnValue(startTime);
    
    touchStartHandler?.({
      touches: [{ clientX: 100, clientY: 100 }],
    });

    // Simulate touch end with vertical movement
    vi.spyOn(Date, 'now').mockReturnValue(startTime + 200);
    
    touchEndHandler?.({
      changedTouches: [{ clientX: 110, clientY: 200 }], // More vertical than horizontal
    });

    expect(mockHandlers.onSwipeLeft).not.toHaveBeenCalled();
    expect(mockHandlers.onSwipeRight).not.toHaveBeenCalled();
  });

  it('should not trigger swipe for slow movement', () => {
    renderHook(() => useSwipeNavigation(mockRef, mockHandlers, { threshold: 50 }));

    const touchStartHandler = mockElement.addEventListener.mock.calls.find(
      call => call[0] === 'touchstart'
    )?.[1];
    const touchEndHandler = mockElement.addEventListener.mock.calls.find(
      call => call[0] === 'touchend'
    )?.[1];

    // Simulate touch start
    const startTime = Date.now();
    vi.spyOn(Date, 'now').mockReturnValue(startTime);
    
    touchStartHandler?.({
      touches: [{ clientX: 100, clientY: 100 }],
    });

    // Simulate touch end after long time (too slow)
    vi.spyOn(Date, 'now').mockReturnValue(startTime + 1000);
    
    touchEndHandler?.({
      changedTouches: [{ clientX: 200, clientY: 100 }],
    });

    expect(mockHandlers.onSwipeLeft).not.toHaveBeenCalled();
    expect(mockHandlers.onSwipeRight).not.toHaveBeenCalled();
  });

  it('should call onSwipeEnd after touch end', () => {
    renderHook(() => useSwipeNavigation(mockRef, mockHandlers));

    const touchStartHandler = mockElement.addEventListener.mock.calls.find(
      call => call[0] === 'touchstart'
    )?.[1];
    const touchEndHandler = mockElement.addEventListener.mock.calls.find(
      call => call[0] === 'touchend'
    )?.[1];

    touchStartHandler?.({
      touches: [{ clientX: 100, clientY: 100 }],
    });

    touchEndHandler?.({});

    expect(mockHandlers.onSwipeEnd).toHaveBeenCalled();
  });
});