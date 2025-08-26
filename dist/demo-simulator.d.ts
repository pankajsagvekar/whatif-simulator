import { AIService } from './services/SeriousOutcomeGenerator';
/**
 * Demo AI Service implementation for testing the WhatIfSimulator
 * In a real application, this would integrate with actual AI services like OpenAI, Anthropic, etc.
 */
declare class DemoAIService implements AIService {
    generateResponse(prompt: string): Promise<string>;
    private generateSeriousResponse;
    private generateFunResponse;
}
/**
 * Demo function showing how to use the integrated WhatIfSimulatorApp
 */
declare function runDemo(): Promise<void>;
export { runDemo, DemoAIService };
//# sourceMappingURL=demo-simulator.d.ts.map