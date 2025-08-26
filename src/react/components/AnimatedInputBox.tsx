import React, { useState, useRef, useEffect } from 'react';
import styled, { keyframes, css } from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';

// ReactBits-inspired typing animation
const typewriter = keyframes`
  from { width: 0; }
  to { width: 100%; }
`;

const blink = keyframes`
  0%, 50% { border-right-color: transparent; }
  51%, 100% { border-right-color: currentColor; }
`;

const InputContainer = styled.div`
  position: relative;
  margin-bottom: 1.5rem;
  width: 100%;
  max-width: 600px;
  margin-left: auto;
  margin-right: auto;
`;

// ReactBits-inspired Input component with enhanced animations
const StyledInput = styled(motion.input)`
  width: 100%;
  padding: 1.2rem 1.5rem;
  font-size: 1.1rem;
  border: 2px solid ${props => props.theme.input.border};
  border-radius: 16px;
  background: ${props => props.theme.input.background};
  color: ${props => props.theme.text};
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  outline: none;
  font-family: inherit;
  line-height: 1.5;

  /* ReactBits-style focus transitions */
  &:focus {
    border-color: ${props => props.theme.input.focus};
    box-shadow: 
      0 0 0 3px ${props => props.theme.input.focus}33,
      0 8px 25px -8px ${props => props.theme.input.focus}40;
    transform: translateY(-3px) scale(1.01);
  }

  &:hover:not(:focus) {
    border-color: ${props => props.theme.input.focus}80;
    transform: translateY(-1px);
  }

  &::placeholder {
    color: transparent;
  }
`;

// ReactBits-inspired animated placeholder with typing effect
const AnimatedPlaceholder = styled(motion.div)`
  position: absolute;
  left: 1.5rem;
  top: 50%;
  transform: translateY(-50%);
  color: ${props => props.theme.text}66;
  font-size: 1.1rem;
  pointer-events: none;
  white-space: nowrap;
  overflow: hidden;
  font-family: inherit;
  line-height: 1.5;
`;

const TypingText = styled(motion.span)<{ isTyping: boolean }>`
  display: inline-block;
  overflow: hidden;
  white-space: nowrap;
  border-right: 2px solid currentColor;
  ${props => props.isTyping ? css`
    animation: ${typewriter} 2s steps(40, end), ${blink} 1s step-end infinite;
  ` : css`
    animation: ${blink} 1s step-end infinite;
  `}
  
  &.typing-complete {
    border-right-color: transparent;
  }
`;

const FocusIndicator = styled(motion.div)`
  position: absolute;
  bottom: -2px;
  left: 0;
  right: 0;
  height: 2px;
  background: linear-gradient(90deg, 
    ${props => props.theme.input.focus}00 0%,
    ${props => props.theme.input.focus} 50%,
    ${props => props.theme.input.focus}00 100%
  );
  border-radius: 1px;
`;

interface AnimatedInputBoxProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit?: () => void;
  placeholder?: string;
  isLoading?: boolean;
  error?: string;
}

// ReactBits-inspired placeholder examples with variety
const placeholderExamples = [
  "What if I skipped gym today?",
  "What if I quit my job tomorrow?",
  "What if I moved to Mars?",
  "What if I could fly?",
  "What if I won the lottery?",
  "What if I became invisible?",
  "What if I could read minds?",
  "What if I never slept again?",
  "What if I could time travel?",
  "What if I lived underwater?",
  "What if gravity stopped working?",
  "What if I could speak to animals?",
];

export const AnimatedInputBox: React.FC<AnimatedInputBoxProps> = ({
  value,
  onChange,
  onSubmit,
  placeholder = "What if I skipped gym today?",
  isLoading = false,
  error,
}) => {
  const [currentPlaceholder, setCurrentPlaceholder] = useState(0);
  const [showPlaceholder, setShowPlaceholder] = useState(true);
  const [isFocused, setIsFocused] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [typingComplete, setTypingComplete] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // ReactBits-inspired placeholder cycling with typing animation
  useEffect(() => {
    if (!isFocused && !value && !isLoading) {
      const cycleInterval = setInterval(() => {
        setShowPlaceholder(false);
        setIsTyping(false);
        setTypingComplete(false);
        
        setTimeout(() => {
          setCurrentPlaceholder((prev) => (prev + 1) % placeholderExamples.length);
          setShowPlaceholder(true);
          setIsTyping(true);
          
          // Complete typing animation after text length * 50ms + 500ms buffer
          const currentText = placeholderExamples[(currentPlaceholder + 1) % placeholderExamples.length];
          setTimeout(() => {
            setIsTyping(false);
            setTypingComplete(true);
          }, currentText.length * 50 + 500);
        }, 400);
      }, 4000);

      return () => clearInterval(cycleInterval);
    }
  }, [isFocused, value, isLoading, currentPlaceholder]);

  // Initial typing animation
  useEffect(() => {
    if (showPlaceholder && !isFocused && !value) {
      setIsTyping(true);
      const currentText = placeholderExamples[currentPlaceholder];
      setTimeout(() => {
        setIsTyping(false);
        setTypingComplete(true);
      }, currentText.length * 50 + 500);
    }
  }, [showPlaceholder, currentPlaceholder, isFocused, value]);

  const handleFocus = () => {
    setIsFocused(true);
    setShowPlaceholder(false);
    setIsTyping(false);
    setTypingComplete(false);
  };

  const handleBlur = () => {
    setIsFocused(false);
    if (!value) {
      setTimeout(() => {
        setShowPlaceholder(true);
      }, 200);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && onSubmit && value.trim()) {
      onSubmit();
    }
  };

  return (
    <InputContainer>
      <StyledInput
        ref={inputRef}
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={handleFocus}
        onBlur={handleBlur}
        onKeyPress={handleKeyPress}
        placeholder=""
        disabled={isLoading}
        initial={{ scale: 0.95, opacity: 0, y: 20 }}
        animate={{ 
          scale: 1, 
          opacity: 1, 
          y: 0,
          borderColor: error ? '#ef4444' : undefined
        }}
        transition={{ 
          duration: 0.6, 
          ease: [0.4, 0, 0.2, 1],
          delay: 0.1
        }}
        whileFocus={{ 
          scale: 1.01,
          transition: { duration: 0.2 }
        }}
        whileHover={!isFocused ? { 
          y: -2,
          transition: { duration: 0.2 }
        } : {}}
      />
      
      {/* ReactBits-inspired focus indicator */}
      <AnimatePresence>
        {isFocused && (
          <FocusIndicator
            initial={{ scaleX: 0, opacity: 0 }}
            animate={{ scaleX: 1, opacity: 1 }}
            exit={{ scaleX: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
          />
        )}
      </AnimatePresence>
      
      {/* ReactBits-inspired animated placeholder with typing effect */}
      <AnimatePresence mode="wait">
        {showPlaceholder && !value && !isFocused && !isLoading && (
          <AnimatedPlaceholder
            key={currentPlaceholder}
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 0.7, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ 
              duration: 0.4, 
              ease: [0.4, 0, 0.2, 1]
            }}
          >
            <TypingText 
              isTyping={isTyping}
              className={typingComplete ? 'typing-complete' : ''}
            >
              {placeholderExamples[currentPlaceholder]}
            </TypingText>
          </AnimatedPlaceholder>
        )}
      </AnimatePresence>

      {/* Error message */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            style={{
              position: 'absolute',
              top: '100%',
              left: '1.5rem',
              marginTop: '0.5rem',
              color: '#ef4444',
              fontSize: '0.875rem',
              fontWeight: 500,
            }}
          >
            {error}
          </motion.div>
        )}
      </AnimatePresence>
    </InputContainer>
  );
};