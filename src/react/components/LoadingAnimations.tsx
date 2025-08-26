import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { animationEngine } from '../services/AnimationEngine';

const LoadingContainer = styled(motion.div)`
  grid-column: 1 / -1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 2rem;
  text-align: center;
  min-height: 300px;
  position: relative;
`;

const ThinkingEmoji = styled(motion.div)`
  font-size: 4rem;
  margin-bottom: 1.5rem;
  cursor: default;
  user-select: none;
  filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.1));
`;

const RobotContainer = styled(motion.div)`
  display: flex;
  align-items: center;
  margin-bottom: 2rem;
  padding: 1rem 1.5rem;
  background: ${props => props.theme.background}80;
  border-radius: 20px;
  backdrop-filter: blur(10px);
  border: 1px solid ${props => props.theme.primary}20;
`;

const Robot = styled(motion.div)`
  font-size: 2rem;
  margin-right: 1rem;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1));
`;

const TypingDots = styled(motion.div)`
  display: flex;
  gap: 0.4rem;
  align-items: center;
`;

const Dot = styled(motion.div)`
  width: 10px;
  height: 10px;
  background: ${props => props.theme.primary};
  border-radius: 50%;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
`;

const LoadingText = styled(motion.p)`
  font-size: 1.2rem;
  color: ${props => props.theme.text};
  opacity: 0.8;
  margin-bottom: 1.5rem;
  font-weight: 500;
  letter-spacing: 0.5px;
`;

const ProgressBar = styled(motion.div)`
  width: 320px;
  height: 6px;
  background: ${props => props.theme.input?.border || props.theme.border};
  border-radius: 3px;
  overflow: hidden;
  margin-top: 1rem;
  box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.1);
`;

const ProgressFill = styled(motion.div)`
  height: 100%;
  background: linear-gradient(90deg, 
    ${props => props.theme.primary}, 
    ${props => props.theme.secondary || props.theme.primary}
  );
  border-radius: 3px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
`;

const StatusIndicator = styled(motion.div)`
  position: absolute;
  top: 1rem;
  right: 1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: ${props => props.theme.primary}15;
  border-radius: 20px;
  font-size: 0.9rem;
  color: ${props => props.theme.primary};
  font-weight: 500;
`;

const loadingMessages = [
  "Analyzing your scenario...",
  "Generating serious outcomes...",
  "Creating fun interpretations...",
  "Polishing the results...",
  "Almost ready..."
];

export interface LoadingAnimationsProps {
  type?: 'thinking' | 'typing' | 'processing';
  message?: string;
  progress?: number;
  onComplete?: () => void;
}

export const LoadingAnimations: React.FC<LoadingAnimationsProps> = ({
  type = 'thinking',
  message,
  progress,
  onComplete
}) => {
  const [messageIndex, setMessageIndex] = useState(0);
  const [currentProgress, setCurrentProgress] = useState(0);

  // Get animations from AnimationEngine
  const thinkingAnimation = animationEngine.getLoadingAnimation('thinking');
  const typingAnimation = animationEngine.getLoadingAnimation('typing');
  const containerAnimation = animationEngine.getStaggeredChildren(0.2);

  useEffect(() => {
    const messageInterval = setInterval(() => {
      setMessageIndex((prev) => (prev + 1) % loadingMessages.length);
    }, 1800);

    return () => clearInterval(messageInterval);
  }, []);

  useEffect(() => {
    if (progress !== undefined) {
      setCurrentProgress(progress);
    } else {
      // Auto-increment progress
      const progressInterval = setInterval(() => {
        setCurrentProgress((prev) => {
          const newProgress = Math.min(prev + Math.random() * 15, 95);
          if (newProgress >= 95 && onComplete) {
            setTimeout(onComplete, 500);
          }
          return newProgress;
        });
      }, 200);

      return () => clearInterval(progressInterval);
    }
  }, [progress, onComplete]);

  const renderThinkingAnimation = () => (
    <ThinkingEmoji
      variants={thinkingAnimation}
      animate="animate"
      initial={{ scale: 0, rotate: -10 }}
      transition={{
        scale: { duration: 0.5, type: "spring", stiffness: 200 },
        ...thinkingAnimation.transition
      }}
    >
      🤔
    </ThinkingEmoji>
  );

  const renderTypingAnimation = () => (
    <RobotContainer
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, delay: 0.2 }}
    >
      <Robot
        animate={{ 
          rotate: [0, -5, 5, 0],
          scale: [1, 1.05, 1]
        }}
        transition={{ 
          duration: 2, 
          repeat: Infinity, 
          ease: "easeInOut" 
        }}
      >
        🤖
      </Robot>
      <TypingDots variants={typingAnimation} animate="animate">
        {[0, 1, 2].map((index) => (
          <Dot
            key={index}
            variants={{
              animate: {
                scale: [0.8, 1.2, 0.8],
                opacity: [0.3, 1, 0.3]
              }
            }}
            transition={{
              duration: 0.8,
              repeat: Infinity,
              delay: index * 0.2,
              ease: "easeInOut"
            }}
          />
        ))}
      </TypingDots>
    </RobotContainer>
  );

  const renderProcessingAnimation = () => (
    <>
      {renderThinkingAnimation()}
      {renderTypingAnimation()}
    </>
  );

  return (
    <LoadingContainer
      variants={containerAnimation}
      initial="hidden"
      animate="visible"
      exit="hidden"
    >
      <StatusIndicator
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.5 }}
      >
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
        >
          ⚡
        </motion.div>
        Processing
      </StatusIndicator>

      {type === 'thinking' && renderThinkingAnimation()}
      {type === 'typing' && renderTypingAnimation()}
      {type === 'processing' && renderProcessingAnimation()}

      <AnimatePresence mode="wait">
        <LoadingText
          key={message || messageIndex}
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 0.8, y: 0 }}
          exit={{ opacity: 0, y: -15 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
        >
          {message || loadingMessages[messageIndex]}
        </LoadingText>
      </AnimatePresence>

      <ProgressBar
        initial={{ opacity: 0, scaleX: 0 }}
        animate={{ opacity: 1, scaleX: 1 }}
        transition={{ duration: 0.6, delay: 0.8 }}
      >
        <ProgressFill
          initial={{ width: "0%" }}
          animate={{ width: `${currentProgress}%` }}
          transition={{ 
            duration: 0.5, 
            ease: "easeOut",
            type: "spring",
            stiffness: 100
          }}
        />
      </ProgressBar>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.6 }}
        transition={{ delay: 1 }}
        style={{
          fontSize: '0.9rem',
          marginTop: '1rem',
          color: 'currentColor'
        }}
      >
        {Math.round(currentProgress)}% complete
      </motion.div>
    </LoadingContainer>
  );
};

// Individual loading components for specific use cases
export const ThinkingLoader: React.FC<{ message?: string }> = ({ message }) => (
  <LoadingAnimations type="thinking" message={message} />
);

export const TypingLoader: React.FC<{ message?: string }> = ({ message }) => (
  <LoadingAnimations type="typing" message={message} />
);

export const ProcessingLoader: React.FC<{ 
  message?: string; 
  progress?: number; 
  onComplete?: () => void;
}> = ({ message, progress, onComplete }) => (
  <LoadingAnimations 
    type="processing" 
    message={message} 
    progress={progress} 
    onComplete={onComplete} 
  />
);