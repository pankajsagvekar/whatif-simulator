import React, { useState, useEffect } from 'react';
import styled, { keyframes } from 'styled-components';
import { motion } from 'framer-motion';
import { ConfettiSystem } from './ConfettiSystem';

// ReactBits-style wiggle animation
const wiggle = keyframes`
  0%, 100% { transform: rotate(0deg); }
  25% { transform: rotate(1deg); }
  75% { transform: rotate(-1deg); }
`;

// Enhanced spin animation for entrance
const spin = keyframes`
  0% { transform: rotate(0deg) scale(0.8); }
  50% { transform: rotate(180deg) scale(1.05); }
  100% { transform: rotate(360deg) scale(1); }
`;

// ReactBits-inspired Card component with vibrant styling and gradients
const PanelContainer = styled(motion.div)`
  background: ${props => props.theme.fun.gradient};
  border: 2px solid ${props => props.theme.fun.border};
  border-radius: 16px;
  padding: 2rem;
  box-shadow: 
    0 4px 20px rgba(245, 158, 11, 0.2),
    0 1px 3px rgba(0, 0, 0, 0.1);
  position: relative;
  overflow: hidden;
  transition: all 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55);
  backdrop-filter: blur(10px);

  /* ReactBits-style vibrant hover effects */
  &:hover {
    transform: perspective(1000px) rotateX(-2deg) rotateY(-2deg) translateY(-6px) scale(1.02);
    box-shadow: 
      0 15px 50px rgba(245, 158, 11, 0.4),
      0 5px 15px rgba(0, 0, 0, 0.15);
    animation: ${wiggle} 0.6s ease-in-out;
  }

  /* Rainbow border animation */
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
    background: linear-gradient(90deg, 
      #ff6b6b, #4ecdc4, #45b7d1, #96ceb4, #ffeaa7, #dda0dd, #ff6b6b
    );
    background-size: 200% 100%;
    animation: rainbow 3s linear infinite;
    border-radius: 16px 16px 0 0;
  }

  /* Animated gradient background overlay */
  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(45deg, 
      transparent 0%, 
      rgba(255, 107, 107, 0.1) 25%, 
      transparent 50%, 
      rgba(78, 205, 196, 0.1) 75%, 
      transparent 100%
    );
    background-size: 200% 200%;
    animation: gradientShift 4s ease-in-out infinite;
    pointer-events: none;
    opacity: 0;
    transition: opacity 0.3s ease;
  }

  &:hover::after {
    opacity: 1;
  }

  @keyframes rainbow {
    0% { background-position: 0% 50%; }
    100% { background-position: 200% 50%; }
  }

  @keyframes gradientShift {
    0%, 100% { background-position: 0% 50%; }
    50% { background-position: 100% 50%; }
  }

  /* Accessibility improvements */
  &:focus-within {
    outline: 2px solid ${props => props.theme.fun.border};
    outline-offset: 2px;
  }
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid ${props => props.theme.fun.border};
  position: relative;
  z-index: 2;
`;

const Icon = styled(motion.div)`
  font-size: 1.5rem;
  margin-right: 0.75rem;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 50%;
  background: linear-gradient(45deg, #ff6b6b, #4ecdc4);
  transition: all 0.3s ease;
  position: relative;
  
  &::before {
    content: '';
    position: absolute;
    top: -2px;
    left: -2px;
    right: -2px;
    bottom: -2px;
    background: linear-gradient(45deg, #ff6b6b, #4ecdc4, #45b7d1, #96ceb4);
    border-radius: 50%;
    z-index: -1;
    opacity: 0;
    transition: opacity 0.3s ease;
  }
  
  &:hover::before {
    opacity: 1;
  }
`;

const Title = styled.h3`
  color: ${props => props.theme.fun.text};
  font-size: 1.25rem;
  font-weight: 600;
  letter-spacing: -0.025em;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
`;

const Content = styled(motion.div)`
  color: ${props => props.theme.fun.text};
  line-height: 1.7;
  font-size: 1rem;
  white-space: pre-wrap;
  position: relative;
  z-index: 2;
  
  /* Enhanced typography for better readability */
  p {
    margin-bottom: 1rem;
    
    &:last-child {
      margin-bottom: 0;
    }
  }
`;

interface FunPanelProps {
  content: string;
}

export const FunPanel: React.FC<FunPanelProps> = ({ content }) => {
  const [showConfetti, setShowConfetti] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    // ReactBits-style confetti system trigger
    if (content) {
      setShowConfetti(true);
      const timer = setTimeout(() => setShowConfetti(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [content]);

  return (
    <PanelContainer
      // ReactBits-style spin/wiggle entrance animations
      initial={{ opacity: 0, x: 50, rotate: -10, scale: 0.8 }}
      animate={{ opacity: 1, x: 0, rotate: 0, scale: 1 }}
      transition={{ 
        duration: 0.9, 
        ease: [0.68, -0.55, 0.265, 1.55], // Bouncy easing for playful feel
        rotate: { type: "spring", stiffness: 120, damping: 10 },
        scale: { type: "spring", stiffness: 150, damping: 12 }
      }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      // Accessibility attributes
      role="region"
      aria-label="Fun interpretation panel"
      tabIndex={0}
    >
      {/* ReactBits particle effects / confetti system */}
      {showConfetti && <ConfettiSystem />}
      
      <Header>
        <Icon
          animate={isHovered ? {
            rotate: [0, 15, -15, 10, -10, 0],
            scale: [1, 1.2, 1.1, 1.15, 1.05, 1.1]
          } : {
            rotate: [0, 5, -5, 0],
            scale: 1
          }}
          transition={{ 
            duration: isHovered ? 0.8 : 2, 
            repeat: isHovered ? 1 : Infinity, 
            repeatDelay: isHovered ? 0 : 3,
            ease: "easeInOut"
          }}
        >
          🎉
        </Icon>
        <Title>Fun Interpretation</Title>
      </Header>
      <Content
        initial={{ opacity: 0, y: 15, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ 
          duration: 0.7, 
          delay: 0.4,
          ease: [0.4, 0, 0.2, 1]
        }}
      >
        {content}
      </Content>
    </PanelContainer>
  );
};