import { useState, useEffect, useRef, RefObject } from 'react';

interface SwipeState {
  isSwipeActive: boolean;
  swipeDirection: 'left' | 'right' | null;
  swipeDistance: number;
}

interface SwipeHandlers {
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onSwipeStart?: () => void;
  onSwipeEnd?: () => void;
}

interface UseSwipeNavigationOptions {
  threshold?: number; // Minimum distance for a swipe to be registered
  preventScroll?: boolean; // Prevent vertical scrolling during horizontal swipe
  enabled?: boolean; // Enable/disable swipe functionality
}

export const useSwipeNavigation = (
  elementRef: RefObject<HTMLElement>,
  handlers: SwipeHandlers,
  options: UseSwipeNavigationOptions = {}
) => {
  const {
    threshold = 50,
    preventScroll = true,
    enabled = true,
  } = options;

  const [swipeState, setSwipeState] = useState<SwipeState>({
    isSwipeActive: false,
    swipeDirection: null,
    swipeDistance: 0,
  });

  const touchStartRef = useRef<{ x: number; y: number; time: number } | null>(null);
  const touchMoveRef = useRef<{ x: number; y: number } | null>(null);

  useEffect(() => {
    const element = elementRef.current;
    if (!element || !enabled) return;

    const handleTouchStart = (e: TouchEvent) => {
      const touch = e.touches[0];
      touchStartRef.current = {
        x: touch.clientX,
        y: touch.clientY,
        time: Date.now(),
      };
      
      setSwipeState(prev => ({
        ...prev,
        isSwipeActive: true,
        swipeDirection: null,
        swipeDistance: 0,
      }));

      handlers.onSwipeStart?.();
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!touchStartRef.current) return;

      const touch = e.touches[0];
      const deltaX = touch.clientX - touchStartRef.current.x;
      const deltaY = touch.clientY - touchStartRef.current.y;
      
      touchMoveRef.current = {
        x: touch.clientX,
        y: touch.clientY,
      };

      // Determine if this is a horizontal swipe
      const isHorizontalSwipe = Math.abs(deltaX) > Math.abs(deltaY);
      
      if (isHorizontalSwipe && preventScroll) {
        e.preventDefault();
      }

      // Update swipe state
      const direction = deltaX > 0 ? 'right' : 'left';
      const distance = Math.abs(deltaX);

      setSwipeState(prev => ({
        ...prev,
        swipeDirection: distance > 10 ? direction : null,
        swipeDistance: distance,
      }));
    };

    const handleTouchEnd = (e: TouchEvent) => {
      if (!touchStartRef.current || !touchMoveRef.current) {
        setSwipeState(prev => ({
          ...prev,
          isSwipeActive: false,
          swipeDirection: null,
          swipeDistance: 0,
        }));
        return;
      }

      const deltaX = touchMoveRef.current.x - touchStartRef.current.x;
      const deltaY = touchMoveRef.current.y - touchStartRef.current.y;
      const distance = Math.abs(deltaX);
      const timeDelta = Date.now() - touchStartRef.current.time;

      // Check if it's a valid swipe (horizontal, sufficient distance, not too slow)
      const isHorizontalSwipe = Math.abs(deltaX) > Math.abs(deltaY);
      const isValidDistance = distance >= threshold;
      const isValidSpeed = timeDelta < 500; // Max 500ms for a swipe

      if (isHorizontalSwipe && isValidDistance && isValidSpeed) {
        if (deltaX > 0) {
          handlers.onSwipeRight?.();
        } else {
          handlers.onSwipeLeft?.();
        }
      }

      // Reset state
      setSwipeState({
        isSwipeActive: false,
        swipeDirection: null,
        swipeDistance: 0,
      });

      touchStartRef.current = null;
      touchMoveRef.current = null;
      handlers.onSwipeEnd?.();
    };

    const handleTouchCancel = () => {
      setSwipeState({
        isSwipeActive: false,
        swipeDirection: null,
        swipeDistance: 0,
      });
      
      touchStartRef.current = null;
      touchMoveRef.current = null;
      handlers.onSwipeEnd?.();
    };

    // Add event listeners with passive: false for preventDefault to work
    element.addEventListener('touchstart', handleTouchStart, { passive: false });
    element.addEventListener('touchmove', handleTouchMove, { passive: false });
    element.addEventListener('touchend', handleTouchEnd, { passive: true });
    element.addEventListener('touchcancel', handleTouchCancel, { passive: true });

    return () => {
      element.removeEventListener('touchstart', handleTouchStart);
      element.removeEventListener('touchmove', handleTouchMove);
      element.removeEventListener('touchend', handleTouchEnd);
      element.removeEventListener('touchcancel', handleTouchCancel);
    };
  }, [elementRef, handlers, threshold, preventScroll, enabled]);

  return swipeState;
};