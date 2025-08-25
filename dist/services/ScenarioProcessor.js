"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ScenarioProcessor = void 0;
const ErrorHandler_1 = require("../utils/ErrorHandler");
/**
 * ScenarioProcessor analyzes and structures "What if..." scenarios
 * for further processing by outcome generators
 */
class ScenarioProcessor {
    /**
     * Processes a scenario to extract structure and context
     * @param scenario - The sanitized scenario text to process
     * @returns ProcessedScenario with analyzed structure
     */
    processScenario(scenario) {
        try {
            // Validate input
            if (!scenario || typeof scenario !== 'string' || scenario.trim().length === 0) {
                throw new ErrorHandler_1.WhatIfSimulatorError('Invalid scenario input provided', ErrorHandler_1.ErrorType.INPUT_VALIDATION, undefined, false);
            }
            const trimmedScenario = scenario.trim();
            // Process with error handling for each step
            const scenarioType = this.identifyScenarioType(trimmedScenario);
            const keyElements = this.extractKeyElements(trimmedScenario);
            const complexity = this.assessComplexity(trimmedScenario, keyElements);
            // Validate processing results
            if (!scenarioType || !keyElements || !complexity) {
                throw new ErrorHandler_1.WhatIfSimulatorError('Failed to properly analyze scenario structure', ErrorHandler_1.ErrorType.PROCESSING, undefined, false);
            }
            return {
                originalText: trimmedScenario,
                scenarioType,
                keyElements,
                complexity
            };
        }
        catch (error) {
            const context = `scenario processing for "${scenario?.substring(0, 50)}..."`;
            ErrorHandler_1.ErrorHandler.logError(error, context);
            if (error instanceof ErrorHandler_1.WhatIfSimulatorError) {
                throw error;
            }
            // Provide fallback processing for unexpected errors
            return this.createFallbackProcessedScenario(scenario);
        }
    }
    /**
     * Creates a fallback processed scenario when normal processing fails
     * @param scenario - The original scenario text
     * @returns Basic ProcessedScenario with minimal analysis
     */
    createFallbackProcessedScenario(scenario) {
        const safeScenario = scenario || 'Unknown scenario';
        return {
            originalText: safeScenario,
            scenarioType: 'hypothetical',
            keyElements: {
                actors: ['people'],
                actions: ['change'],
                context: safeScenario
            },
            complexity: 'simple'
        };
    }
    /**
     * Identifies the type of scenario based on content analysis
     * @param scenario - The scenario text to analyze
     * @returns The identified scenario type
     */
    identifyScenarioType(scenario) {
        const lowerScenario = scenario.toLowerCase();
        // Historical indicators - check first as they're most specific
        const historicalKeywords = [
            'napoleon', 'rome', 'roman', 'egypt', 'egyptian', 'world war', 'revolution',
            'king', 'queen', 'emperor', 'ancient', 'medieval', 'empire', 'civilization',
            'battle of', 'dynasty', 'pharaoh', 'caesar', 'historical', 'history',
            'century', 'decade ago', 'years ago', 'back then', 'dinosaur', 'extinct'
        ];
        // Personal indicators - check before professional to catch personal work scenarios
        const personalKeywords = [
            '\\bi\\b', '\\bme\\b', '\\bmy\\b', '\\bmyself\\b', 'family', 'friend', 'relationship',
            'home', 'house', 'personal', 'life', 'love', 'marriage', 'child',
            'parent', 'sibling', 'pet', 'hobby', 'health', 'school',
            'college', 'university', 'dating', 'wedding', 'won the lottery'
        ];
        // Professional indicators
        const professionalKeywords = [
            'company', 'business', 'office', 'work week', 'job market', 'startup',
            'corporation', 'industry', 'market', 'economy', 'meeting',
            'project', 'team', 'manager', 'employee', 'salary', 'promotion',
            'interview', 'client', 'customer', 'deadline', 'budget'
        ];
        // Check for historical content first (most specific)
        if (historicalKeywords.some(keyword => {
            if (keyword.includes('\\b')) {
                return new RegExp(keyword, 'i').test(lowerScenario);
            }
            return lowerScenario.includes(keyword);
        })) {
            return 'historical';
        }
        // Check for personal content (including personal pronouns)
        if (personalKeywords.some(keyword => {
            if (keyword.includes('\\b')) {
                return new RegExp(keyword, 'i').test(lowerScenario);
            }
            return lowerScenario.includes(keyword);
        })) {
            return 'personal';
        }
        // Check for professional content
        if (professionalKeywords.some(keyword => lowerScenario.includes(keyword))) {
            return 'professional';
        }
        // Default to hypothetical for abstract or unclear scenarios
        return 'hypothetical';
    }
    /**
     * Extracts key elements from the scenario text
     * @param scenario - The scenario text to analyze
     * @returns Object containing actors, actions, and context
     */
    extractKeyElements(scenario) {
        const actors = this.extractActors(scenario);
        const actions = this.extractActions(scenario);
        const context = this.extractContext(scenario);
        return {
            actors,
            actions,
            context
        };
    }
    /**
     * Extracts potential actors/entities from the scenario
     * @param scenario - The scenario text
     * @returns Array of identified actors
     */
    extractActors(scenario) {
        const actors = [];
        const lowerScenario = scenario.toLowerCase();
        // Check for "I" specifically (preserve capitalization)
        if (/\b(i|me|myself)\b/i.test(scenario)) {
            actors.push('I');
        }
        // Common actor patterns (excluding "I" since we handled it above)
        const actorPatterns = [
            /\b(people|person|everyone|someone|anyone)\b/g,
            /\b(government|politicians?|president|leader|authority)\b/g,
            /\b(company|companies|business|corporation)\b/g,
            /\b(family|friends?|parents?|children|kids)\b/g,
            /\b(humans?|humanity|mankind|society)\b/g,
            /\b(animals?|pets?|dogs?|cats?)\b/g,
            /\b(scientists?|researchers?|experts?)\b/g,
            /\b(teachers?|students?|doctors?|lawyers?)\b/g
        ];
        actorPatterns.forEach(pattern => {
            const matches = lowerScenario.match(pattern);
            if (matches) {
                matches.forEach(match => {
                    const actor = match.trim();
                    if (actor && !actors.includes(actor) && actor !== 'i' && actor !== 'me' && actor !== 'myself') {
                        actors.push(actor);
                    }
                });
            }
        });
        // If no specific actors found, add generic ones
        if (actors.length === 0) {
            actors.push('people');
        }
        return actors.slice(0, 5); // Limit to 5 most relevant actors
    }
    /**
     * Extracts key actions from the scenario
     * @param scenario - The scenario text
     * @returns Array of identified actions
     */
    extractActions(scenario) {
        const actions = [];
        // Common action verbs in "what if" scenarios
        const actionPatterns = [
            /\b(could|would|might|should|can|will)\s+(\w+)/g,
            /\b(stop|start|begin|end|change|become|turn|make|do|go|come|leave|stay)\b/g,
            /\b(discover|invent|create|destroy|build|break|fix|solve|find|lose)\b/g,
            /\b(decide|choose|pick|select|vote|elect|appoint)\b/g,
            /\b(buy|sell|trade|invest|spend|save|earn|pay)\b/g,
            /\b(move|travel|visit|explore|migrate|relocate)\b/g,
            /\b(learn|study|teach|educate|train|practice)\b/g,
            /\b(meet|marry|divorce|date|befriend|fight|argue)\b/g
        ];
        const lowerScenario = scenario.toLowerCase();
        actionPatterns.forEach(pattern => {
            const matches = lowerScenario.match(pattern);
            if (matches) {
                matches.forEach(match => {
                    const action = match.trim();
                    if (action && !actions.includes(action)) {
                        actions.push(action);
                    }
                });
            }
        });
        return actions.slice(0, 5); // Limit to 5 most relevant actions
    }
    /**
     * Extracts contextual information from the scenario
     * @param scenario - The scenario text
     * @returns Contextual summary
     */
    extractContext(scenario) {
        // Remove "what if" prefix and clean up
        let context = scenario.replace(/^what\s+if\s+/i, '').trim();
        // Capitalize first letter
        if (context.length > 0) {
            context = context.charAt(0).toUpperCase() + context.slice(1);
        }
        // Ensure it ends with proper punctuation
        if (context && !context.match(/[.!?]$/)) {
            context += '?';
        }
        return context || scenario;
    }
    /**
     * Assesses the complexity of the scenario
     * @param scenario - The scenario text
     * @param keyElements - Extracted key elements
     * @returns Complexity level
     */
    assessComplexity(scenario, keyElements) {
        let complexityScore = 0;
        // Length factor
        const wordCount = scenario.split(/\s+/).filter(word => word.length > 0).length;
        if (wordCount > 25)
            complexityScore += 3;
        else if (wordCount > 15)
            complexityScore += 2;
        else if (wordCount > 8)
            complexityScore += 1;
        // Number of actors
        if (keyElements.actors.length > 3)
            complexityScore += 2;
        else if (keyElements.actors.length > 1)
            complexityScore += 1;
        // Number of actions
        if (keyElements.actions.length > 3)
            complexityScore += 2;
        else if (keyElements.actions.length > 1)
            complexityScore += 1;
        const lowerScenario = scenario.toLowerCase();
        // Complex keywords indicating multi-faceted scenarios (highest complexity)
        const complexKeywords = [
            'economy', 'society', 'global', 'worldwide', 'international',
            'system', 'environment', 'climate', 'politics',
            'multiple', 'various', 'different', 'several', 'many',
            'consequences', 'implications', 'effects', 'impact', 'influence',
            'restructure', 'collaborate', 'regulate', 'organizations'
        ];
        const complexKeywordCount = complexKeywords.filter(keyword => lowerScenario.includes(keyword)).length;
        // Professional/specialized terms that indicate moderate complexity
        const moderateKeywords = [
            'therapist', 'professional', 'career', 'job', 'work', 'business',
            'electric', 'technology', 'industry', 'underwater', 'building',
            'minds', 'read minds', 'superpowers', 'abilities', 'collapsed', 'cities'
        ];
        const moderateKeywordCount = moderateKeywords.filter(keyword => lowerScenario.includes(keyword)).length;
        // Conditional logic indicators
        const conditionalWords = ['and', 'or', 'but', 'however', 'while', 'although', 'because', 'since'];
        const conditionalCount = conditionalWords.filter(word => lowerScenario.includes(word)).length;
        // Add scores (avoid double counting by prioritizing complex keywords)
        if (complexKeywordCount > 0) {
            complexityScore += complexKeywordCount * 3; // Weight complex keywords heavily
        }
        else if (moderateKeywordCount > 0) {
            complexityScore += moderateKeywordCount * 2; // Weight moderate keywords moderately
        }
        complexityScore += Math.min(conditionalCount, 2); // Cap conditional bonus
        // Determine complexity level with adjusted thresholds
        if (complexityScore >= 10)
            return 'complex';
        if (complexityScore >= 4)
            return 'moderate';
        return 'simple';
    }
}
exports.ScenarioProcessor = ScenarioProcessor;
//# sourceMappingURL=ScenarioProcessor.js.map