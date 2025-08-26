# What If Simulator - React UI

This directory contains the React-based user interface for the What If Simulator, featuring a split-screen layout with animations and interactive elements.

## Features

- **Split-Screen Layout**: Serious outcomes on the left, fun outcomes on the right
- **Animated Components**: Smooth entrance animations, hover effects, and interactive feedback
- **Theme System**: Light/dark mode toggle with smooth transitions
- **Responsive Design**: Works on desktop, tablet, and mobile devices
- **Accessibility**: Full keyboard navigation and screen reader support

## Technology Stack

- **React 18** with TypeScript
- **Styled Components** for CSS-in-JS styling
- **Framer Motion** for animations and transitions
- **ReactBits Animation** for pre-built UI components
- **Vite** for fast development and building

## Getting Started

### Development

```bash
# Start the development server
npm run dev:react

# Build for production
npm run build:react

# Preview production build
npm run preview:react
```

### Project Structure

```
src/react/
├── components/           # React components
│   ├── SplitScreenContainer.tsx
│   ├── SeriousPanel.tsx
│   ├── FunPanel.tsx
│   ├── AnimatedInputBox.tsx
│   ├── AnimatedSubmitButton.tsx
│   ├── LoadingAnimations.tsx
│   ├── ThemeToggle.tsx
│   └── ConfettiSystem.tsx
├── services/            # Service layer
│   └── ReactWhatIfService.ts
├── styles/              # Theme and global styles
│   ├── themes.ts
│   └── GlobalStyles.ts
├── App.tsx              # Main application component
├── index.tsx            # Application entry point
└── index.html           # HTML template
```

## Component Overview

### Core Components

- **App**: Main application component with state management
- **SplitScreenContainer**: Manages the dual-panel layout
- **SeriousPanel**: Displays serious outcomes with professional styling
- **FunPanel**: Shows fun outcomes with playful animations
- **AnimatedInputBox**: Input field with rotating placeholder text
- **AnimatedSubmitButton**: Submit button with confetti explosion
- **LoadingAnimations**: Thinking emoji and typing robot animations
- **ThemeToggle**: Sun/moon morphing theme switcher
- **ConfettiSystem**: Emoji confetti particle system

### Animation Features

- **Entrance Animations**: Panels slide in from left/right with distinct personalities
- **Hover Effects**: Parallax tilt effects on both panels
- **Interactive Feedback**: Button bounces, input focus animations
- **Loading States**: Thinking emoji bounce and typing dots
- **Theme Transitions**: Smooth color palette changes
- **Confetti System**: Celebratory animations for fun outcomes

## Integration with Backend

The React UI integrates with the existing What If Simulator backend through:

- **ReactWhatIfService**: Service layer that bridges React UI with WhatIfSimulator
- **Type Safety**: Full TypeScript integration with backend interfaces
- **Error Handling**: Graceful error display and user feedback
- **Validation**: Input validation before processing

## Accessibility Features

- **Keyboard Navigation**: Full keyboard support for all interactive elements
- **Screen Reader Support**: Proper ARIA labels and semantic HTML
- **Reduced Motion**: Respects user preferences for reduced motion
- **Color Contrast**: Ensures readability in both light and dark themes
- **Focus Management**: Clear focus indicators and logical tab order

## Customization

### Themes

Modify `src/react/styles/themes.ts` to customize colors and styling:

```typescript
export const customTheme: Theme = {
  background: '#your-color',
  primary: '#your-primary',
  // ... other theme properties
};
```

### Animations

Adjust animation timing and effects in individual components or create new animation presets using Framer Motion.

### Components

All components are modular and can be easily customized or extended. The styled-components approach allows for easy theming and responsive design.