import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { AnimationEngine, AnimationType, PanelType } from '../AnimationEngine';

// Mock window.matchMedia
const mockMatchMedia = (matches: boolean) => ({
  matches,
  media: '(prefers-reduced-motion: reduce)',
  onchange: null,
  addListener: vi.fn(),
  removeListener: vi.fn(),
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
  dispatchEvent: vi.fn(),
});

describe('AnimationEngine', () => {
  let animationEngine: AnimationEngine;

  beforeEach(() => {
    // Mock window.matchMedia
    Object.defineProperty(global, 'window', {
      value: {
        matchMedia: vi.fn().mockImplementation(() => mockMatchMedia(false)),
      },
      writable: true,
    });
    
    animationEngine = new AnimationEngine();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Coordinated Panel Entrance', () => {
    it('should provide coordinated entrance animations for both panels', () => {
      const coordinated = animationEngine.getCoordinatedPanelEntrance();

      expect(coordinated).toHaveProperty('serious');
      expect(coordinated).toHaveProperty('fun');
      expect(coordinated).toHaveProperty('timing');

      // Verify serious panel animation
      expect(coordinated.serious.hidden).toEqual({
        opacity: 0,
        x: -50,
        y: 20,
        scale: 0.95
      });

      expect(coordinated.serious.visible).toMatchObject({
        opacity: 1,
        x: 0,
        y: 0,
        scale: 1
      });

      // Verify fun panel animation
      expect(coordinated.fun.hidden).toEqual({
        opacity: 0,
        x: 50,
        rotate: -10,
        scale: 0.8
      });

      expect(coordinated.fun.visible).toMatchObject({
        opacity: 1,
        x: 0,
        rotate: 0,
        scale: 1
      });

      // Verify timing coordination
      expect(coordinated.timing.seriousDelay).toBe(0.1);
      expect(coordinated.timing.funDelay).toBe(0.2);
      expect(coordinated.timing.stagger).toBe(0.1);
    });

    it('should respect reduced motion preferences', () => {
      // Mock reduced motion preference
      Object.defineProperty(global, 'window', {
        value: {
          matchMedia: vi.fn().mockImplementation(() => mockMatchMedia(true)),
        },
        writable: true,
      });

      const reducedMotionEngine = new AnimationEngine();
      const coordinated = reducedMotionEngine.getCoordinatedPanelEntrance();

      // Should have shorter durations for reduced motion
      expect(coordinated.serious.visible.transition?.duration).toBe(0.3);
      expect(coordinated.fun.visible.transition?.duration).toBe(0.3);
      
      // Fun panel should not rotate in reduced motion
      expect(coordinated.fun.hidden.rotate).toBe(0);
    });
  });

  describe('Panel Hover Animations', () => {
    it('should provide distinct hover animations for serious panel', () => {
      const hoverAnimation = animationEngine.getPanelHoverAnimation('serious');

      expect(hoverAnimation.rest).toEqual({
        scale: 1,
        rotateX: 0,
        rotateY: 0,
        y: 0
      });

      expect(hoverAnimation.hover).toMatchObject({
        scale: 1.01,
        rotateX: 2,
        rotateY: 2,
        y: -4
      });
    });

    it('should provide distinct hover animations for fun panel', () => {
      const hoverAnimation = animationEngine.getPanelHoverAnimation('fun');

      expect(hoverAnimation.rest).toEqual({
        scale: 1,
        rotateX: 0,
        rotateY: 0,
        y: 0
      });

      expect(hoverAnimation.hover).toMatchObject({
        scale: 1.02,
        rotateX: -2,
        rotateY: -2,
        y: -6
      });
    });

    it('should provide simplified hover for reduced motion', () => {
      Object.defineProperty(global, 'window', {
        value: {
          matchMedia: vi.fn().mockImplementation(() => mockMatchMedia(true)),
        },
        writable: true,
      });

      const reducedMotionEngine = new AnimationEngine();
      const hoverAnimation = reducedMotionEngine.getPanelHoverAnimation('serious');

      expect(hoverAnimation.rest).toEqual({ scale: 1 });
      expect(hoverAnimation.hover).toEqual({ scale: 1.02 });
    });
  });

  describe('Loading Animations', () => {
    it('should provide thinking emoji animation', () => {
      const thinkingAnimation = animationEngine.getLoadingAnimation('thinking');

      expect(thinkingAnimation.animate).toEqual({
        y: [0, -10, 0],
        scale: [1, 1.1, 1],
        rotate: [0, 5, -5, 0]
      });

      expect(thinkingAnimation.transition).toMatchObject({
        duration: 1.2,
        repeat: Infinity,
        ease: "easeInOut"
      });
    });

    it('should provide typing animation', () => {
      const typingAnimation = animationEngine.getLoadingAnimation('typing');

      expect(typingAnimation.animate).toEqual({
        opacity: [0.3, 1, 0.3],
        scale: [0.8, 1, 0.8]
      });

      expect(typingAnimation.transition).toMatchObject({
        duration: 0.8,
        repeat: Infinity,
        ease: "easeInOut",
        staggerChildren: 0.2
      });
    });

    it('should provide simplified loading for reduced motion', () => {
      Object.defineProperty(global, 'window', {
        value: {
          matchMedia: vi.fn().mockImplementation(() => mockMatchMedia(true)),
        },
        writable: true,
      });

      const reducedMotionEngine = new AnimationEngine();
      const loadingAnimation = reducedMotionEngine.getLoadingAnimation('thinking');

      expect(loadingAnimation.animate).toEqual({
        opacity: [0.5, 1, 0.5]
      });
    });
  });

  describe('Button Animations', () => {
    it('should provide button interaction animations', () => {
      const buttonAnimation = animationEngine.getButtonAnimation();

      expect(buttonAnimation.rest).toEqual({
        scale: 1,
        y: 0
      });

      expect(buttonAnimation.hover).toMatchObject({
        scale: 1.05,
        y: -2
      });

      expect(buttonAnimation.tap).toMatchObject({
        scale: 0.98,
        y: 0
      });
    });
  });

  describe('Theme Toggle Animation', () => {
    it('should provide theme toggle animations', () => {
      const themeAnimation = animationEngine.getThemeToggleAnimation();

      expect(themeAnimation.light).toMatchObject({
        rotate: 0,
        scale: 1
      });

      expect(themeAnimation.dark).toMatchObject({
        rotate: 180,
        scale: 1.1
      });
    });
  });

  describe('Animation Queuing and Conflict Prevention', () => {
    it('should queue animations with priority', () => {
      const id1 = animationEngine.queueAnimation('panelEntrance', 'serious-panel', {
        duration: 0.8,
        easing: 'ease-out'
      }, 1);

      const id2 = animationEngine.queueAnimation('hover', 'fun-panel', {
        duration: 0.3,
        easing: 'ease-in-out'
      }, 2);

      expect(id1).toBeTruthy();
      expect(id2).toBeTruthy();

      const status = animationEngine.getQueueStatus();
      expect(status.queueLength).toBe(2);
    });

    it('should prevent conflicting animations', () => {
      // Queue entrance animation
      const id1 = animationEngine.queueAnimation('panelEntrance', 'test-panel', {
        duration: 0.8,
        easing: 'ease-out'
      });

      // Try to queue conflicting exit animation
      const id2 = animationEngine.queueAnimation('panelExit', 'test-panel', {
        duration: 0.5,
        easing: 'ease-in'
      });

      expect(id1).toBeTruthy();
      expect(id2).toBe(''); // Should be empty due to conflict

      const status = animationEngine.getQueueStatus();
      expect(status.queueLength).toBe(1);
    });

    it('should execute animations in priority order', async () => {
      // Queue low priority animation
      animationEngine.queueAnimation('hover', 'panel1', {
        duration: 0.1,
        easing: 'ease'
      }, 1);

      // Queue high priority animation
      animationEngine.queueAnimation('panelEntrance', 'panel2', {
        duration: 0.1,
        easing: 'ease'
      }, 3);

      // Queue medium priority animation
      animationEngine.queueAnimation('loading', 'panel3', {
        duration: 0.1,
        easing: 'ease'
      }, 2);

      const status = animationEngine.getQueueStatus();
      expect(status.queueLength).toBe(3);

      // Execute next animation (should be highest priority)
      await animationEngine.executeNextAnimation();
      
      const statusAfter = animationEngine.getQueueStatus();
      expect(statusAfter.queueLength).toBe(2);
    });

    it('should cancel specific animations', () => {
      const id = animationEngine.queueAnimation('hover', 'test-panel', {
        duration: 0.3,
        easing: 'ease'
      });

      expect(animationEngine.getQueueStatus().queueLength).toBe(1);

      const cancelled = animationEngine.cancelAnimation(id);
      expect(cancelled).toBe(true);
      expect(animationEngine.getQueueStatus().queueLength).toBe(0);
    });

    it('should clear entire queue', () => {
      animationEngine.queueAnimation('hover', 'panel1', { duration: 0.3, easing: 'ease' });
      animationEngine.queueAnimation('loading', 'panel2', { duration: 0.5, easing: 'ease' });

      expect(animationEngine.getQueueStatus().queueLength).toBe(2);

      animationEngine.clearQueue();
      expect(animationEngine.getQueueStatus().queueLength).toBe(0);
    });
  });

  describe('Staggered Children Animation', () => {
    it('should provide staggered children animation', () => {
      const staggered = animationEngine.getStaggeredChildren(0.2);

      expect(staggered.hidden).toEqual({ opacity: 0 });
      expect(staggered.visible).toMatchObject({
        opacity: 1,
        transition: {
          staggerChildren: 0.2
        }
      });
    });

    it('should use reduced stagger for reduced motion', () => {
      Object.defineProperty(global, 'window', {
        value: {
          matchMedia: vi.fn().mockImplementation(() => mockMatchMedia(true)),
        },
        writable: true,
      });

      const reducedMotionEngine = new AnimationEngine();
      const staggered = reducedMotionEngine.getStaggeredChildren(0.2);

      expect(staggered.visible.transition?.staggerChildren).toBe(0.05);
    });
  });

  describe('Error Animation', () => {
    it('should provide error animation with shake effect', () => {
      const errorAnimation = animationEngine.getErrorAnimation();

      expect(errorAnimation.hidden).toEqual({
        opacity: 0,
        y: -10,
        scale: 0.95
      });

      expect(errorAnimation.visible).toMatchObject({
        opacity: 1,
        y: 0,
        scale: 1
      });

      expect(errorAnimation.shake).toEqual({
        x: [0, -5, 5, -5, 5, 0],
        transition: {
          duration: 0.5
        }
      });
    });
  });

  describe('Queue Status', () => {
    it('should provide accurate queue status', () => {
      const initialStatus = animationEngine.getQueueStatus();
      expect(initialStatus).toEqual({
        queueLength: 0,
        activeAnimations: 0,
        isReducedMotion: false
      });

      animationEngine.queueAnimation('hover', 'test', { duration: 0.3, easing: 'ease' });

      const statusWithQueue = animationEngine.getQueueStatus();
      expect(statusWithQueue.queueLength).toBe(1);
    });
  });
});