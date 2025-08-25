import { AIService } from '../services/SeriousOutcomeGenerator.js';
/**
 * Command-line interface for the What If Simulator
 * Provides interactive user experience with clear version distinction
 * Implements requirements 4.1, 4.2, 4.3
 */
export declare class WhatIfCLI {
    private api;
    private rl;
    private currentSessionId?;
    constructor(aiService: AIService);
    /**
     * Starts the interactive CLI session
     */
    start(): Promise<void>;
    /**
     * Shows the main menu and handles user input
     */
    private showMainMenu;
    /**
     * Processes a user scenario and displays results with clear distinction
     * Requirements: 4.1 - Display with clear labels
     *              4.2 - Readable, organized format
     *              4.3 - Easily scannable and comparable
     */
    private processScenario;
    /**
     * Displays results with clear formatting and version distinction
     * Requirements: 4.1, 4.2, 4.3 - Clear labels, readable format, scannable comparison
     */
    private displayResults;
    /**
     * Collects user feedback for output quality
     */
    private collectFeedback;
    /**
     * Shows help information
     */
    private showHelp;
    /**
     * Shows feedback statistics
     */
    private showStats;
    /**
     * Shows current configuration
     */
    private showConfig;
    /**
     * Asks a question and returns the user's response
     */
    private askQuestion;
    /**
     * Asks for a rating (1-5) and validates the input
     */
    private askRating;
    /**
     * Closes the CLI interface
     */
    close(): void;
}
//# sourceMappingURL=WhatIfCLI.d.ts.map