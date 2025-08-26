/**
 * Comprehensive test data sets for various "What if..." scenario categories
 * Used across different test suites to ensure consistent testing coverage
 */
export interface TestScenario {
    input: string;
    expectedType: 'personal' | 'professional' | 'historical' | 'hypothetical';
    complexity: 'simple' | 'moderate' | 'complex';
    category: string;
    description: string;
}
export interface TestScenarioSet {
    name: string;
    scenarios: TestScenario[];
}
export declare const personalScenarios: TestScenario[];
export declare const professionalScenarios: TestScenario[];
export declare const historicalScenarios: TestScenario[];
export declare const hypotheticalScenarios: TestScenario[];
export declare const complexScenarios: TestScenario[];
export declare const edgeCaseScenarios: TestScenario[];
export declare const appropriatenessTestScenarios: TestScenario[];
export declare const performanceTestScenarios: TestScenario[];
export declare const allTestScenarioSets: TestScenarioSet[];
export declare function getScenariosByType(type: 'personal' | 'professional' | 'historical' | 'hypothetical'): TestScenario[];
export declare function getScenariosByComplexity(complexity: 'simple' | 'moderate' | 'complex'): TestScenario[];
export declare function getScenariosByCategory(category: string): TestScenario[];
export declare function getAllScenarios(): TestScenario[];
export declare function getRandomScenarios(count: number): TestScenario[];
export declare function getScenarioInputs(scenarios: TestScenario[]): string[];
export declare const invalidScenarios: {
    empty: string[];
    tooShort: string[];
    inappropriate: string[];
    nonScenarios: string[];
    tooLong: string[];
};
declare const _default: {
    allTestScenarioSets: TestScenarioSet[];
    getScenariosByType: typeof getScenariosByType;
    getScenariosByComplexity: typeof getScenariosByComplexity;
    getScenariosByCategory: typeof getScenariosByCategory;
    getAllScenarios: typeof getAllScenarios;
    getRandomScenarios: typeof getRandomScenarios;
    getScenarioInputs: typeof getScenarioInputs;
    invalidScenarios: {
        empty: string[];
        tooShort: string[];
        inappropriate: string[];
        nonScenarios: string[];
        tooLong: string[];
    };
};
export default _default;
//# sourceMappingURL=test-data.d.ts.map