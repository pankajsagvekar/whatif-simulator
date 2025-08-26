import React, { useState } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { ReactWhatIfService } from './services/ReactWhatIfService';
import { SplitScreenContainer } from './components/SplitScreenContainer';
import { AnimatedInputBox } from './components/AnimatedInputBox';
import { AnimatedSubmitButton } from './components/AnimatedSubmitButton';
import { ThemeToggle } from './components/ThemeToggle';
import { useTheme } from './providers/ThemeProvider';

const AppContainer = styled.div`
  min-height: 100vh;
  background: ${props => props.theme.background};
  color: ${props => props.theme.text};
  transition: all 0.3s ease;
`;

const Header = styled.header`
  padding: 2rem;
  text-align: center;
  position: relative;
`;

const Title = styled(motion.h1)`
  font-size: 3rem;
  font-weight: bold;
  margin-bottom: 1rem;
  background: linear-gradient(45deg, ${props => props.theme.primary}, ${props => props.theme.secondary});
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
`;

const Subtitle = styled.p`
  font-size: 1.2rem;
  opacity: 0.8;
  margin-bottom: 2rem;
`;

const InputSection = styled.div`
  max-width: 600px;
  margin: 0 auto 3rem;
  padding: 0 2rem;
`;

const ErrorMessage = styled(motion.div)`
  background: #fee2e2;
  color: #dc2626;
  padding: 0.75rem 1rem;
  border-radius: 8px;
  margin-bottom: 1rem;
  text-align: center;
  border: 1px solid #fecaca;
`;

const App: React.FC = () => {
  const [scenario, setScenario] = useState('');
  const [results, setResults] = useState<{serious: string, fun: string} | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [inputError, setInputError] = useState<string | null>(null);

  const { isDarkMode } = useTheme();
  const service = new ReactWhatIfService();

  const handleInputChange = (value: string) => {
    setScenario(value);
    // Clear input error when user starts typing
    if (inputError) {
      setInputError(null);
    }
    // Clear general error when user modifies input
    if (error) {
      setError(null);
    }
  };

  const handleSubmit = async () => {
    const validation = service.validateInput(scenario);
    if (!validation.isValid) {
      setInputError(validation.message || 'Invalid input');
      return;
    }
    
    setInputError(null);
    setError(null);
    setIsLoading(true);
    
    try {
      // Use sanitized input if available
      const inputToProcess = validation.sanitizedInput || scenario;
      const result = await service.processScenario(inputToProcess);
      setResults({
        serious: result.seriousVersion,
        fun: result.funVersion
      });
    } catch (error) {
      console.error('Error processing scenario:', error);
      setError('Failed to process scenario. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AppContainer>
      <Header>
        <ThemeToggle />
        <Title
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          What If Simulator
        </Title>
        <Subtitle>
          Explore scenarios with serious analysis and creative fun
        </Subtitle>
        
        <InputSection>
          {error && (
            <ErrorMessage
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              {error}
            </ErrorMessage>
          )}
          <AnimatedInputBox
            value={scenario}
            onChange={handleInputChange}
            onSubmit={handleSubmit}
            placeholder="What if I skipped gym today?"
            isLoading={isLoading}
            error={inputError}
          />
          <AnimatedSubmitButton
            onClick={handleSubmit}
            disabled={!scenario.trim() || isLoading}
            isLoading={isLoading}
          />
        </InputSection>
      </Header>

      <SplitScreenContainer
        results={results}
        isLoading={isLoading}
      />
    </AppContainer>
  );
};

export default App;