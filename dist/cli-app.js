#!/usr/bin/env node
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.runCLI = main;
const WhatIfSimulatorApp_1 = require("./WhatIfSimulatorApp");
const config_1 = require("./config");
const demo_simulator_1 = require("./demo-simulator");
/**
 * Command line interface entry point for the What If Simulator
 * Provides integrated application with proper configuration and error handling
 */
/**
 * Mock AI Service for CLI demo (replace with real AI service in production)
 */
class CLIAIService {
    async generateResponse(prompt) {
        // Simulate processing delay
        await new Promise(resolve => setTimeout(resolve, 800));
        // Use the demo AI service for consistent responses
        const demoService = new demo_simulator_1.DemoAIService();
        return demoService.generateResponse(prompt);
    }
}
/**
 * Parses command line arguments
 */
function parseArgs() {
    const args = process.argv.slice(2);
    const command = args[0] || 'interactive';
    const options = {};
    for (let i = 1; i < args.length; i += 2) {
        const key = args[i];
        const value = args[i + 1];
        if (key.startsWith('--')) {
            const optionName = key.slice(2);
            options[optionName] = value || true;
        }
    }
    return { command, options };
}
/**
 * Shows help information
 */
function showHelp() {
    console.log(`
🚀 What If Simulator CLI

Usage: node cli-app.js [command] [options]

Commands:
  interactive    Start interactive CLI mode (default)
  demo          Run demonstration scenarios
  test          Run integration tests
  health        Show application health status
  help          Show this help message

Options:
  --env         Environment (development|production|test)
  --log-level   Log level (debug|info|warn|error)
  --timeout     Processing timeout in milliseconds
  --no-parallel Disable parallel generation
  --no-metrics  Disable metrics collection

Examples:
  node cli-app.js interactive
  node cli-app.js demo --env development
  node cli-app.js test --log-level debug
  node cli-app.js health --env production

Environment Variables:
  NODE_ENV              Environment mode
  LOG_LEVEL            Logging level
  MAX_PROCESSING_TIME  Processing timeout
  ENABLE_LOGGING       Enable/disable logging
  ENABLE_METRICS       Enable/disable metrics
`);
}
/**
 * Main CLI application function
 */
async function main() {
    try {
        const { command, options } = parseArgs();
        // Show help if requested
        if (command === 'help' || options.help) {
            showHelp();
            return;
        }
        // Get configuration
        const environment = options.env || process.env.NODE_ENV || 'development';
        const config = (0, config_1.getConfigForEnvironment)(environment);
        // Apply CLI options to config
        if (options['log-level']) {
            config.environment.LOG_LEVEL = options['log-level'];
        }
        if (options.timeout) {
            config.maxProcessingTime = parseInt(options.timeout);
        }
        if (options['no-parallel']) {
            config.enableParallelGeneration = false;
        }
        if (options['no-metrics']) {
            config.enableMetrics = false;
        }
        // Validate configuration
        const validation = (0, config_1.validateConfig)(config);
        if (!validation.valid) {
            console.error('❌ Configuration validation failed:');
            validation.errors.forEach(error => console.error(`   • ${error}`));
            process.exit(1);
        }
        // Create AI service and application
        const aiService = new CLIAIService();
        const app = await (0, WhatIfSimulatorApp_1.createWhatIfSimulatorApp)(aiService, config);
        console.log('🚀 What If Simulator CLI');
        console.log('═'.repeat(50));
        console.log('📋 Configuration Summary:');
        const configSummary = (0, config_1.getConfigSummary)(config);
        Object.entries(configSummary).forEach(([key, value]) => {
            console.log(`   ${key}: ${value}`);
        });
        console.log('');
        // Execute command
        switch (command) {
            case 'interactive':
                await runInteractiveMode(app);
                break;
            case 'demo':
                await runDemoMode(app);
                break;
            case 'test':
                await runTestMode(app);
                break;
            case 'health':
                await runHealthCheck(app);
                break;
            default:
                console.error(`❌ Unknown command: ${command}`);
                console.log('Use "help" to see available commands.');
                process.exit(1);
        }
        // Graceful shutdown
        await app.shutdown();
    }
    catch (error) {
        console.error('💥 Fatal error:', error instanceof Error ? error.message : 'Unknown error');
        if (error instanceof Error && error.stack) {
            console.error('Stack trace:', error.stack);
        }
        process.exit(1);
    }
}
/**
 * Runs interactive CLI mode
 */
async function runInteractiveMode(app) {
    console.log('🎯 Starting interactive mode...');
    console.log('Type your "What if..." scenarios or "quit" to exit.\n');
    const cli = app.getCLI();
    await cli.start();
}
/**
 * Runs demonstration mode
 */
async function runDemoMode(app) {
    console.log('🎭 Running demonstration scenarios...\n');
    const scenarios = [
        "What if everyone could read minds?",
        "What if gravity was half as strong?",
        "What if the internet disappeared forever?",
        "What if humans could photosynthesize like plants?"
    ];
    for (const scenario of scenarios) {
        console.log(`${'='.repeat(60)}`);
        console.log(`🤔 Scenario: ${scenario}`);
        console.log(`${'='.repeat(60)}\n`);
        try {
            const result = await app.processScenario(scenario);
            if (result.success) {
                console.log(result.presentationOutput);
                if (result.metrics) {
                    console.log(`\n📊 Metrics: ${result.metrics.totalProcessingTime}ms total`);
                }
            }
            else {
                console.log(`❌ Error: ${result.error}`);
            }
        }
        catch (error) {
            console.log(`💥 Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
        console.log('\n');
        // Add delay between scenarios
        await new Promise(resolve => setTimeout(resolve, 1000));
    }
    console.log('✨ Demo completed!');
}
/**
 * Runs integration tests
 */
async function runTestMode(app) {
    console.log('🧪 Running integration tests...\n');
    const testResult = await app.runIntegrationTest();
    console.log('📊 Test Results:');
    console.log(`   Overall Success: ${testResult.success ? '✅' : '❌'}`);
    console.log(`   Simulator: ${testResult.results.simulator ? '✅' : '❌'}`);
    console.log(`   API: ${testResult.results.api ? '✅' : '❌'}`);
    console.log(`   Web Handler: ${testResult.results.webHandler ? '✅' : '❌'}`);
    if (testResult.errors.length > 0) {
        console.log('\n❌ Errors:');
        testResult.errors.forEach((error) => console.log(`   • ${error}`));
    }
    console.log(`\n${testResult.success ? '✅ All tests passed!' : '❌ Some tests failed!'}`);
    if (!testResult.success) {
        process.exit(1);
    }
}
/**
 * Shows application health status
 */
async function runHealthCheck(app) {
    console.log('🏥 Application Health Check\n');
    const health = app.getHealthStatus();
    console.log(`Status: ${health.status === 'healthy' ? '✅ Healthy' : '❌ Unhealthy'}`);
    console.log(`Initialized: ${health.initialized ? '✅' : '❌'}`);
    console.log(`Timestamp: ${health.timestamp}\n`);
    console.log('📦 Components:');
    Object.entries(health.components).forEach(([name, status]) => {
        console.log(`   ${name}: ${status ? '✅' : '❌'}`);
    });
    console.log('\n⚙️  Configuration:');
    Object.entries(health.config).forEach(([key, value]) => {
        console.log(`   ${key}: ${value}`);
    });
    if (health.status !== 'healthy') {
        process.exit(1);
    }
}
// Handle graceful shutdown
process.on('SIGINT', () => {
    console.log('\n👋 Received SIGINT, shutting down gracefully...');
    process.exit(0);
});
process.on('SIGTERM', () => {
    console.log('\n👋 Received SIGTERM, shutting down gracefully...');
    process.exit(0);
});
// Run the CLI application
// Check if this module is being run directly (not imported)
const isMainModule = process.argv[1] && process.argv[1].endsWith('cli-app.js') || process.argv[1] && process.argv[1].endsWith('cli-app.ts');
if (isMainModule) {
    main().catch(console.error);
}
//# sourceMappingURL=cli-app.js.map