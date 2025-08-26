import React, { useEffect, useState } from 'react';
import styled, { keyframes } from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';

const fall = keyframes`
  0% {
    transform: translateY(-100vh) rotate(0deg);
    opacity: 1;
  }
  100% {
    transform: translateY(100vh) rotate(360deg);
    opacity: 0;
  }
`;

const ConfettiContainer = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  overflow: hidden;
`;

const ConfettiPiece = styled(motion.div)<{ delay: number; duration: number; left: number }>`
  position: absolute;
  top: -10px;
  left: ${props => props.left}%;
  font-size: 1.2rem;
  animation: ${fall} ${props => props.duration}s linear ${props => props.delay}s forwards;
`;

const confettiEmojis = ['🎉', '🎊', '✨', '🌟', '💫', '🎈', '🎁', '🍾', '🥳', '🎭'];

interface ConfettiPiece {
  id: number;
  emoji: string;
  delay: number;
  duration: number;
  left: number;
}

export const ConfettiSystem: React.FC = () => {
  const [pieces, setPieces] = useState<ConfettiPiece[]>([]);

  useEffect(() => {
    const newPieces: ConfettiPiece[] = [];
    
    // Generate 20 confetti pieces
    for (let i = 0; i < 20; i++) {
      newPieces.push({
        id: i,
        emoji: confettiEmojis[Math.floor(Math.random() * confettiEmojis.length)],
        delay: Math.random() * 2, // 0-2 seconds delay
        duration: 2 + Math.random() * 2, // 2-4 seconds duration
        left: Math.random() * 100, // 0-100% left position
      });
    }
    
    setPieces(newPieces);

    // Clean up after animation completes
    const cleanup = setTimeout(() => {
      setPieces([]);
    }, 6000);

    return () => clearTimeout(cleanup);
  }, []);

  return (
    <ConfettiContainer>
      <AnimatePresence>
        {pieces.map((piece) => (
          <ConfettiPiece
            key={piece.id}
            delay={piece.delay}
            duration={piece.duration}
            left={piece.left}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {piece.emoji}
          </ConfettiPiece>
        ))}
      </AnimatePresence>
    </ConfettiContainer>
  );
};