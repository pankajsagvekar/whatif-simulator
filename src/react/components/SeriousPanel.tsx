import React, { useState } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';

// ReactBits-inspired Card component with professional styling
const PanelContainer = styled(motion.div)`
  background: ${props => props.theme.serious.background};
  border: 2px solid ${props => props.theme.serious.border};
  border-radius: 16px;
  padding: 2rem;
  box-shadow: 
    0 4px 20px rgba(0, 0, 0, 0.08),
    0 1px 3px rgba(0, 0, 0, 0.1);
  position: relative;
  overflow: hidden;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  backdrop-filter: blur(10px);
  
  /* ReactBits-style calm colors and professional appearance */
  &:hover {
    transform: perspective(1000px) rotateX(2deg) rotateY(2deg) translateY(-4px);
    box-shadow: 
      0 12px 40px rgba(99, 102, 241, 0.15),
      0 4px 12px rgba(0, 0, 0, 0.1);
    border-color: ${props => props.theme.serious.glow};
  }

  /* Glowing border effect */
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
    background: linear-gradient(90deg, 
      ${props => props.theme.serious.glow}, 
      transparent 70%
    );
    opacity: 0;
    transition: opacity 0.4s ease;
  }

  &:hover::before {
    opacity: 1;
  }

  /* Subtle inner glow on hover */
  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: radial-gradient(
      circle at 50% 0%, 
      ${props => props.theme.serious.glow}10 0%, 
      transparent 50%
    );
    opacity: 0;
    transition: opacity 0.4s ease;
    pointer-events: none;
  }

  &:hover::after {
    opacity: 1;
  }

  /* Accessibility improvements */
  &:focus-within {
    outline: 2px solid ${props => props.theme.serious.glow};
    outline-offset: 2px;
  }
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid ${props => props.theme.serious.border};
  position: relative;
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
  background: ${props => props.theme.serious.glow}15;
  transition: all 0.3s ease;
`;

const Title = styled.h3`
  color: ${props => props.theme.serious.text};
  font-size: 1.25rem;
  font-weight: 600;
  letter-spacing: -0.025em;
`;

const Content = styled(motion.div)`
  color: ${props => props.theme.serious.text};
  line-height: 1.7;
  font-size: 1rem;
  white-space: pre-wrap;
  position: relative;
  z-index: 1;
  
  /* Enhanced typography for better readability */
  p {
    margin-bottom: 1rem;
    
    &:last-child {
      margin-bottom: 0;
    }
  }
`;

interface SeriousPanelProps {
  content: string;
}

export const SeriousPanel: React.FC<SeriousPanelProps> = ({ content }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <PanelContainer
      // ReactBits-style fade-in entrance animation with gentle slide effect
      initial={{ opacity: 0, x: -50, y: 20 }}
      animate={{ opacity: 1, x: 0, y: 0 }}
      transition={{ 
        duration: 0.8, 
        ease: [0.4, 0, 0.2, 1], // Custom easing for professional feel
        delay: 0.1 
      }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      // Accessibility attributes
      role="region"
      aria-label="Serious analysis panel"
      tabIndex={0}
    >
      <Header>
        <Icon
          animate={isHovered ? { 
            scale: 1.1,
            backgroundColor: `${isHovered ? 'rgba(99, 102, 241, 0.2)' : 'rgba(99, 102, 241, 0.1)'}` 
          } : { scale: 1 }}
          transition={{ duration: 0.3 }}
        >
          🎯
        </Icon>
        <Title>Serious Analysis</Title>
      </Header>
      <Content
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.3 }}
      >
        {content}
      </Content>
    </PanelContainer>
  );
};