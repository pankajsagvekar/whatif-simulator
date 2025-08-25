# What If Simulator - Source Code

## Project Structure

```
src/
├── models/           # Data models and interfaces
│   ├── interfaces.ts # Core TypeScript interfaces
│   └── index.ts      # Model exports
├── services/         # Business logic services
│   └── index.ts      # Service exports
├── utils/            # Utility functions
│   └── index.ts      # Utility exports
└── index.ts          # Main entry point
```

## Core Interfaces

- **ValidationResult**: Result of input validation process
- **ProcessedScenario**: Structured analysis of user scenario
- **FormattedOutput**: Final output containing both serious and fun versions

## Development

- `npm run build` - Compile TypeScript to JavaScript
- `npm run dev` - Run in development mode
- `npm test` - Run tests
- `npm run lint` - Run ESLint