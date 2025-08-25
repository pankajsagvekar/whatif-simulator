"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.WhatIfCLI = void 0;
const readline = __importStar(require("readline"));
const WhatIfAPI_js_1 = require("../api/WhatIfAPI.js");
/**
 * Command-line interface for the What If Simulator
 * Provides interactive user experience with clear version distinction
 * Implements requirements 4.1, 4.2, 4.3
 */
class WhatIfCLI {
    constructor(aiService) {
        this.api = new WhatIfAPI_js_1.WhatIfAPI(aiService);
        this.rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });
    }
    /**
     * Starts the interactive CLI session
     */
    async start() {
        console.log('🚀 Welcome to the AI What If Simulator!');
        console.log('═'.repeat(50));
        console.log('Ask any "What if..." question and get both serious and fun answers!');
        console.log('Type "help" for commands, "quit" to exit.\n');
        await this.showMainMenu();
    }
    /**
     * Shows the main menu and handles user input
     */
    async showMainMenu() {
        while (true) {
            try {
                const input = await this.askQuestion('\n💭 What if... ');
                if (input.toLowerCase() === 'quit' || input.toLowerCase() === 'exit') {
                    console.log('\n👋 Thanks for using the What If Simulator!');
                    break;
                }
                if (input.toLowerCase() === 'help') {
                    this.showHelp();
                    continue;
                }
                if (input.toLowerCase() === 'stats') {
                    await this.showStats();
                    continue;
                }
                if (input.toLowerCase() === 'config') {
                    await this.showConfig();
                    continue;
                }
                if (input.trim()) {
                    await this.processScenario(input);
                }
            }
            catch (error) {
                console.error('❌ An error occurred:', error instanceof Error ? error.message : 'Unknown error');
            }
        }
        this.rl.close();
    }
    /**
     * Processes a user scenario and displays results with clear distinction
     * Requirements: 4.1 - Display with clear labels
     *              4.2 - Readable, organized format
     *              4.3 - Easily scannable and comparable
     */
    async processScenario(scenario) {
        console.log('\n⏳ Processing your scenario...\n');
        const request = {
            scenario,
            sessionId: this.currentSessionId
        };
        try {
            const response = await this.api.processScenario(request);
            if (!response.success) {
                console.log('❌ Processing failed:', response.error);
                return;
            }
            // Store session ID for feedback
            this.currentSessionId = response.sessionId;
            // Display results with clear version distinction
            this.displayResults(response);
            // Offer feedback collection
            await this.collectFeedback(scenario);
        }
        catch (error) {
            console.error('❌ Error processing scenario:', error instanceof Error ? error.message : 'Unknown error');
        }
    }
    /**
     * Displays results with clear formatting and version distinction
     * Requirements: 4.1, 4.2, 4.3 - Clear labels, readable format, scannable comparison
     */
    displayResults(response) {
        const { result } = response;
        console.log('🎯 Results for your scenario:');
        console.log('═'.repeat(80));
        // Display the formatted presentation output
        console.log(result.presentationOutput);
        // Show processing metrics
        if (response.metrics) {
            console.log('\n📊 Processing Metrics:');
            console.log('─'.repeat(40));
            console.log(`⏱️  Total time: ${response.metrics.totalProcessingTime}ms`);
            console.log(`🔍 Validation: ${response.metrics.validationTime}ms`);
            console.log(`⚙️  Processing: ${response.metrics.processingTime}ms`);
            console.log(`🧠 AI Generation: ${response.metrics.seriousGenerationTime + response.metrics.funGenerationTime}ms`);
            console.log(`📝 Formatting: ${response.metrics.formattingTime}ms`);
            console.log(`📋 Scenario Type: ${result.metadata.scenarioType}`);
        }
    }
    /**
     * Collects user feedback for output quality
     */
    async collectFeedback(scenario) {
        console.log('\n📝 Help us improve! Please rate the outputs:');
        try {
            const seriousRating = await this.askRating('Rate the serious version (1-5): ');
            const funRating = await this.askRating('Rate the fun version (1-5): ');
            const overallSatisfaction = await this.askRating('Overall satisfaction (1-5): ');
            const comments = await this.askQuestion('Any comments? (optional): ');
            if (this.currentSessionId) {
                const feedback = {
                    sessionId: this.currentSessionId,
                    scenario,
                    seriousRating,
                    funRating,
                    overallSatisfaction,
                    comments: comments.trim() || undefined
                };
                const result = await this.api.submitFeedback(feedback);
                if (result.success) {
                    console.log('✅ Thank you for your feedback!');
                }
                else {
                    console.log('⚠️  Failed to save feedback:', result.message);
                }
            }
        }
        catch (error) {
            console.log('⚠️  Skipping feedback collection');
        }
    }
    /**
     * Shows help information
     */
    showHelp() {
        console.log('\n📖 Help - Available Commands:');
        console.log('─'.repeat(40));
        console.log('• Type any "What if..." question to get started');
        console.log('• "help" - Show this help message');
        console.log('• "stats" - Show feedback statistics');
        console.log('• "config" - Show current configuration');
        console.log('• "quit" or "exit" - Exit the simulator');
        console.log('\n💡 Tips:');
        console.log('• Be specific in your scenarios for better results');
        console.log('• Try different types: personal, professional, historical');
        console.log('• Rate the outputs to help improve the system');
    }
    /**
     * Shows feedback statistics
     */
    async showStats() {
        try {
            const stats = await this.api.getFeedbackStats();
            console.log('\n📊 Feedback Statistics:');
            console.log('─'.repeat(40));
            console.log(`📝 Total Feedbacks: ${stats.totalFeedbacks}`);
            console.log(`🎯 Sessions: ${stats.sessionCount}`);
            if (stats.totalFeedbacks > 0) {
                console.log(`🧠 Serious Rating: ${stats.averageSeriousRating.toFixed(1)}/5`);
                console.log(`🎭 Fun Rating: ${stats.averageFunRating.toFixed(1)}/5`);
                console.log(`😊 Overall Satisfaction: ${stats.averageOverallSatisfaction.toFixed(1)}/5`);
            }
            else {
                console.log('No feedback data available yet.');
            }
        }
        catch (error) {
            console.log('❌ Failed to retrieve statistics');
        }
    }
    /**
     * Shows current configuration
     */
    async showConfig() {
        const config = this.api.getConfig();
        console.log('\n⚙️  Current Configuration:');
        console.log('─'.repeat(40));
        console.log(`🔍 Logging: ${config.enableLogging ? 'Enabled' : 'Disabled'}`);
        console.log(`📊 Metrics: ${config.enableMetrics ? 'Enabled' : 'Disabled'}`);
        console.log(`⏱️  Max Processing Time: ${config.maxProcessingTime}ms`);
        console.log(`⚡ Parallel Generation: ${config.enableParallelGeneration ? 'Enabled' : 'Disabled'}`);
    }
    /**
     * Asks a question and returns the user's response
     */
    askQuestion(question) {
        return new Promise((resolve) => {
            this.rl.question(question, (answer) => {
                resolve(answer);
            });
        });
    }
    /**
     * Asks for a rating (1-5) and validates the input
     */
    async askRating(question) {
        while (true) {
            const answer = await this.askQuestion(question);
            const rating = parseInt(answer.trim());
            if (rating >= 1 && rating <= 5) {
                return rating;
            }
            console.log('Please enter a number between 1 and 5.');
        }
    }
    /**
     * Closes the CLI interface
     */
    close() {
        this.rl.close();
    }
}
exports.WhatIfCLI = WhatIfCLI;
//# sourceMappingURL=WhatIfCLI.js.map