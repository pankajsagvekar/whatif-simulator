import { ProcessScenarioResponse } from '../api/WhatIfAPI.js';
import { AIService } from '../services/SeriousOutcomeGenerator.js';
import { SimulatorConfig } from '../services/WhatIfSimulator.js';
/**
 * HTTP request handler for web-based interactions
 */
export interface WebRequest {
    method: 'GET' | 'POST' | 'PUT' | 'DELETE';
    path: string;
    body?: any;
    query?: Record<string, string>;
    headers?: Record<string, string>;
}
/**
 * HTTP response structure
 */
export interface WebResponse {
    statusCode: number;
    headers: Record<string, string>;
    body: any;
}
/**
 * Web handler for the What If Simulator
 * Provides HTTP-like interface methods for web integration
 * Implements requirements 4.1, 4.2, 4.3
 */
export declare class WhatIfWebHandler {
    private api;
    constructor(aiService: AIService, config?: Partial<SimulatorConfig>);
    /**
     * Handles incoming web requests and routes them appropriately
     */
    handleRequest(request: WebRequest): Promise<WebResponse>;
    /**
     * Handles health check requests
     */
    private handleHealthCheck;
    /**
     * Handles scenario processing requests
     * Requirements: 4.1, 4.2, 4.3 - Clear version distinction and readable format
     */
    private handleProcessScenario;
    /**
     * Handles feedback submission requests
     */
    private handleSubmitFeedback;
    /**
     * Handles feedback retrieval requests
     */
    private handleGetFeedback;
    /**
     * Handles statistics requests
     */
    private handleGetStats;
    /**
     * Handles configuration retrieval requests
     */
    private handleGetConfig;
    /**
     * Handles configuration update requests
     */
    private handleUpdateConfig;
    /**
     * Creates a standardized error response
     */
    private createErrorResponse;
    /**
     * Creates an HTML presentation for web browsers
     * Requirements: 4.1, 4.2, 4.3 - Clear distinction and readable format
     */
    createHTMLPresentation(response: ProcessScenarioResponse): string;
}
//# sourceMappingURL=WhatIfWebHandler.d.ts.map