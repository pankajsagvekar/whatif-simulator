import { Variants, Transition, AnimationControls } from 'framer-motion';

export type AnimationType = 
  | 'panelEntrance'
  | 'panelExit'
  | 'hover'
  | 'click'
  | 'loading'
  | 'confetti'
  | 'themeToggle'
  | 'error'
  | 'success';

export type PanelType = 'serious' | 'fun';

export interface AnimationConfig {
  duration: number;
  easing: string | number[];
  delay?: number;
  effects?: {
    confetti?: boolean;
    parallax?: boolean;
    colorShift?: boolean;
    bounce?: boolean;
    glow?: boolean;
    wiggle?: boolean;
    spin?: boolean;
  };
}

export interface AnimationQueueItem {
  id: string;
  type: AnimationType;
  target: string;
  config: AnimationConfig;
  priority: number;
  timestamp: number;
}

export interface CoordinatedAnimation {
  serious: Variants;
  fun: Variants;
  timing: {
    seriousDelay: number;
    funDelay: number;
    stagger: number;
  };
}

/**
 * Centralized animation orchestration system for the What If Simulator
 * Manages coordinated panel entrance animations, queuing, and conflict prevention
 */
export class AnimationEngine {
  private animationQueue: AnimationQueueItem[] = [];
  private activeAnimations: Set<string> = new Set();
  private animationId = 0;
  private isReducedMotion = false;

  constructor() {
    // Check for reduced motion preference
    this.checkReducedMotionPreference();
    
    // Listen for changes in motion preference
    if (typeof window !== 'undefined') {
      const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
      mediaQuery.addEventListener('change', () => {
        this.checkReducedMotionPreference();
      });
    }
  }

  private checkReducedMotionPreference(): void {
    if (typeof window !== 'undefined') {
      this.isReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    }
  }

  /**
   * Get coordinated panel entrance animations
   * Ensures both panels animate in harmony with distinct personalities
   */
  getCoordinatedPanelEntrance(): CoordinatedAnimation {
    const baseConfig = this.isReducedMotion ? 
      { duration: 0.3, easing: [0.4, 0, 0.2, 1] } :
      { duration: 0.8, easing: [0.4, 0, 0.2, 1] };

    return {
      serious: {
        hidden: { 
          opacity: 0, 
          x: -50, 
          y: 20,
          scale: 0.95
        },
        visible: { 
          opacity: 1, 
          x: 0, 
          y: 0,
          scale: 1,
          transition: {
            ...baseConfig,
            delay: 0.1,
            type: "spring",
            stiffness: 100,
            damping: 15
          }
        }
      },
      fun: {
        hidden: { 
          opacity: 0, 
          x: 50, 
          rotate: this.isReducedMotion ? 0 : -10, 
          scale: 0.8
        },
        visible: { 
          opacity: 1, 
          x: 0, 
          rotate: 0, 
          scale: 1,
          transition: {
            duration: this.isReducedMotion ? 0.3 : 0.9,
            ease: this.isReducedMotion ? [0.4, 0, 0.2, 1] : [0.68, -0.55, 0.265, 1.55],
            delay: 0.2,
            rotate: this.isReducedMotion ? undefined : { 
              type: "spring", 
              stiffness: 120, 
              damping: 10 
            },
            scale: this.isReducedMotion ? undefined : { 
              type: "spring", 
              stiffness: 150, 
              damping: 12 
            }
          }
        }
      },
      timing: {
        seriousDelay: 0.1,
        funDelay: 0.2,
        stagger: 0.1
      }
    };
  }

  /**
   * Get hover animation variants for panels
   */
  getPanelHoverAnimation(panelType: PanelType): Variants {
    if (this.isReducedMotion) {
      return {
        rest: { scale: 1 },
        hover: { scale: 1.02 }
      };
    }

    if (panelType === 'serious') {
      return {
        rest: { 
          scale: 1,
          rotateX: 0,
          rotateY: 0,
          y: 0
        },
        hover: { 
          scale: 1.01,
          rotateX: 2,
          rotateY: 2,
          y: -4,
          transition: {
            duration: 0.4,
            ease: [0.4, 0, 0.2, 1]
          }
        }
      };
    } else {
      return {
        rest: { 
          scale: 1,
          rotateX: 0,
          rotateY: 0,
          y: 0
        },
        hover: { 
          scale: 1.02,
          rotateX: -2,
          rotateY: -2,
          y: -6,
          transition: {
            duration: 0.4,
            ease: [0.68, -0.55, 0.265, 1.55]
          }
        }
      };
    }
  }

  /**
   * Get loading animation variants
   */
  getLoadingAnimation(type: 'thinking' | 'typing'): Variants {
    if (this.isReducedMotion) {
      return {
        animate: { opacity: [0.5, 1, 0.5] },
        transition: { duration: 1, repeat: Infinity }
      };
    }

    if (type === 'thinking') {
      return {
        animate: {
          y: [0, -10, 0],
          scale: [1, 1.1, 1],
          rotate: [0, 5, -5, 0]
        },
        transition: {
          duration: 1.2,
          repeat: Infinity,
          ease: "easeInOut"
        }
      };
    } else {
      return {
        animate: {
          opacity: [0.3, 1, 0.3],
          scale: [0.8, 1, 0.8]
        },
        transition: {
          duration: 0.8,
          repeat: Infinity,
          ease: "easeInOut",
          staggerChildren: 0.2
        }
      };
    }
  }

  /**
   * Get button animation variants
   */
  getButtonAnimation(): Variants {
    if (this.isReducedMotion) {
      return {
        rest: { scale: 1 },
        hover: { scale: 1.05 },
        tap: { scale: 0.98 }
      };
    }

    return {
      rest: { 
        scale: 1,
        y: 0
      },
      hover: { 
        scale: 1.05,
        y: -2,
        transition: {
          type: "spring",
          stiffness: 400,
          damping: 10
        }
      },
      tap: { 
        scale: 0.98,
        y: 0,
        transition: {
          duration: 0.1
        }
      }
    };
  }

  /**
   * Get theme toggle animation
   */
  getThemeToggleAnimation(): Variants {
    if (this.isReducedMotion) {
      return {
        light: { rotate: 0 },
        dark: { rotate: 180 }
      };
    }

    return {
      light: {
        rotate: 0,
        scale: 1,
        transition: {
          type: "spring",
          stiffness: 200,
          damping: 10
        }
      },
      dark: {
        rotate: 180,
        scale: 1.1,
        transition: {
          type: "spring",
          stiffness: 200,
          damping: 10
        }
      }
    };
  }

  /**
   * Add animation to queue with conflict prevention
   */
  queueAnimation(
    type: AnimationType,
    target: string,
    config: AnimationConfig,
    priority: number = 1
  ): string {
    const id = `anim_${++this.animationId}`;
    
    // Check for conflicts
    if (this.hasConflictingAnimation(type, target)) {
      console.warn(`Animation conflict detected for ${type} on ${target}. Skipping.`);
      return '';
    }

    const queueItem: AnimationQueueItem = {
      id,
      type,
      target,
      config,
      priority,
      timestamp: Date.now()
    };

    // Insert based on priority (higher priority first)
    const insertIndex = this.animationQueue.findIndex(item => item.priority < priority);
    if (insertIndex === -1) {
      this.animationQueue.push(queueItem);
    } else {
      this.animationQueue.splice(insertIndex, 0, queueItem);
    }

    return id;
  }

  /**
   * Execute next animation in queue
   */
  async executeNextAnimation(): Promise<void> {
    if (this.animationQueue.length === 0) return;

    const animation = this.animationQueue.shift()!;
    this.activeAnimations.add(animation.id);

    try {
      await this.executeAnimation(animation);
    } catch (error) {
      console.error(`Animation execution failed:`, error);
    } finally {
      this.activeAnimations.delete(animation.id);
    }
  }

  /**
   * Execute a specific animation
   */
  private async executeAnimation(animation: AnimationQueueItem): Promise<void> {
    return new Promise((resolve) => {
      // Simulate animation execution time
      const duration = animation.config.duration * 1000 + (animation.config.delay || 0) * 1000;
      setTimeout(resolve, duration);
    });
  }

  /**
   * Check for conflicting animations
   */
  private hasConflictingAnimation(type: AnimationType, target: string): boolean {
    return this.animationQueue.some(item => 
      item.target === target && this.areAnimationsConflicting(item.type, type)
    );
  }

  /**
   * Determine if two animation types conflict
   */
  private areAnimationsConflicting(type1: AnimationType, type2: AnimationType): boolean {
    const conflictGroups = [
      ['panelEntrance', 'panelExit'],
      ['hover', 'click'],
      ['loading', 'success', 'error']
    ];

    return conflictGroups.some(group => 
      group.includes(type1) && group.includes(type2) && type1 !== type2
    );
  }

  /**
   * Clear animation queue
   */
  clearQueue(): void {
    this.animationQueue = [];
  }

  /**
   * Get queue status
   */
  getQueueStatus(): {
    queueLength: number;
    activeAnimations: number;
    isReducedMotion: boolean;
  } {
    return {
      queueLength: this.animationQueue.length,
      activeAnimations: this.activeAnimations.size,
      isReducedMotion: this.isReducedMotion
    };
  }

  /**
   * Cancel specific animation
   */
  cancelAnimation(id: string): boolean {
    const index = this.animationQueue.findIndex(item => item.id === id);
    if (index !== -1) {
      this.animationQueue.splice(index, 1);
      return true;
    }
    return false;
  }

  /**
   * Get staggered children animation
   */
  getStaggeredChildren(delayBetween: number = 0.1): Variants {
    return {
      hidden: { opacity: 0 },
      visible: {
        opacity: 1,
        transition: {
          staggerChildren: this.isReducedMotion ? 0.05 : delayBetween
        }
      }
    };
  }

  /**
   * Get error animation
   */
  getErrorAnimation(): Variants {
    if (this.isReducedMotion) {
      return {
        hidden: { opacity: 0 },
        visible: { opacity: 1 }
      };
    }

    return {
      hidden: { 
        opacity: 0, 
        y: -10, 
        scale: 0.95 
      },
      visible: { 
        opacity: 1, 
        y: 0, 
        scale: 1,
        transition: {
          type: "spring",
          stiffness: 300,
          damping: 20
        }
      },
      shake: {
        x: [0, -5, 5, -5, 5, 0],
        transition: {
          duration: 0.5
        }
      }
    };
  }
}

// Singleton instance
export const animationEngine = new AnimationEngine();