# What If Simulator - Integration Guide

## Overview

The What If Simulator is now fully integrated with comprehensive dependency injection, configuration management, logging, and error reporting. All components are wired together through the `WhatIfSimulatorApp` class, which provides a unified interface for the entire system.

## Architecture

```
WhatIfSimulatorApp
├── Configuration Management
├── Logging & Error Reporting
├── Health Monitoring
├── Component Integration
│   ├── WhatIfSimulator (Core Engine)
│   ├── WhatIfAPI (API Interface)
│   ├── WhatIfCLI (Command Line Interface)
│   └── WhatIfWebHandler (Web Interface)
└── Graceful Shutdown
```

## Quick Start

### 1. Basic Usage

```typescript
import { createWhatIfSimulatorApp } from './WhatIfSimulatorApp.js';
import { DemoAIService } from './demo-simulator.js';

// Create and initialize the application
const aiService = new DemoAIService();
const app = await createWhatIfSimulatorApp(aiService);

// Process a scenario
const result = await app.processScenario('What if everyone could fly?');
console.log(result.presentationOutput);

// Graceful shutdown
await app.shutdown();
```

### 2. CLI Usage

```bash
# Interactive mode
npm run cli:interactive

# Demo mode
npm run cli:demo

# Run integration tests
npm run cli:test

# Check health status
npm run cli:health

# With custom options
npm run cli -- demo --env production --log-level info
```

### 3. Configuration

```typescript
import { getConfigForEnvironment } from './config.js';

// Get environment-specific configuration
const config = getConfigForEnvironment('production');

// Create app with custom configuration
const app = await createWhatIfSimulatorApp(aiService, {
  ...config,
  enableParallelGeneration: true,
  maxProcessingTime: 20000
});
```

## Components

### Core Application (`WhatIfSimulatorApp`)

The main application class that integrates all components:

- **Dependency Injection**: Manages all service dependencies
- **Configuration Management**: Handles environment-specific settings
- **Logging**: Comprehensive logging with configurable levels
- **Error Handling**: Global error handling and recovery
- **Health Monitoring**: Real-time health status tracking
- **Integration Testing**: Built-in integration test runner

### Configuration System (`config.ts`)

Environment-based configuration with validation:

```typescript
// Development configuration
const devConfig = getConfigForEnvironment('development');

// Production configuration  
const prodConfig = getConfigForEnvironment('production');

// Test configuration
const testConfig = getConfigForEnvironment('test');
```

### CLI Application (`cli-app.ts`)

Full-featured command-line interface:

- Interactive mode for real-time scenario processing
- Demo mode with predefined scenarios
- Integration testing mode
- Health check mode
- Configurable options and environment variables

## Features

### 1. Comprehensive Logging

```typescript
// Application-level logging
app.logger.info('Processing scenario...');
app.logger.error('Processing failed', error);

// Component-level logging (when enabled)
const result = await app.processScenario(scenario);
// Logs: validation, processing, generation, formatting times
```

### 2. Error Handling & Recovery

```typescript
try {
  const result = await app.processScenario(scenario);
  if (!result.success) {
    console.log('Error:', result.error);
    console.log('Metrics:', result.metrics);
  }
} catch (error) {
  // Global error handling with retry logic
  console.log('Unexpected error:', error.message);
}
```

### 3. Health Monitoring

```typescript
const health = app.getHealthStatus();
console.log('Status:', health.status); // 'healthy' | 'unhealthy'
console.log('Components:', health.components);
console.log('Configuration:', health.config);
```

### 4. Integration Testing

```typescript
// Built-in integration tests
const testResult = await app.runIntegrationTest();
console.log('All tests passed:', testResult.success);
console.log('Component results:', testResult.results);
console.log('Errors:', testResult.errors);
```

### 5. Performance Metrics

```typescript
const result = await app.processScenario(scenario);
if (result.success && result.metrics) {
  console.log('Total time:', result.metrics.totalProcessingTime);
  console.log('Validation:', result.metrics.validationTime);
  console.log('AI Generation:', result.metrics.seriousGenerationTime + result.metrics.funGenerationTime);
}
```

## Configuration Options

### Environment Variables

```bash
NODE_ENV=production              # Environment mode
LOG_LEVEL=info                   # Logging level (debug|info|warn|error)
MAX_PROCESSING_TIME=20000        # Processing timeout in ms
ENABLE_LOGGING=true              # Enable/disable logging
ENABLE_METRICS=true              # Enable/disable metrics
ENABLE_PARALLEL_GENERATION=true  # Enable parallel AI generation
PORT=3000                        # Server port (for web interface)
HOST=localhost                   # Server host
```

### Configuration Profiles

- **Development**: Debug logging, longer timeouts, detailed metrics
- **Production**: Optimized performance, warning-level logging, caching
- **Test**: Minimal logging, shorter timeouts, no metrics

## API Interfaces

### Core Simulator

```typescript
const simulator = app.getSimulator();
const result = await simulator.processScenario(scenario);
```

### API Interface

```typescript
const api = app.getAPI();
const response = await api.processScenario({ scenario });
await api.submitFeedback(feedback);
const stats = await api.getFeedbackStats();
```

### Web Handler

```typescript
const webHandler = app.getWebHandler();
const response = await webHandler.handleRequest({
  method: 'POST',
  path: '/process',
  body: { scenario }
});
```

### CLI Interface

```typescript
const cli = app.getCLI();
await cli.start(); // Interactive mode
```

## Testing

### Run All Tests

```bash
npm run test:comprehensive
```

### Specific Test Suites

```bash
npm run test:final           # Final integration tests
npm run test:integration     # Component integration tests
npm run test:e2e            # End-to-end tests
npm run test:content        # Content appropriateness tests
npm run test:load           # Load testing
```

### CLI Testing

```bash
npm run cli:test            # Run integration tests via CLI
```

## Deployment

### Build for Production

```bash
npm run build
npm run start:cli           # Start CLI application
```

### Environment Setup

```bash
# Production environment
export NODE_ENV=production
export LOG_LEVEL=warn
export MAX_PROCESSING_TIME=15000
export ENABLE_METRICS=true

npm run start:cli
```

## Troubleshooting

### Common Issues

1. **Initialization Errors**: Check AI service configuration and network connectivity
2. **Configuration Validation**: Use `validateConfig()` to check configuration validity
3. **Performance Issues**: Enable metrics and check processing times
4. **Memory Issues**: Monitor concurrent request limits and enable caching

### Debug Mode

```bash
# Enable debug logging
export LOG_LEVEL=debug
npm run cli:interactive
```

### Health Checks

```bash
# Check application health
npm run cli:health

# Or programmatically
const health = app.getHealthStatus();
console.log(health);
```

## Best Practices

1. **Always initialize the app** before using any components
2. **Use environment-specific configurations** for different deployment scenarios
3. **Enable metrics in production** for monitoring and optimization
4. **Implement proper error handling** for all async operations
5. **Use graceful shutdown** to clean up resources properly
6. **Monitor health status** in production environments
7. **Run integration tests** before deployment

## Requirements Fulfilled

This integration fulfills all requirements from task 12:

- ✅ **Connect all services**: All components are properly wired through dependency injection
- ✅ **Proper dependency injection**: `WhatIfSimulatorApp` manages all service dependencies
- ✅ **Final configuration**: Environment-based configuration with validation
- ✅ **Environment setup**: Support for development, production, and test environments
- ✅ **Comprehensive logging**: Multi-level logging with configurable output
- ✅ **Error reporting**: Global error handling with detailed error information
- ✅ **Integration testing**: Built-in integration test runner with comprehensive coverage
- ✅ **Bug fixes**: Error handling and recovery mechanisms throughout

The system is now production-ready with proper monitoring, configuration management, and operational capabilities.