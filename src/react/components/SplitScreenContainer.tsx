import React, { useRef, useState } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { SeriousPanel } from './SeriousPanel';
import { FunPanel } from './FunPanel';
import { LoadingAnimations } from './LoadingAnimations';
import { useResponsive } from '../hooks/useResponsive';
import { useSwipeNavigation } from '../hooks/useSwipeNavigation';
import { media, spacing } from '../styles/breakpoints';

// Enhanced Container with comprehensive responsive design
const Container = styled.div<{ $isMobile: boolean }>`
  display: ${props => props.$isMobile ? 'block' : 'grid'};
  grid-template-columns: ${props => props.$isMobile ? 'none' : '1fr 1fr'};
  gap: ${spacing.xl};
  padding: 0 ${spacing.xl} ${spacing.xl};
  max-width: 1400px;
  margin: 0 auto;
  min-height: 400px;
  position: relative;
  
  /* Desktop and large screens */
  ${media.xl} {
    max-width: 1400px;
    gap: ${spacing.xxl};
    padding: 0 ${spacing.xxl} ${spacing.xxl};
  }
  
  /* Tablet */
  ${media.tablet} {
    max-width: 1000px;
    gap: ${spacing.lg};
    padding: 0 ${spacing.lg} ${spacing.lg};
  }
  
  /* Mobile */
  ${media.mobile} {
    gap: ${spacing.md};
    padding: 0 ${spacing.md} ${spacing.md};
    overflow-x: hidden;
  }
  
  /* Small mobile */
  ${media.maxSm} {
    gap: ${spacing.sm};
    padding: 0 ${spacing.sm} ${spacing.sm};
  }

  /* Accessibility: Ensure proper focus management */
  &:focus-within {
    outline: 2px solid ${props => props.theme.primary};
    outline-offset: 4px;
    border-radius: 8px;
  }
`;

// Mobile-specific container for swipe navigation
const MobileContainer = styled(motion.div)`
  position: relative;
  width: 100%;
  overflow: hidden;
  touch-action: pan-y; /* Allow vertical scrolling but handle horizontal swipes */
`;

// Mobile panel wrapper for swipe animation
const MobilePanelWrapper = styled(motion.div)<{ $isActive: boolean }>`
  width: 100%;
  opacity: ${props => props.$isActive ? 1 : 0.3};
  transform: ${props => props.$isActive ? 'scale(1)' : 'scale(0.95)'};
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  margin-bottom: ${spacing.lg};
  
  &:last-child {
    margin-bottom: 0;
  }
`;

// Mobile navigation indicators
const MobileNavigation = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  gap: ${spacing.md};
  margin-bottom: ${spacing.lg};
  padding: ${spacing.md};
`;

const NavButton = styled(motion.button)<{ $isActive: boolean }>`
  padding: ${spacing.sm} ${spacing.md};
  border: 2px solid ${props => props.theme.primary};
  background: ${props => props.$isActive ? props.theme.primary : 'transparent'};
  color: ${props => props.$isActive ? props.theme.button.text : props.theme.primary};
  border-radius: 20px;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  outline: none;
  
  &:focus {
    box-shadow: 0 0 0 3px ${props => props.theme.primary}40;
  }
  
  &:hover {
    background: ${props => props.$isActive ? props.theme.button.hover : props.theme.primary}20;
  }
  
  ${media.touch} {
    padding: ${spacing.md} ${spacing.lg};
    font-size: 1rem;
  }
`;

// Swipe indicator
const SwipeIndicator = styled(motion.div)`
  position: absolute;
  bottom: ${spacing.md};
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  align-items: center;
  gap: ${spacing.sm};
  padding: ${spacing.sm} ${spacing.md};
  background: ${props => props.theme.background}90;
  backdrop-filter: blur(8px);
  border-radius: 20px;
  border: 1px solid ${props => props.theme.input.border};
  font-size: 0.75rem;
  color: ${props => props.theme.text};
  opacity: 0.7;
  pointer-events: none;
  
  ${media.hover} {
    display: none;
  }
`;

// Enhanced EmptyState with better accessibility and ReactBits-style animations
const EmptyState = styled(motion.div)`
  grid-column: 1 / -1;
  text-align: center;
  padding: 4rem 2rem;
  opacity: 0.6;
  
  /* ARIA and accessibility improvements */
  role: status;
  aria-live: polite;
  
  h3 {
    font-size: 1.25rem;
    margin-bottom: 1rem;
    color: ${props => props.theme.text};
  }
  
  p {
    font-size: 1rem;
    opacity: 0.8;
    max-width: 500px;
    margin: 0 auto;
    line-height: 1.6;
  }
`;

interface SplitScreenContainerProps {
  results: { serious: string; fun: string } | null;
  isLoading: boolean;
}

export const SplitScreenContainer: React.FC<SplitScreenContainerProps> = ({
  results,
  isLoading,
}) => {
  const { isMobile, isTouchDevice } = useResponsive();
  const [activePanel, setActivePanel] = useState<'serious' | 'fun'>('serious');
  const containerRef = useRef<HTMLDivElement>(null);

  // Swipe navigation for mobile
  const swipeState = useSwipeNavigation(
    containerRef,
    {
      onSwipeLeft: () => {
        if (activePanel === 'serious') {
          setActivePanel('fun');
        }
      },
      onSwipeRight: () => {
        if (activePanel === 'fun') {
          setActivePanel('serious');
        }
      },
    },
    {
      threshold: 50,
      enabled: isMobile && !!results,
    }
  );

  if (isLoading) {
    return (
      <Container 
        $isMobile={isMobile}
        role="main" 
        aria-label="What If Simulator Results"
        aria-busy="true"
      >
        <LoadingAnimations />
      </Container>
    );
  }

  if (!results) {
    return (
      <Container 
        $isMobile={isMobile}
        role="main" 
        aria-label="What If Simulator Interface"
      >
        <EmptyState
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 0.6, y: 0 }}
          transition={{ duration: 0.6 }}
          aria-label="Empty state message"
        >
          <h3>Enter a "What if..." scenario above to see both serious and fun outcomes!</h3>
          <p>
            Type your hypothetical question and discover realistic analysis alongside creative interpretations.
          </p>
        </EmptyState>
      </Container>
    );
  }

  // Mobile layout with swipe navigation
  if (isMobile) {
    return (
      <Container 
        $isMobile={isMobile}
        role="main" 
        aria-label="What If Simulator Results"
        aria-live="polite"
      >
        <MobileNavigation>
          <NavButton
            $isActive={activePanel === 'serious'}
            onClick={() => setActivePanel('serious')}
            whileTap={{ scale: 0.95 }}
            aria-label="View serious analysis"
          >
            🎯 Serious
          </NavButton>
          <NavButton
            $isActive={activePanel === 'fun'}
            onClick={() => setActivePanel('fun')}
            whileTap={{ scale: 0.95 }}
            aria-label="View fun interpretation"
          >
            🎉 Fun
          </NavButton>
        </MobileNavigation>

        <MobileContainer ref={containerRef}>
          <AnimatePresence mode="wait">
            <motion.div
              key={activePanel}
              initial={{ opacity: 0, x: activePanel === 'fun' ? 50 : -50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: activePanel === 'fun' ? -50 : 50 }}
              transition={{ 
                duration: 0.3,
                ease: "easeInOut"
              }}
            >
              {activePanel === 'serious' ? (
                <SeriousPanel content={results.serious} />
              ) : (
                <FunPanel content={results.fun} />
              )}
            </motion.div>
          </AnimatePresence>

          {isTouchDevice && (
            <SwipeIndicator
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 0.7, y: 0 }}
              transition={{ delay: 1, duration: 0.5 }}
            >
              👈 Swipe to switch panels 👉
            </SwipeIndicator>
          )}
        </MobileContainer>
      </Container>
    );
  }

  // Desktop layout
  return (
    <Container 
      $isMobile={isMobile}
      role="main" 
      aria-label="What If Simulator Results"
      aria-live="polite"
    >
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
        style={{ display: 'contents' }}
      >
        <SeriousPanel content={results.serious} />
        <FunPanel content={results.fun} />
      </motion.div>
    </Container>
  );
};