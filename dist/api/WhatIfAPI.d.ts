import { SimulatorConfig } from '../services/WhatIfSimulator.js';
import { AIService } from '../services/SeriousOutcomeGenerator.js';
/**
 * User feedback for output quality
 */
export interface UserFeedback {
    sessionId: string;
    scenario: string;
    seriousRating: number;
    funRating: number;
    overallSatisfaction: number;
    comments?: string;
    timestamp: Date;
}
/**
 * API request for scenario processing
 */
export interface ProcessScenarioRequest {
    scenario: string;
    sessionId?: string;
    config?: Partial<SimulatorConfig>;
}
/**
 * API response for scenario processing
 */
export interface ProcessScenarioResponse {
    success: boolean;
    sessionId: string;
    result?: {
        seriousVersion: string;
        funVersion: string;
        metadata: {
            processingTime: number;
            scenarioType: string;
        };
        presentationOutput: string;
    };
    error?: string;
    metrics?: {
        totalProcessingTime: number;
        validationTime: number;
        processingTime: number;
        seriousGenerationTime: number;
        funGenerationTime: number;
        formattingTime: number;
        success: boolean;
        errorType?: string;
    };
}
/**
 * API response for feedback submission
 */
export interface SubmitFeedbackResponse {
    success: boolean;
    message: string;
    feedbackId?: string;
}
/**
 * WhatIfAPI provides interface methods for user interaction
 * Implements requirements 4.1, 4.2, 4.3
 */
export declare class WhatIfAPI {
    private simulator;
    private feedbackStore;
    private sessionCounter;
    constructor(aiService: AIService, config?: Partial<SimulatorConfig>);
    /**
     * Processes a "What if..." scenario and returns formatted response
     * Requirements: 4.1 - Display results with clear labels
     *              4.2 - Format output in readable manner
     *              4.3 - Ensure versions are easily scannable
     */
    processScenario(request: ProcessScenarioRequest): Promise<ProcessScenarioResponse>;
    /**
     * Submits user feedback for output quality assessment
     * Requirements: User feedback mechanisms for output quality
     */
    submitFeedback(feedback: Omit<UserFeedback, 'timestamp'>): Promise<SubmitFeedbackResponse>;
    /**
     * Retrieves feedback for a specific session
     */
    getFeedback(sessionId: string): Promise<UserFeedback[]>;
    /**
     * Gets aggregated feedback statistics
     */
    getFeedbackStats(): Promise<{
        totalFeedbacks: number;
        averageSeriousRating: number;
        averageFunRating: number;
        averageOverallSatisfaction: number;
        sessionCount: number;
    }>;
    /**
     * Updates simulator configuration
     */
    updateConfig(config: Partial<SimulatorConfig>): void;
    /**
     * Gets current simulator configuration
     */
    getConfig(): SimulatorConfig;
    /**
     * Validates feedback data
     */
    private validateFeedback;
    /**
     * Generates a unique session ID
     */
    private generateSessionId;
}
//# sourceMappingURL=WhatIfAPI.d.ts.map