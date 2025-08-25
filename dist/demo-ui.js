#!/usr/bin/env node
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.runUIDemo = runUIDemo;
const WhatIfAPI_1 = require("./api/WhatIfAPI");
const WhatIfWebHandler_1 = require("./web/WhatIfWebHandler");
/**
 * Mock AI Service for demonstration
 */
class DemoAIService {
    async generateResponse(prompt) {
        // Simulate processing delay
        await new Promise(resolve => setTimeout(resolve, 100));
        if (prompt.includes('serious') || prompt.includes('realistic') || prompt.includes('logical')) {
            return `Flying would fundamentally transform human society and infrastructure. Therefore, we would need to redesign cities with vertical transportation in mind. However, the energy requirements would be enormous, requiring significant biological adaptations. Additionally, air traffic control systems would need complete overhaul to manage millions of flying humans safely.`;
        }
        else {
            return `Everyone becomes a human airplane! Traffic jams would move to the sky, and we'd have flying traffic cops with jetpacks! Birds would start a union demanding equal airspace rights!! Weather forecasts would include "human migration patterns" and umbrellas would become obsolete!!!`;
        }
    }
}
/**
 * Demo script to showcase the user interface integration
 * Demonstrates requirements 4.1, 4.2, 4.3
 */
async function runUIDemo() {
    console.log('🚀 What If Simulator - User Interface Integration Demo');
    console.log('═'.repeat(80));
    console.log('This demo showcases the API, CLI, and Web interfaces\n');
    const aiService = new DemoAIService();
    // Demo 1: API Interface
    console.log('📡 API Interface Demo');
    console.log('─'.repeat(40));
    const api = new WhatIfAPI_1.WhatIfAPI(aiService);
    const apiRequest = {
        scenario: 'What if everyone could fly?'
    };
    console.log('Processing scenario via API...');
    const apiResponse = await api.processScenario(apiRequest);
    if (apiResponse.success) {
        console.log('✅ API Processing successful!');
        console.log(`📋 Session ID: ${apiResponse.sessionId}`);
        console.log(`⏱️  Processing time: ${apiResponse.metrics?.totalProcessingTime}ms`);
        console.log(`📊 Scenario type: ${apiResponse.result?.metadata.scenarioType}`);
        // Submit feedback via API
        const feedback = {
            sessionId: apiResponse.sessionId,
            scenario: apiRequest.scenario,
            seriousRating: 4,
            funRating: 5,
            overallSatisfaction: 4,
            comments: 'Great dual perspective analysis!'
        };
        const feedbackResponse = await api.submitFeedback(feedback);
        console.log(`📝 Feedback submitted: ${feedbackResponse.success ? 'Success' : 'Failed'}`);
        // Get stats
        const stats = await api.getFeedbackStats();
        console.log(`📊 Total feedbacks: ${stats.totalFeedbacks}`);
        console.log(`⭐ Average ratings: Serious=${stats.averageSeriousRating.toFixed(1)}, Fun=${stats.averageFunRating.toFixed(1)}`);
    }
    else {
        console.log('❌ API Processing failed:', apiResponse.error);
    }
    console.log('\n');
    // Demo 2: Web Handler Interface
    console.log('🌐 Web Handler Interface Demo');
    console.log('─'.repeat(40));
    const webHandler = new WhatIfWebHandler_1.WhatIfWebHandler(aiService);
    // Health check
    const healthRequest = {
        method: 'GET',
        path: '/'
    };
    const healthResponse = await webHandler.handleRequest(healthRequest);
    console.log(`🏥 Health check: ${healthResponse.statusCode === 200 ? 'Healthy' : 'Unhealthy'}`);
    // Process scenario via web
    const webProcessRequest = {
        method: 'POST',
        path: '/process',
        body: {
            scenario: 'What if robots took over all jobs?'
        }
    };
    console.log('Processing scenario via Web Handler...');
    const webProcessResponse = await webHandler.handleRequest(webProcessRequest);
    if (webProcessResponse.statusCode === 200 && webProcessResponse.body.success) {
        console.log('✅ Web processing successful!');
        console.log(`📋 Session ID: ${webProcessResponse.body.sessionId}`);
        // Submit feedback via web
        const webFeedbackRequest = {
            method: 'POST',
            path: '/feedback',
            body: {
                sessionId: webProcessResponse.body.sessionId,
                scenario: 'What if robots took over all jobs?',
                seriousRating: 5,
                funRating: 4,
                overallSatisfaction: 5,
                comments: 'Very insightful analysis of automation impact!'
            }
        };
        const webFeedbackResponse = await webHandler.handleRequest(webFeedbackRequest);
        console.log(`📝 Web feedback submitted: ${webFeedbackResponse.statusCode === 200 ? 'Success' : 'Failed'}`);
        // Get stats via web
        const webStatsRequest = {
            method: 'GET',
            path: '/stats'
        };
        const webStatsResponse = await webHandler.handleRequest(webStatsRequest);
        if (webStatsResponse.statusCode === 200) {
            const webStats = webStatsResponse.body.stats;
            console.log(`📊 Web stats - Total feedbacks: ${webStats.totalFeedbacks}, Sessions: ${webStats.sessionCount}`);
        }
    }
    else {
        console.log('❌ Web processing failed:', webProcessResponse.body.error);
    }
    console.log('\n');
    // Demo 3: Response Presentation
    console.log('🎨 Response Presentation Demo');
    console.log('─'.repeat(40));
    // Show formatted presentation output
    if (apiResponse.success && apiResponse.result) {
        console.log('📋 Formatted Presentation Output:');
        console.log('═'.repeat(80));
        console.log(apiResponse.result.presentationOutput);
        console.log('═'.repeat(80));
    }
    console.log('\n');
    // Demo 4: HTML Presentation
    console.log('📄 HTML Presentation Demo');
    console.log('─'.repeat(40));
    if (webProcessResponse.statusCode === 200 && webProcessResponse.body.success) {
        const htmlPresentation = webHandler.createHTMLPresentation(webProcessResponse.body);
        console.log('✅ HTML presentation generated successfully');
        console.log(`📏 HTML length: ${htmlPresentation.length} characters`);
        console.log('🎯 Contains: Version distinction, feedback form, styling');
        // Show a snippet of the HTML
        const snippet = htmlPresentation.substring(0, 200) + '...';
        console.log('📝 HTML snippet:');
        console.log(snippet);
    }
    console.log('\n');
    // Demo 5: Configuration Management
    console.log('⚙️  Configuration Management Demo');
    console.log('─'.repeat(40));
    // Show current config
    const currentConfig = api.getConfig();
    console.log('📋 Current configuration:');
    console.log(`   Logging: ${currentConfig.enableLogging}`);
    console.log(`   Metrics: ${currentConfig.enableMetrics}`);
    console.log(`   Max processing time: ${currentConfig.maxProcessingTime}ms`);
    console.log(`   Parallel generation: ${currentConfig.enableParallelGeneration}`);
    // Update config
    api.updateConfig({
        enableLogging: false,
        maxProcessingTime: 20000
    });
    const updatedConfig = api.getConfig();
    console.log('✅ Configuration updated:');
    console.log(`   Logging: ${updatedConfig.enableLogging}`);
    console.log(`   Max processing time: ${updatedConfig.maxProcessingTime}ms`);
    console.log('\n');
    // Demo 6: Error Handling
    console.log('🚨 Error Handling Demo');
    console.log('─'.repeat(40));
    // Test invalid scenario
    const invalidRequest = {
        scenario: ''
    };
    const errorResponse = await api.processScenario(invalidRequest);
    console.log(`❌ Invalid scenario handling: ${errorResponse.success ? 'Unexpected success' : 'Properly handled'}`);
    console.log(`📝 Error message: ${errorResponse.error}`);
    // Test invalid web request
    const invalidWebRequest = {
        method: 'POST',
        path: '/process',
        body: {}
    };
    const webErrorResponse = await webHandler.handleRequest(invalidWebRequest);
    console.log(`🌐 Web error handling: ${webErrorResponse.statusCode === 400 ? 'Properly handled' : 'Unexpected response'}`);
    console.log(`📝 Web error: ${webErrorResponse.body.error}`);
    console.log('\n');
    // Summary
    console.log('📊 Demo Summary');
    console.log('─'.repeat(40));
    console.log('✅ API Interface: Functional with feedback collection');
    console.log('✅ Web Handler: HTTP-like interface with CORS support');
    console.log('✅ Response Presentation: Clear version distinction (Requirements 4.1, 4.2, 4.3)');
    console.log('✅ HTML Generation: Web-ready presentation with styling');
    console.log('✅ Feedback Mechanisms: Rating system and statistics');
    console.log('✅ Configuration Management: Runtime configuration updates');
    console.log('✅ Error Handling: Graceful error responses');
    console.log('✅ Integration Testing: End-to-end flow validation');
    console.log('\n🎯 User Interface Integration Demo Complete!');
    console.log('The system provides multiple interface options with consistent functionality.');
}
// Run the demo
if (require.main === module) {
    runUIDemo().catch(console.error);
}
//# sourceMappingURL=demo-ui.js.map