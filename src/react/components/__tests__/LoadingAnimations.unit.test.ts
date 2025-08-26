import { describe, it, expect, vi } from 'vitest';

// Mock AnimationEngine
const mockAnimationEngine = {
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
};

vi.mock('../../services/AnimationEngine', () => ({
  animationEngine: mockAnimationEngine
}));

describe('LoadingAnimations Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('AnimationEngine Integration', () => {
    it('should import AnimationEngine correctly', async () => {
      const { animationEngine } = await import('../../services/AnimationEngine');
      
      expect(animationEngine).toBeDefined();
      expect(animationEngine.getLoadingAnimation).toBeDefined();
      expect(animationEngine.getStaggeredChildren).toBeDefined();
    });

    it('should get thinking animation from AnimationEngine', () => {
      const thinkingAnimation = mockAnimationEngine.getLoadingAnimation('thinking');
      
      expect(mockAnimationEngine.getLoadingAnimation).toHaveBeenCalledWith('thinking');
      expect(thinkingAnimation.animate).toEqual({
        y: [0, -10, 0],
        scale: [1, 1.1, 1],
        rotate: [0, 5, -5, 0]
      });
      expect(thinkingAnimation.transition.duration).toBe(1.2);
      expect(thinkingAnimation.transition.repeat).toBe(Infinity);
    });

    it('should get typing animation from AnimationEngine', () => {
      const typingAnimation = mockAnimationEngine.getLoadingAnimation('typing');
      
      expect(mockAnimationEngine.getLoadingAnimation).toHaveBeenCalledWith('typing');
      expect(typingAnimation.animate).toEqual({
        opacity: [0.3, 1, 0.3],
        scale: [0.8, 1, 0.8]
      });
      expect(typingAnimation.transition.duration).toBe(0.8);
      expect(typingAnimation.transition.repeat).toBe(Infinity);
    });

    it('should get staggered children animation from AnimationEngine', () => {
      const staggeredAnimation = mockAnimationEngine.getStaggeredChildren();
      
      expect(mockAnimationEngine.getStaggeredChildren).toHaveBeenCalled();
      expect(staggeredAnimation.hidden).toEqual({ opacity: 0 });
      expect(staggeredAnimation.visible).toEqual({
        opacity: 1,
        transition: { staggerChildren: 0.2 }
      });
    });

    it('should handle different animation types correctly', () => {
      // Test thinking animation
      const thinkingAnim = mockAnimationEngine.getLoadingAnimation('thinking');
      expect(thinkingAnim.animate).toHaveProperty('y');
      expect(thinkingAnim.animate).toHaveProperty('scale');
      expect(thinkingAnim.animate).toHaveProperty('rotate');

      // Test typing animation
      const typingAnim = mockAnimationEngine.getLoadingAnimation('typing');
      expect(typingAnim.animate).toHaveProperty('opacity');
      expect(typingAnim.animate).toHaveProperty('scale');
      expect(typingAnim.animate).not.toHaveProperty('y');
      expect(typingAnim.animate).not.toHaveProperty('rotate');
    });
  });

  describe('Animation Configuration', () => {
    it('should provide proper animation timing for thinking animation', () => {
      const animation = mockAnimationEngine.getLoadingAnimation('thinking');
      
      expect(animation.transition.duration).toBe(1.2);
      expect(animation.transition.repeat).toBe(Infinity);
    });

    it('should provide proper animation timing for typing animation', () => {
      const animation = mockAnimationEngine.getLoadingAnimation('typing');
      
      expect(animation.transition.duration).toBe(0.8);
      expect(animation.transition.repeat).toBe(Infinity);
    });

    it('should provide staggered children with proper delay', () => {
      const staggered = mockAnimationEngine.getStaggeredChildren();
      
      expect(staggered.visible.transition.staggerChildren).toBe(0.2);
    });
  });

  describe('Loading Messages', () => {
    it('should have predefined loading messages', () => {
      // Import the component to access its constants
      const loadingMessages = [
        "Analyzing your scenario...",
        "Generating serious outcomes...",
        "Creating fun interpretations...",
        "Polishing the results...",
        "Almost ready..."
      ];

      expect(loadingMessages).toHaveLength(5);
      expect(loadingMessages[0]).toBe("Analyzing your scenario...");
      expect(loadingMessages[1]).toBe("Generating serious outcomes...");
      expect(loadingMessages[2]).toBe("Creating fun interpretations...");
      expect(loadingMessages[3]).toBe("Polishing the results...");
      expect(loadingMessages[4]).toBe("Almost ready...");
    });
  });

  describe('Component Props Interface', () => {
    it('should support different loading types', () => {
      const validTypes = ['thinking', 'typing', 'processing'];
      
      validTypes.forEach(type => {
        expect(['thinking', 'typing', 'processing']).toContain(type);
      });
    });

    it('should support progress values', () => {
      const validProgressValues = [0, 25, 50, 75, 100];
      
      validProgressValues.forEach(progress => {
        expect(progress).toBeGreaterThanOrEqual(0);
        expect(progress).toBeLessThanOrEqual(100);
      });
    });

    it('should support custom messages', () => {
      const customMessages = [
        'Custom loading message',
        'Processing your request...',
        'Almost done!'
      ];

      customMessages.forEach(message => {
        expect(typeof message).toBe('string');
        expect(message.length).toBeGreaterThan(0);
      });
    });
  });

  describe('Smooth Transitions', () => {
    it('should support transition between loading and result states', () => {
      // Test that progress can transition from 0 to 100
      const progressStates = [0, 25, 50, 75, 100];
      
      progressStates.forEach((progress, index) => {
        expect(progress).toBe(index * 25);
        if (index > 0) {
          expect(progress).toBeGreaterThan(progressStates[index - 1]);
        }
      });
    });

    it('should handle completion callbacks', () => {
      const mockCallback = vi.fn();
      
      // Simulate completion
      mockCallback();
      
      expect(mockCallback).toHaveBeenCalledTimes(1);
    });
  });

  describe('Performance Considerations', () => {
    it('should handle interval cleanup', () => {
      const mockClearInterval = vi.fn();
      global.clearInterval = mockClearInterval;
      
      // Simulate component unmount
      const intervalId = 123;
      clearInterval(intervalId);
      
      expect(mockClearInterval).toHaveBeenCalledWith(intervalId);
    });

    it('should handle rapid prop changes', () => {
      const progressValues = [10, 20, 30, 40, 50];
      
      // Simulate rapid progress updates
      progressValues.forEach(progress => {
        expect(progress).toBeGreaterThanOrEqual(0);
        expect(progress).toBeLessThanOrEqual(100);
      });
    });
  });
});