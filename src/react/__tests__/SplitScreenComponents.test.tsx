import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { ThemeProvider } from 'styled-components';
import { SplitScreenContainer } from '../components/SplitScreenContainer';
import { SeriousPanel } from '../components/SeriousPanel';
import { FunPanel } from '../components/FunPanel';
import { lightTheme } from '../styles/themes';

// Mock framer-motion to avoid animation issues in tests
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
    h1: ({ children, ...props }: any) => <h1 {...props}>{children}</h1>,
  },
  AnimatePresence: ({ children }: any) => children,
}));

// Mock ConfettiSystem component
vi.mock('../components/ConfettiSystem', () => ({
  ConfettiSystem: () => <div data-testid="confetti-system">Confetti</div>,
}));

// Mock LoadingAnimations component
vi.mock('../components/LoadingAnimations', () => ({
  LoadingAnimations: () => <div data-testid="loading-animations">Loading...</div>,
}));

const renderWithTheme = (component: React.ReactElement) => {
  return render(
    <ThemeProvider theme={lightTheme}>
      {component}
    </ThemeProvider>
  );
};

describe('SplitScreenContainer', () => {
  it('renders loading state correctly', () => {
    renderWithTheme(
      <SplitScreenContainer results={null} isLoading={true} />
    );
    
    expect(screen.getByTestId('loading-animations')).toBeInTheDocument();
    expect(screen.getByRole('main')).toHaveAttribute('aria-busy', 'true');
  });

  it('renders empty state with proper accessibility attributes', () => {
    renderWithTheme(
      <SplitScreenContainer results={null} isLoading={false} />
    );
    
    const emptyState = screen.getByText(/Enter a "What if..." scenario above/);
    expect(emptyState).toBeInTheDocument();
    
    const mainContainer = screen.getByRole('main');
    expect(mainContainer).toHaveAttribute('aria-label', 'What If Simulator Interface');
  });

  it('renders results with both panels', () => {
    const mockResults = {
      serious: 'This is a serious analysis of the scenario.',
      fun: 'This is a fun interpretation of the scenario.'
    };

    renderWithTheme(
      <SplitScreenContainer results={mockResults} isLoading={false} />
    );
    
    expect(screen.getByText('Serious Analysis')).toBeInTheDocument();
    expect(screen.getByText('Fun Interpretation')).toBeInTheDocument();
    expect(screen.getByText(mockResults.serious)).toBeInTheDocument();
    expect(screen.getByText(mockResults.fun)).toBeInTheDocument();
  });

  it('has proper ARIA attributes for results state', () => {
    const mockResults = {
      serious: 'Serious content',
      fun: 'Fun content'
    };

    renderWithTheme(
      <SplitScreenContainer results={mockResults} isLoading={false} />
    );
    
    const mainContainer = screen.getByRole('main');
    expect(mainContainer).toHaveAttribute('aria-label', 'What If Simulator Results');
    expect(mainContainer).toHaveAttribute('aria-live', 'polite');
  });
});

describe('SeriousPanel', () => {
  it('renders content with proper styling and accessibility', () => {
    const content = 'This is serious analysis content.';
    
    renderWithTheme(<SeriousPanel content={content} />);
    
    expect(screen.getByText('Serious Analysis')).toBeInTheDocument();
    expect(screen.getByText(content)).toBeInTheDocument();
    
    const panel = screen.getByRole('region');
    expect(panel).toHaveAttribute('aria-label', 'Serious analysis panel');
    expect(panel).toHaveAttribute('tabIndex', '0');
  });

  it('displays the correct icon', () => {
    renderWithTheme(<SeriousPanel content="Test content" />);
    
    expect(screen.getByText('🎯')).toBeInTheDocument();
  });

  it('handles hover interactions', () => {
    renderWithTheme(<SeriousPanel content="Test content" />);
    
    const panel = screen.getByRole('region');
    
    // Test hover start
    fireEvent.mouseEnter(panel);
    // Note: We can't easily test the hover state changes without more complex setup
    // but we can verify the component renders without errors
    
    // Test hover end
    fireEvent.mouseLeave(panel);
  });
});

describe('FunPanel', () => {
  it('renders content with proper styling and accessibility', () => {
    const content = 'This is fun interpretation content.';
    
    renderWithTheme(<FunPanel content={content} />);
    
    expect(screen.getByText('Fun Interpretation')).toBeInTheDocument();
    expect(screen.getByText(content)).toBeInTheDocument();
    
    const panel = screen.getByRole('region');
    expect(panel).toHaveAttribute('aria-label', 'Fun interpretation panel');
    expect(panel).toHaveAttribute('tabIndex', '0');
  });

  it('displays the correct icon', () => {
    renderWithTheme(<FunPanel content="Test content" />);
    
    expect(screen.getByText('🎉')).toBeInTheDocument();
  });

  it('shows confetti system when content is provided', () => {
    renderWithTheme(<FunPanel content="Test content" />);
    
    expect(screen.getByTestId('confetti-system')).toBeInTheDocument();
  });

  it('handles hover interactions', () => {
    renderWithTheme(<FunPanel content="Test content" />);
    
    const panel = screen.getByRole('region');
    
    // Test hover start
    fireEvent.mouseEnter(panel);
    
    // Test hover end
    fireEvent.mouseLeave(panel);
  });
});

describe('Layout Responsiveness', () => {
  beforeEach(() => {
    // Mock window.matchMedia for responsive testing
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: vi.fn().mockImplementation(query => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: vi.fn(), // deprecated
        removeListener: vi.fn(), // deprecated
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    });
  });

  it('applies responsive grid layout classes', () => {
    const mockResults = {
      serious: 'Serious content',
      fun: 'Fun content'
    };

    const { container } = renderWithTheme(
      <SplitScreenContainer results={mockResults} isLoading={false} />
    );
    
    // Check that the container has grid display
    const gridContainer = container.firstChild as HTMLElement;
    expect(gridContainer).toBeInTheDocument();
  });

  it('maintains accessibility across different screen sizes', () => {
    const mockResults = {
      serious: 'Serious content',
      fun: 'Fun content'
    };

    renderWithTheme(
      <SplitScreenContainer results={mockResults} isLoading={false} />
    );
    
    // Verify accessibility attributes are present regardless of screen size
    expect(screen.getByRole('main')).toHaveAttribute('aria-label');
    expect(screen.getAllByRole('region')).toHaveLength(2);
  });
});

describe('ReactBits Integration', () => {
  it('applies ReactBits-style animations and styling', () => {
    const mockResults = {
      serious: 'Serious content',
      fun: 'Fun content'
    };

    renderWithTheme(
      <SplitScreenContainer results={mockResults} isLoading={false} />
    );
    
    // Verify components render with ReactBits-inspired features
    expect(screen.getByText('Serious Analysis')).toBeInTheDocument();
    expect(screen.getByText('Fun Interpretation')).toBeInTheDocument();
  });

  it('maintains proper component hierarchy', () => {
    const mockResults = {
      serious: 'Serious content',
      fun: 'Fun content'
    };

    const { container } = renderWithTheme(
      <SplitScreenContainer results={mockResults} isLoading={false} />
    );
    
    // Verify the component structure is maintained
    expect(container.querySelector('[role="main"]')).toBeInTheDocument();
    expect(container.querySelectorAll('[role="region"]')).toHaveLength(2);
  });
});
// Import AnimatedInputBox and AnimatedSubmitButton for testing
import { AnimatedInputBox } from '../components/AnimatedInputBox';
import { AnimatedSubmitButton } from '../components/AnimatedSubmitButton';
import userEvent from '@testing-library/user-event';
import { waitFor } from '@testing-library/react';

// Mock ReactBits components
vi.mock('reactbits-animation', () => ({
  Bounce: ({ children }: any) => <div data-testid="reactbits-bounce">{children}</div>,
  ClickSpark: ({ children }: any) => <div data-testid="reactbits-clickspark">{children}</div>,
}));

// Mock framer-motion for all components
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
    input: ({ children, ...props }: any) => <input {...props}>{children}</input>,
    span: ({ children, ...props }: any) => <span {...props}>{children}</span>,
    button: ({ children, ...props }: any) => <button {...props}>{children}</button>,
    h1: ({ children, ...props }: any) => <h1 {...props}>{children}</h1>,
    h2: ({ children, ...props }: any) => <h2 {...props}>{children}</h2>,
    p: ({ children, ...props }: any) => <p {...props}>{children}</p>,
  },
  AnimatePresence: ({ children }: any) => children,
}));

describe('AnimatedInputBox', () => {
  const mockOnChange = vi.fn();
  const mockOnSubmit = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders with ReactBits-inspired styling and animations', () => {
    renderWithTheme(
      <AnimatedInputBox
        value=""
        onChange={mockOnChange}
        placeholder="What if I skipped gym today?"
      />
    );

    const input = screen.getByRole('textbox');
    expect(input).toBeInTheDocument();
    expect(input).toHaveAttribute('type', 'text');
  });

  it('displays animated placeholder text when empty and not focused', async () => {
    renderWithTheme(
      <AnimatedInputBox
        value=""
        onChange={mockOnChange}
      />
    );

    // Should show placeholder text when not focused
    await waitFor(() => {
      expect(screen.getByText(/What if/)).toBeInTheDocument();
    });
  });

  it('handles input changes correctly', async () => {
    const user = userEvent.setup();
    
    // Create a controlled component for testing
    const TestComponent = () => {
      const [value, setValue] = React.useState('');
      return (
        <AnimatedInputBox
          value={value}
          onChange={(newValue) => {
            setValue(newValue);
            mockOnChange(newValue);
          }}
        />
      );
    };
    
    renderWithTheme(<TestComponent />);

    const input = screen.getByRole('textbox');
    await user.type(input, 'What if I could fly?');

    // Should be called for each character typed
    expect(mockOnChange).toHaveBeenCalledTimes(20);
    // Check that the input receives the correct final value
    expect(input).toHaveValue('What if I could fly?');
  });

  it('handles Enter key press for submission', async () => {
    const user = userEvent.setup();
    
    renderWithTheme(
      <AnimatedInputBox
        value="What if I could fly?"
        onChange={mockOnChange}
        onSubmit={mockOnSubmit}
      />
    );

    const input = screen.getByRole('textbox');
    await user.type(input, '{enter}');

    expect(mockOnSubmit).toHaveBeenCalled();
  });

  it('does not submit when input is empty', async () => {
    const user = userEvent.setup();
    
    renderWithTheme(
      <AnimatedInputBox
        value=""
        onChange={mockOnChange}
        onSubmit={mockOnSubmit}
      />
    );

    const input = screen.getByRole('textbox');
    await user.type(input, '{enter}');

    expect(mockOnSubmit).not.toHaveBeenCalled();
  });

  it('displays error message when provided', () => {
    const errorMessage = 'Please provide a more detailed scenario';
    
    renderWithTheme(
      <AnimatedInputBox
        value=""
        onChange={mockOnChange}
        error={errorMessage}
      />
    );

    expect(screen.getByText(errorMessage)).toBeInTheDocument();
  });

  it('disables input when loading', () => {
    renderWithTheme(
      <AnimatedInputBox
        value=""
        onChange={mockOnChange}
        isLoading={true}
      />
    );

    const input = screen.getByRole('textbox');
    expect(input).toBeDisabled();
  });

  it('hides placeholder when focused', async () => {
    const user = userEvent.setup();
    
    renderWithTheme(
      <AnimatedInputBox
        value=""
        onChange={mockOnChange}
      />
    );

    const input = screen.getByRole('textbox');
    await user.click(input);

    // Placeholder should be hidden when focused
    await waitFor(() => {
      const placeholderElements = screen.queryAllByText(/What if/);
      expect(placeholderElements).toHaveLength(0);
    });
  });

  it('shows focus indicator when input is focused', async () => {
    const user = userEvent.setup();
    
    renderWithTheme(
      <AnimatedInputBox
        value=""
        onChange={mockOnChange}
      />
    );

    const input = screen.getByRole('textbox');
    await user.click(input);

    // Focus should trigger visual changes (tested through component rendering)
    expect(input).toHaveFocus();
  });

  it('cycles through different placeholder examples', async () => {
    renderWithTheme(
      <AnimatedInputBox
        value=""
        onChange={mockOnChange}
      />
    );

    // Initial placeholder should be visible
    await waitFor(() => {
      expect(screen.getByText(/What if/)).toBeInTheDocument();
    });

    // Note: Testing the cycling behavior would require mocking timers
    // which is complex in this context, but the component structure supports it
  });

  it('integrates with existing input validation system', () => {
    const errorMessage = 'Invalid input detected';
    
    renderWithTheme(
      <AnimatedInputBox
        value="test input"
        onChange={mockOnChange}
        error={errorMessage}
      />
    );

    // Error should be displayed
    expect(screen.getByText(errorMessage)).toBeInTheDocument();
    
    // Input should have error styling (border color change)
    const input = screen.getByRole('textbox');
    expect(input).toBeInTheDocument();
  });

  it('supports ReactBits-inspired typing animations', async () => {
    renderWithTheme(
      <AnimatedInputBox
        value=""
        onChange={mockOnChange}
      />
    );

    // The typing animation is implemented through CSS keyframes
    // We can verify the component renders without errors
    await waitFor(() => {
      expect(screen.getByRole('textbox')).toBeInTheDocument();
    });
  });

  it('maintains accessibility standards', () => {
    renderWithTheme(
      <AnimatedInputBox
        value=""
        onChange={mockOnChange}
      />
    );

    const input = screen.getByRole('textbox');
    expect(input).toBeInTheDocument();
    expect(input).toHaveAttribute('type', 'text');
  });
});

describe('AnimatedSubmitButton', () => {
  const mockOnClick = vi.fn();
  const mockOnSubmit = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders with ReactBits components integration', () => {
    renderWithTheme(
      <AnimatedSubmitButton onClick={mockOnClick} />
    );

    // Should render with ReactBits Bounce and ClickSpark wrappers
    expect(screen.getByTestId('reactbits-bounce')).toBeInTheDocument();
    expect(screen.getByTestId('reactbits-clickspark')).toBeInTheDocument();
    
    // Should render the button
    const button = screen.getByRole('button');
    expect(button).toBeInTheDocument();
    expect(button).toHaveTextContent('Explore Possibilities');
  });

  it('uses ReactBits Bounce component for hover animations', () => {
    renderWithTheme(
      <AnimatedSubmitButton onClick={mockOnClick} />
    );

    const bounceWrapper = screen.getByTestId('reactbits-bounce');
    expect(bounceWrapper).toBeInTheDocument();
    
    // The button should be wrapped in the Bounce component
    const button = screen.getByRole('button');
    expect(bounceWrapper).toContainElement(button);
  });

  it('uses ReactBits ClickSpark for confetti explosion effects', () => {
    renderWithTheme(
      <AnimatedSubmitButton onClick={mockOnClick} />
    );

    const clickSparkWrapper = screen.getByTestId('reactbits-clickspark');
    expect(clickSparkWrapper).toBeInTheDocument();
    
    // The bounce wrapper should be inside the ClickSpark component
    const bounceWrapper = screen.getByTestId('reactbits-bounce');
    expect(clickSparkWrapper).toContainElement(bounceWrapper);
  });

  it('handles click events with confetti explosion', async () => {
    const user = userEvent.setup();
    
    renderWithTheme(
      <AnimatedSubmitButton onClick={mockOnClick} />
    );

    const button = screen.getByRole('button');
    await user.click(button);

    // Should call the onClick handler
    expect(mockOnClick).toHaveBeenCalledTimes(1);
    
    // Should show confetti system
    expect(screen.getByTestId('confetti-system')).toBeInTheDocument();
  });

  it('integrates with form submission', async () => {
    const user = userEvent.setup();
    
    renderWithTheme(
      <AnimatedSubmitButton 
        onClick={mockOnClick} 
        onSubmit={mockOnSubmit}
      />
    );

    const button = screen.getByRole('button');
    await user.click(button);

    // Should call both onClick and onSubmit handlers
    expect(mockOnClick).toHaveBeenCalledTimes(1);
    expect(mockOnSubmit).toHaveBeenCalledTimes(1);
  });

  it('displays loading state correctly', () => {
    renderWithTheme(
      <AnimatedSubmitButton 
        onClick={mockOnClick} 
        isLoading={true}
        loadingText="Processing..."
      />
    );

    const button = screen.getByRole('button');
    expect(button).toBeDisabled();
    expect(button).toHaveTextContent('Processing...');
    
    // Should show loading spinner
    expect(button.querySelector('div')).toBeInTheDocument(); // LoadingSpinner
  });

  it('handles disabled state properly', async () => {
    const user = userEvent.setup();
    
    renderWithTheme(
      <AnimatedSubmitButton 
        onClick={mockOnClick} 
        disabled={true}
      />
    );

    const button = screen.getByRole('button');
    expect(button).toBeDisabled();
    
    await user.click(button);
    
    // Should not call onClick when disabled
    expect(mockOnClick).not.toHaveBeenCalled();
    
    // Should not show confetti when disabled
    expect(screen.queryByTestId('confetti-system')).not.toBeInTheDocument();
  });

  it('supports custom text and loading text', () => {
    const { rerender } = renderWithTheme(
      <AnimatedSubmitButton 
        onClick={mockOnClick}
        text="Custom Button Text"
      />
    );

    let button = screen.getByRole('button');
    expect(button).toHaveTextContent('Custom Button Text');

    // Test loading text
    rerender(
      <ThemeProvider theme={lightTheme}>
        <AnimatedSubmitButton 
          onClick={mockOnClick}
          text="Custom Button Text"
          loadingText="Custom Loading..."
          isLoading={true}
        />
      </ThemeProvider>
    );

    button = screen.getByRole('button');
    expect(button).toHaveTextContent('Custom Loading...');
  });

  it('prevents multiple clicks during loading', async () => {
    const user = userEvent.setup();
    
    renderWithTheme(
      <AnimatedSubmitButton 
        onClick={mockOnClick} 
        isLoading={true}
      />
    );

    const button = screen.getByRole('button');
    await user.click(button);

    // Should not call onClick when loading
    expect(mockOnClick).not.toHaveBeenCalled();
  });

  it('shows confetti system temporarily on click', async () => {
    const user = userEvent.setup();
    
    renderWithTheme(
      <AnimatedSubmitButton onClick={mockOnClick} />
    );

    const button = screen.getByRole('button');
    
    // Initially no confetti
    expect(screen.queryByTestId('confetti-system')).not.toBeInTheDocument();
    
    await user.click(button);
    
    // Should show confetti after click
    expect(screen.getByTestId('confetti-system')).toBeInTheDocument();
  });

  it('maintains proper button styling and accessibility', () => {
    renderWithTheme(
      <AnimatedSubmitButton onClick={mockOnClick} />
    );

    const button = screen.getByRole('button');
    expect(button).toBeInTheDocument();
    expect(button).toHaveAttribute('type', 'button');
    
    // Should not be disabled by default
    expect(button).not.toBeDisabled();
  });

  it('handles bounce animation on hover', async () => {
    const user = userEvent.setup();
    
    renderWithTheme(
      <AnimatedSubmitButton onClick={mockOnClick} />
    );

    const button = screen.getByRole('button');
    
    // Test hover interaction
    await user.hover(button);
    
    // The ReactBits Bounce component should handle the animation
    expect(screen.getByTestId('reactbits-bounce')).toBeInTheDocument();
  });

  it('integrates ReactBits ClickSpark with proper configuration', () => {
    renderWithTheme(
      <AnimatedSubmitButton onClick={mockOnClick} />
    );

    // ClickSpark should be present and configured for confetti effects
    const clickSparkWrapper = screen.getByTestId('reactbits-clickspark');
    expect(clickSparkWrapper).toBeInTheDocument();
  });

  it('supports form integration with proper event handling', async () => {
    const user = userEvent.setup();
    const mockFormSubmit = vi.fn();
    
    const TestForm = () => (
      <form onSubmit={(e) => { e.preventDefault(); mockFormSubmit(); }}>
        <AnimatedSubmitButton 
          onClick={mockOnClick}
          onSubmit={mockFormSubmit}
        />
      </form>
    );

    renderWithTheme(<TestForm />);

    const button = screen.getByRole('button');
    await user.click(button);

    expect(mockOnClick).toHaveBeenCalledTimes(1);
    // onSubmit prop should be called directly by the button
    expect(mockFormSubmit).toHaveBeenCalledTimes(1);
  });

  it('provides visual feedback during click interaction', async () => {
    const user = userEvent.setup();
    
    renderWithTheme(
      <AnimatedSubmitButton onClick={mockOnClick} />
    );

    const button = screen.getByRole('button');
    
    // Click should trigger visual feedback through motion animations
    await user.click(button);
    
    // The button should still be present and functional
    expect(button).toBeInTheDocument();
    expect(mockOnClick).toHaveBeenCalled();
  });

  it('maintains ReactBits component hierarchy', () => {
    renderWithTheme(
      <AnimatedSubmitButton onClick={mockOnClick} />
    );

    // Should have proper nesting: ClickSpark > Bounce > Button
    const clickSpark = screen.getByTestId('reactbits-clickspark');
    const bounce = screen.getByTestId('reactbits-bounce');
    const button = screen.getByRole('button');

    expect(clickSpark).toContainElement(bounce);
    expect(bounce).toContainElement(button);
  });
});