import { WhatIfAPI, ProcessScenarioRequest, ProcessScenarioResponse, UserFeedback, SubmitFeedbackResponse } from '../api/WhatIfAPI.js';
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
export class WhatIfWebHandler {
  private api: WhatIfAPI;

  constructor(aiService: AIService, config?: Partial<SimulatorConfig>) {
    this.api = new WhatIfAPI(aiService, config);
  }

  /**
   * Handles incoming web requests and routes them appropriately
   */
  async handleRequest(request: WebRequest): Promise<WebResponse> {
    try {
      // Set CORS headers
      const headers = {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization'
      };

      // Handle preflight requests
      if (request.method === 'GET' && request.path === '/') {
        return this.handleHealthCheck(headers);
      }

      // Route requests
      switch (request.path) {
        case '/process':
          if (request.method === 'POST') {
            return await this.handleProcessScenario(request, headers);
          }
          break;

        case '/feedback':
          if (request.method === 'POST') {
            return await this.handleSubmitFeedback(request, headers);
          }
          if (request.method === 'GET') {
            return await this.handleGetFeedback(request, headers);
          }
          break;

        case '/stats':
          if (request.method === 'GET') {
            return await this.handleGetStats(headers);
          }
          break;

        case '/config':
          if (request.method === 'GET') {
            return await this.handleGetConfig(headers);
          }
          if (request.method === 'PUT') {
            return await this.handleUpdateConfig(request, headers);
          }
          break;

        default:
          return this.createErrorResponse(404, 'Not Found', headers);
      }

      return this.createErrorResponse(405, 'Method Not Allowed', headers);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Internal Server Error';
      return this.createErrorResponse(500, errorMessage, {
        'Content-Type': 'application/json'
      });
    }
  }

  /**
   * Handles health check requests
   */
  private handleHealthCheck(headers: Record<string, string>): WebResponse {
    return {
      statusCode: 200,
      headers,
      body: {
        status: 'healthy',
        service: 'What If Simulator',
        version: '1.0.0',
        timestamp: new Date().toISOString()
      }
    };
  }

  /**
   * Handles scenario processing requests
   * Requirements: 4.1, 4.2, 4.3 - Clear version distinction and readable format
   */
  private async handleProcessScenario(request: WebRequest, headers: Record<string, string>): Promise<WebResponse> {
    try {
      if (!request.body || !request.body.scenario) {
        return this.createErrorResponse(400, 'Scenario is required', headers);
      }

      const processRequest: ProcessScenarioRequest = {
        scenario: request.body.scenario,
        sessionId: request.body.sessionId,
        config: request.body.config
      };

      const response: ProcessScenarioResponse = await this.api.processScenario(processRequest);

      return {
        statusCode: response.success ? 200 : 400,
        headers,
        body: response
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Processing failed';
      return this.createErrorResponse(500, errorMessage, headers);
    }
  }

  /**
   * Handles feedback submission requests
   */
  private async handleSubmitFeedback(request: WebRequest, headers: Record<string, string>): Promise<WebResponse> {
    try {
      const feedback = request.body;
      
      if (!feedback || !feedback.sessionId || !feedback.scenario) {
        return this.createErrorResponse(400, 'Session ID and scenario are required', headers);
      }

      const response: SubmitFeedbackResponse = await this.api.submitFeedback(feedback);

      return {
        statusCode: response.success ? 200 : 400,
        headers,
        body: response
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Feedback submission failed';
      return this.createErrorResponse(500, errorMessage, headers);
    }
  }

  /**
   * Handles feedback retrieval requests
   */
  private async handleGetFeedback(request: WebRequest, headers: Record<string, string>): Promise<WebResponse> {
    try {
      const sessionId = request.query?.sessionId;
      
      if (!sessionId) {
        return this.createErrorResponse(400, 'Session ID is required', headers);
      }

      const feedback = await this.api.getFeedback(sessionId);

      return {
        statusCode: 200,
        headers,
        body: {
          success: true,
          feedback
        }
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to retrieve feedback';
      return this.createErrorResponse(500, errorMessage, headers);
    }
  }

  /**
   * Handles statistics requests
   */
  private async handleGetStats(headers: Record<string, string>): Promise<WebResponse> {
    try {
      const stats = await this.api.getFeedbackStats();

      return {
        statusCode: 200,
        headers,
        body: {
          success: true,
          stats
        }
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to retrieve statistics';
      return this.createErrorResponse(500, errorMessage, headers);
    }
  }

  /**
   * Handles configuration retrieval requests
   */
  private async handleGetConfig(headers: Record<string, string>): Promise<WebResponse> {
    try {
      const config = this.api.getConfig();

      return {
        statusCode: 200,
        headers,
        body: {
          success: true,
          config
        }
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to retrieve configuration';
      return this.createErrorResponse(500, errorMessage, headers);
    }
  }

  /**
   * Handles configuration update requests
   */
  private async handleUpdateConfig(request: WebRequest, headers: Record<string, string>): Promise<WebResponse> {
    try {
      if (!request.body || !request.body.config) {
        return this.createErrorResponse(400, 'Configuration is required', headers);
      }

      this.api.updateConfig(request.body.config);

      return {
        statusCode: 200,
        headers,
        body: {
          success: true,
          message: 'Configuration updated successfully',
          config: this.api.getConfig()
        }
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update configuration';
      return this.createErrorResponse(500, errorMessage, headers);
    }
  }

  /**
   * Creates a standardized error response
   */
  private createErrorResponse(statusCode: number, message: string, headers: Record<string, string>): WebResponse {
    return {
      statusCode,
      headers,
      body: {
        success: false,
        error: message,
        timestamp: new Date().toISOString()
      }
    };
  }

  /**
   * Creates an HTML presentation for web browsers
   * Requirements: 4.1, 4.2, 4.3 - Clear distinction and readable format
   */
  createHTMLPresentation(response: ProcessScenarioResponse): string {
    if (!response.success || !response.result) {
      return `
        <div class="error">
          <h2>❌ Processing Failed</h2>
          <p>${response.error}</p>
        </div>
      `;
    }

    const { result } = response;
    
    return `
      <div class="whatif-results">
        <style>
          .whatif-results {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
            line-height: 1.6;
          }
          .version-container {
            margin: 20px 0;
            padding: 20px;
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
          }
          .serious-version {
            background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
            border-left: 4px solid #007bff;
          }
          .fun-version {
            background: linear-gradient(135deg, #fff3cd 0%, #ffeaa7 100%);
            border-left: 4px solid #ffc107;
          }
          .version-title {
            font-size: 1.4em;
            font-weight: bold;
            margin-bottom: 15px;
            display: flex;
            align-items: center;
          }
          .version-content {
            font-size: 1.1em;
            white-space: pre-wrap;
          }
          .metadata {
            margin-top: 30px;
            padding: 15px;
            background: #f8f9fa;
            border-radius: 6px;
            font-size: 0.9em;
            color: #6c757d;
          }
          .feedback-form {
            margin-top: 30px;
            padding: 20px;
            background: #e3f2fd;
            border-radius: 8px;
          }
        </style>
        
        <h1>🎯 What If Simulator Results</h1>
        
        <div class="version-container serious-version">
          <div class="version-title">
            🧠 Serious Analysis
          </div>
          <div class="version-content">${result.seriousVersion}</div>
        </div>
        
        <div class="version-container fun-version">
          <div class="version-title">
            🎭 Fun Interpretation
          </div>
          <div class="version-content">${result.funVersion}</div>
        </div>
        
        <div class="metadata">
          <strong>📊 Processing Details:</strong><br>
          Processing Time: ${result.metadata.processingTime}ms<br>
          Scenario Type: ${result.metadata.scenarioType}<br>
          Session ID: ${response.sessionId}
        </div>
        
        <div class="feedback-form">
          <h3>📝 Rate This Response</h3>
          <p>Help us improve by rating the quality of both versions!</p>
          <form id="feedbackForm">
            <input type="hidden" name="sessionId" value="${response.sessionId}">
            <div style="margin: 10px 0;">
              <label>Serious Version Rating (1-5): </label>
              <select name="seriousRating" required>
                <option value="">Select...</option>
                <option value="1">1 - Poor</option>
                <option value="2">2 - Fair</option>
                <option value="3">3 - Good</option>
                <option value="4">4 - Very Good</option>
                <option value="5">5 - Excellent</option>
              </select>
            </div>
            <div style="margin: 10px 0;">
              <label>Fun Version Rating (1-5): </label>
              <select name="funRating" required>
                <option value="">Select...</option>
                <option value="1">1 - Poor</option>
                <option value="2">2 - Fair</option>
                <option value="3">3 - Good</option>
                <option value="4">4 - Very Good</option>
                <option value="5">5 - Excellent</option>
              </select>
            </div>
            <div style="margin: 10px 0;">
              <label>Overall Satisfaction (1-5): </label>
              <select name="overallSatisfaction" required>
                <option value="">Select...</option>
                <option value="1">1 - Poor</option>
                <option value="2">2 - Fair</option>
                <option value="3">3 - Good</option>
                <option value="4">4 - Very Good</option>
                <option value="5">5 - Excellent</option>
              </select>
            </div>
            <div style="margin: 10px 0;">
              <label>Comments (optional):</label><br>
              <textarea name="comments" rows="3" cols="50" placeholder="Any additional feedback..."></textarea>
            </div>
            <button type="submit" style="background: #007bff; color: white; padding: 10px 20px; border: none; border-radius: 4px; cursor: pointer;">
              Submit Feedback
            </button>
          </form>
        </div>
      </div>
    `;
  }
}