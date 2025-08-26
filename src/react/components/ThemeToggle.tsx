import React from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../providers/ThemeProvider';

const ToggleContainer = styled.div`
  position: absolute;
  top: 2rem;
  right: 2rem;
  z-index: 10;
`;

const ToggleButton = styled(motion.button)`
  width: 70px;
  height: 36px;
  border-radius: 18px;
  border: 2px solid ${props => props.theme.primary};
  cursor: pointer;
  position: relative;
  background: ${props => props.theme.isDarkMode ? 
    'linear-gradient(135deg, #1e293b 0%, #334155 100%)' : 
    'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)'
  };
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  outline: none;
  overflow: hidden;

  &:focus {
    box-shadow: 0 0 0 3px ${props => props.theme.primary}40;
  }

  &:hover {
    box-shadow: 0 4px 12px ${props => props.theme.primary}30;
  }
`;

const ToggleCircle = styled(motion.div)`
  width: 30px;
  height: 30px;
  border-radius: 50%;
  background: ${props => props.theme.isDarkMode ? 
    'linear-gradient(135deg, #475569 0%, #64748b 100%)' : 
    'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)'
  };
  position: absolute;
  top: 1px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1rem;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  border: 1px solid ${props => props.theme.isDarkMode ? '#64748b' : '#e2e8f0'};
`;

const IconContainer = styled(motion.div)`
  position: absolute;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
`;

const SunIcon = styled(motion.div)`
  font-size: 1rem;
  filter: drop-shadow(0 0 4px #fbbf24);
`;

const MoonIcon = styled(motion.div)`
  font-size: 1rem;
  filter: drop-shadow(0 0 4px #818cf8);
`;

const StarField = styled(motion.div)`
  position: absolute;
  width: 100%;
  height: 100%;
  pointer-events: none;
`;

const Star = styled(motion.div)<{ delay: number }>`
  position: absolute;
  width: 2px;
  height: 2px;
  background: #ffffff;
  border-radius: 50%;
  box-shadow: 0 0 2px #ffffff;
`;

interface ThemeToggleProps {
  className?: string;
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({ className }) => {
  const { isDarkMode, toggleTheme } = useTheme();

  const stars = Array.from({ length: 6 }, (_, i) => ({
    id: i,
    x: Math.random() * 60 + 5,
    y: Math.random() * 20 + 8,
    delay: Math.random() * 2,
  }));

  return (
    <ToggleContainer className={className}>
      <ToggleButton
        onClick={toggleTheme}
        whileHover={{ 
          scale: 1.05,
          boxShadow: `0 6px 16px ${isDarkMode ? '#818cf8' : '#fbbf24'}40`
        }}
        whileTap={{ scale: 0.95 }}
        transition={{ 
          type: "spring", 
          stiffness: 400, 
          damping: 25 
        }}
      >
        {/* Star field for dark mode */}
        <AnimatePresence>
          {isDarkMode && (
            <StarField
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              {stars.map((star) => (
                <Star
                  key={star.id}
                  delay={star.delay}
                  data-testid={`star-${star.id}`}
                  style={{ left: `${star.x}%`, top: `${star.y}%` }}
                  animate={{
                    opacity: [0, 1, 0],
                    scale: [0.5, 1, 0.5],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    delay: star.delay,
                    ease: "easeInOut",
                  }}
                />
              ))}
            </StarField>
          )}
        </AnimatePresence>

        <ToggleCircle
          animate={{ 
            x: isDarkMode ? 32 : 2,
            rotate: isDarkMode ? 360 : 0,
            background: isDarkMode ? 
              'linear-gradient(135deg, #475569 0%, #64748b 100%)' : 
              'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)'
          }}
          transition={{ 
            type: "spring", 
            stiffness: 500, 
            damping: 30,
            rotate: { duration: 0.6, ease: "easeInOut" }
          }}
        >
          <AnimatePresence mode="wait">
            {isDarkMode ? (
              <IconContainer
                key="moon"
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                exit={{ scale: 0, rotate: 180 }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
              >
                <MoonIcon
                  animate={{
                    rotate: [0, 5, -5, 0],
                  }}
                  transition={{
                    duration: 4,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                >
                  🌙
                </MoonIcon>
              </IconContainer>
            ) : (
              <IconContainer
                key="sun"
                initial={{ scale: 0, rotate: 180 }}
                animate={{ scale: 1, rotate: 0 }}
                exit={{ scale: 0, rotate: -180 }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
              >
                <SunIcon
                  animate={{
                    rotate: [0, 360],
                  }}
                  transition={{
                    duration: 8,
                    repeat: Infinity,
                    ease: "linear",
                  }}
                >
                  ☀️
                </SunIcon>
              </IconContainer>
            )}
          </AnimatePresence>
        </ToggleCircle>
      </ToggleButton>
    </ToggleContainer>
  );
};