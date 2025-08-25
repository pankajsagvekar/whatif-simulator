"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WhatIfAPI = void 0;
const WhatIfSimulator_js_1 = require("../services/WhatIfSimulator.js");
/**
 * WhatIfAPI provides interface methods for user interaction
 * Implements requirements 4.1, 4.2, 4.3
 */
class WhatIfAPI {
    constructor(aiService, config) {
        this.feedbackStore = new Map();
        this.sessionCounter = 0;
        this.simulator = new WhatIfSimulator_js_1.WhatIfSimulator(aiService, config);
    }
    /**
     * Processes a "What if..." scenario and returns formatted response
     * Requirements: 4.1 - Display results with clear labels
     *              4.2 - Format output in readable manner
     *              4.3 - Ensure versions are easily scannable
     */
    async processScenario(request) {
        const sessionId = request.sessionId || this.generateSessionId();
        try {
            // Process the scenario using the main simulator
            const result = await this.simulator.processScenario(request.scenario);
            if (!result.success) {
                return {
                    success: false,
                    sessionId,
                    error: result.error || 'Processing failed',
                    metrics: result.metrics
                };
            }
            // Create response with clear version distinction
            const response = {
                success: true,
                sessionId,
                result: {
                    seriousVersion: result.formattedOutput.seriousVersion,
                    funVersion: result.formattedOutput.funVersion,
                    metadata: result.formattedOutput.metadata,
                    presentationOutput: result.presentationOutput
                },
                metrics: result.metrics
            };
            return response;
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            return {
                success: false,
                sessionId,
                error: errorMessage
            };
        }
    }
    /**
     * Submits user feedback for output quality assessment
     * Requirements: User feedback mechanisms for output quality
     */
    async submitFeedback(feedback) {
        try {
            // Validate feedback data
            if (!this.validateFeedback(feedback)) {
                return {
                    success: false,
                    message: 'Invalid feedback data provided'
                };
            }
            // Add timestamp and store feedback
            const completeFeedback = {
                ...feedback,
                timestamp: new Date()
            };
            // Store feedback by session ID
            if (!this.feedbackStore.has(feedback.sessionId)) {
                this.feedbackStore.set(feedback.sessionId, []);
            }
            this.feedbackStore.get(feedback.sessionId).push(completeFeedback);
            const feedbackId = `${feedback.sessionId}_${Date.now()}`;
            return {
                success: true,
                message: 'Feedback submitted successfully',
                feedbackId
            };
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to submit feedback';
            return {
                success: false,
                message: errorMessage
            };
        }
    }
    /**
     * Retrieves feedback for a specific session
     */
    async getFeedback(sessionId) {
        return this.feedbackStore.get(sessionId) || [];
    }
    /**
     * Gets aggregated feedback statistics
     */
    async getFeedbackStats() {
        const allFeedbacks = [];
        for (const feedbacks of this.feedbackStore.values()) {
            allFeedbacks.push(...feedbacks);
        }
        if (allFeedbacks.length === 0) {
            return {
                totalFeedbacks: 0,
                averageSeriousRating: 0,
                averageFunRating: 0,
                averageOverallSatisfaction: 0,
                sessionCount: 0
            };
        }
        const totalSeriousRating = allFeedbacks.reduce((sum, f) => sum + f.seriousRating, 0);
        const totalFunRating = allFeedbacks.reduce((sum, f) => sum + f.funRating, 0);
        const totalSatisfaction = allFeedbacks.reduce((sum, f) => sum + f.overallSatisfaction, 0);
        return {
            totalFeedbacks: allFeedbacks.length,
            averageSeriousRating: totalSeriousRating / allFeedbacks.length,
            averageFunRating: totalFunRating / allFeedbacks.length,
            averageOverallSatisfaction: totalSatisfaction / allFeedbacks.length,
            sessionCount: this.feedbackStore.size
        };
    }
    /**
     * Updates simulator configuration
     */
    updateConfig(config) {
        this.simulator.updateConfig(config);
    }
    /**
     * Gets current simulator configuration
     */
    getConfig() {
        return this.simulator.getConfig();
    }
    /**
     * Validates feedback data
     */
    validateFeedback(feedback) {
        // Check required fields
        if (!feedback.sessionId || !feedback.scenario) {
            return false;
        }
        // Validate rating ranges (1-5)
        if (feedback.seriousRating < 1 || feedback.seriousRating > 5 ||
            feedback.funRating < 1 || feedback.funRating > 5 ||
            feedback.overallSatisfaction < 1 || feedback.overallSatisfaction > 5) {
            return false;
        }
        return true;
    }
    /**
     * Generates a unique session ID
     */
    generateSessionId() {
        this.sessionCounter++;
        const timestamp = Date.now();
        return `session_${timestamp}_${this.sessionCounter}`;
    }
}
exports.WhatIfAPI = WhatIfAPI;
//# sourceMappingURL=WhatIfAPI.js.map