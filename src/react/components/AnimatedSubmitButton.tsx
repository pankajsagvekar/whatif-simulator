import React, { useState } from 'react';
import styled, { keyframes, css } from 'styled-components';
import { motion } from 'framer-motion';
import { Bounce, ClickSpark } from 'reactbits-animation';
import { ConfettiSystem } from './ConfettiSystem';

// ReactBits-style pulse animation for loading states
const pulse = keyframes`
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.8; transform: scale(1.02); }
`;

// ReactBits-inspired button container with enhanced positioning
const ButtonContainer = styled.div`
  position: relative;
  display: flex;
  justify-content: center;
  margin-top: 1.5rem;
  z-index: 10;
`;

// ReactBits Button component with enhanced animations and styling
const StyledButton = styled(motion.button) <{ disabled: boolean; isLoading: boolean }>`
  padding: 1.2rem 2.5rem;
  font-size: 1.1rem;
  font-weight: 600;
  border: none;
  border-radius: 16px;
  background: ${props => {
    if (props.disabled) return props.theme.input.border;
    if (props.isLoading) return props.theme.button.background;
    return `linear-gradient(135deg, ${props.theme.button.background}, ${props.theme.button.hover})`;
  }};
  color: ${props => props.theme.button.text};
  cursor: ${props => props.disabled ? 'not-allowed' : 'pointer'};
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
  font-family: inherit;
  min-width: 200px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  width: 100%;

  /* Enhanced hover effects - ReactBits Bounce will handle the bounce animation */
  &:hover:not(:disabled) {
    background: ${props => props.isLoading ? props.theme.button.background : `linear-gradient(135deg, ${props.theme.button.hover}, ${props.theme.button.background})`};
    transform: translateY(-2px);
    box-shadow: 0 12px 30px rgba(0, 0, 0, 0.2);
  }

  &:active:not(:disabled) {
    transform: translateY(-1px) scale(0.98);
    transition: all 0.1s ease;
  }

  /* ReactBits-inspired loading state animation */
  ${props => props.isLoading && css`
    animation: ${pulse} 2s ease-in-out infinite;
  `}

  /* ReactBits-style ripple effect */
  &::before {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    width: 0;
    height: 0;
    background: rgba(255, 255, 255, 0.4);
    border-radius: 50%;
    transform: translate(-50%, -50%);
    transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
    pointer-events: none;
  }

  &:hover:not(:disabled)::before {
    width: 300px;
    height: 300px;
  }

  /* ReactBits-inspired focus states for accessibility */
  &:focus-visible {
    outline: none;
    box-shadow: 0 0 0 3px ${props => props.theme.button.background}40;
  }
`;

const ButtonText = styled(motion.span)`
  position: relative;
  z-index: 2;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
`;

// ReactBits-inspired loading spinner with enhanced animation
const LoadingSpinner = styled(motion.div)`
  display: inline-block;
  width: 20px;
  height: 20px;
  border: 2px solid transparent;
  border-top: 2px solid currentColor;
  border-right: 2px solid currentColor;
  border-radius: 50%;
`;



interface AnimatedSubmitButtonProps {
  onClick: () => void;
  disabled?: boolean;
  isLoading?: boolean;
  text?: string;
  loadingText?: string;
  variant?: 'primary' | 'secondary';
  onSubmit?: () => void;
}

export const AnimatedSubmitButton: React.FC<AnimatedSubmitButtonProps> = ({
  onClick,
  disabled = false,
  isLoading = false,
  text = 'Explore Possibilities',
  loadingText = 'Analyzing...',
  onSubmit,
}) => {
  const [showConfetti, setShowConfetti] = useState(false);
  const [isClicked, setIsClicked] = useState(false);

  const handleClick = () => {
    if (disabled || isLoading) return;

    // Set clicked state for visual feedback
    setIsClicked(true);

    // Trigger confetti explosion
    setShowConfetti(true);
    setTimeout(() => setShowConfetti(false), 2000);

    // Reset clicked state after animation
    setTimeout(() => setIsClicked(false), 300);

    // Call the onClick handler
    onClick();

    // Call onSubmit if provided (for standalone usage)
    if (onSubmit) {
      onSubmit();
    }
  };

  return (
    <ButtonContainer>
      {showConfetti && <ConfettiSystem />}

      {/* ReactBits ClickSpark for confetti explosion effect */}
      <ClickSpark
        sparkColor="#FFD700"
        sparkSize={8}
        sparkRadius={50}
        sparkCount={12}
        duration={800}
        easing="ease-out"
        extraScale={1.1}
      >
        {/* ReactBits Bounce for hover bounce animation */}
        <Bounce>
          <StyledButton
            type="button"
            disabled={disabled || isLoading}
            isLoading={isLoading}
            onClick={handleClick}
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{
              scale: 1,
              opacity: 1,
              y: isClicked ? -2 : 0
            }}
            transition={{
              duration: 0.5,
              delay: 0.2,
              y: { duration: 0.1 }
            }}
            whileHover={{
              scale: disabled || isLoading ? 1 : 1.02,
              y: disabled || isLoading ? 0 : -2
            }}
            whileTap={{
              scale: disabled || isLoading ? 1 : 0.98,
              y: disabled || isLoading ? 0 : 0
            }}
          >
            {isLoading && (
              <LoadingSpinner
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              />
            )}
            <ButtonText>
              {isLoading ? loadingText : text}
            </ButtonText>
          </StyledButton>
        </Bounce>
      </ClickSpark>
    </ButtonContainer>
  );
};