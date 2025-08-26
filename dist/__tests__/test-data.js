"use strict";
/**
 * Comprehensive test data sets for various "What if..." scenario categories
 * Used across different test suites to ensure consistent testing coverage
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.invalidScenarios = exports.allTestScenarioSets = exports.performanceTestScenarios = exports.appropriatenessTestScenarios = exports.edgeCaseScenarios = exports.complexScenarios = exports.hypotheticalScenarios = exports.historicalScenarios = exports.professionalScenarios = exports.personalScenarios = void 0;
exports.getScenariosByType = getScenariosByType;
exports.getScenariosByComplexity = getScenariosByComplexity;
exports.getScenariosByCategory = getScenariosByCategory;
exports.getAllScenarios = getAllScenarios;
exports.getRandomScenarios = getRandomScenarios;
exports.getScenarioInputs = getScenarioInputs;
// Personal scenarios covering individual experiences and abilities
exports.personalScenarios = [
    {
        input: "What if I could read people's minds?",
        expectedType: 'personal',
        complexity: 'moderate',
        category: 'supernatural_abilities',
        description: 'Mind reading ability scenario'
    },
    {
        input: "What if I never needed to sleep?",
        expectedType: 'personal',
        complexity: 'simple',
        category: 'biological_changes',
        description: 'Sleep elimination scenario'
    },
    {
        input: "What if I could speak every language fluently?",
        expectedType: 'personal',
        complexity: 'simple',
        category: 'skills_abilities',
        description: 'Universal language ability'
    },
    {
        input: "What if I had perfect memory and could never forget anything?",
        expectedType: 'personal',
        complexity: 'moderate',
        category: 'cognitive_abilities',
        description: 'Perfect memory scenario'
    },
    {
        input: "What if I could see 10 minutes into the future?",
        expectedType: 'personal',
        complexity: 'complex',
        category: 'supernatural_abilities',
        description: 'Limited precognition ability'
    },
    {
        input: "What if I could become invisible at will?",
        expectedType: 'personal',
        complexity: 'moderate',
        category: 'supernatural_abilities',
        description: 'Invisibility power scenario'
    },
    {
        input: "What if I could teleport anywhere instantly?",
        expectedType: 'personal',
        complexity: 'moderate',
        category: 'supernatural_abilities',
        description: 'Teleportation ability'
    },
    {
        input: "What if I lived for 500 years instead of a normal lifespan?",
        expectedType: 'personal',
        complexity: 'complex',
        category: 'biological_changes',
        description: 'Extended lifespan scenario'
    },
    {
        input: "What if I could feel everyone's emotions around me?",
        expectedType: 'personal',
        complexity: 'moderate',
        category: 'supernatural_abilities',
        description: 'Empathic ability scenario'
    },
    {
        input: "What if I could control time for myself only?",
        expectedType: 'personal',
        complexity: 'complex',
        category: 'supernatural_abilities',
        description: 'Personal time manipulation'
    }
];
// Professional scenarios covering workplace and career changes
exports.professionalScenarios = [
    {
        input: "What if companies switched to a 4-day work week globally?",
        expectedType: 'professional',
        complexity: 'moderate',
        category: 'work_schedule',
        description: 'Reduced work week scenario'
    },
    {
        input: "What if all meetings were conducted in virtual reality?",
        expectedType: 'professional',
        complexity: 'simple',
        category: 'technology_adoption',
        description: 'VR meetings scenario'
    },
    {
        input: "What if AI replaced all middle management positions?",
        expectedType: 'professional',
        complexity: 'complex',
        category: 'automation',
        description: 'AI management replacement'
    },
    {
        input: "What if remote work became mandatory worldwide?",
        expectedType: 'professional',
        complexity: 'moderate',
        category: 'work_location',
        description: 'Mandatory remote work'
    },
    {
        input: "What if the standard work day was only 6 hours?",
        expectedType: 'professional',
        complexity: 'moderate',
        category: 'work_schedule',
        description: 'Shortened work day'
    },
    {
        input: "What if automation replaced 80% of manufacturing jobs?",
        expectedType: 'professional',
        complexity: 'complex',
        category: 'automation',
        description: 'Mass manufacturing automation'
    },
    {
        input: "What if all software became free and open source?",
        expectedType: 'professional',
        complexity: 'complex',
        category: 'business_models',
        description: 'Open source everything'
    },
    {
        input: "What if employees could work for multiple companies simultaneously?",
        expectedType: 'professional',
        complexity: 'moderate',
        category: 'employment_structure',
        description: 'Multi-company employment'
    },
    {
        input: "What if performance was measured only by results, not hours worked?",
        expectedType: 'professional',
        complexity: 'simple',
        category: 'performance_metrics',
        description: 'Results-only work environment'
    },
    {
        input: "What if every job required continuous learning and skill updates?",
        expectedType: 'professional',
        complexity: 'moderate',
        category: 'skill_development',
        description: 'Continuous learning requirement'
    }
];
// Historical scenarios exploring alternate history
exports.historicalScenarios = [
    {
        input: "What if Napoleon had won the Battle of Waterloo?",
        expectedType: 'historical',
        complexity: 'complex',
        category: 'military_history',
        description: 'Napoleonic victory scenario'
    },
    {
        input: "What if the Library of Alexandria had never been destroyed?",
        expectedType: 'historical',
        complexity: 'complex',
        category: 'knowledge_preservation',
        description: 'Preserved ancient knowledge'
    },
    {
        input: "What if the Roman Empire had never fallen?",
        expectedType: 'historical',
        complexity: 'complex',
        category: 'empire_continuity',
        description: 'Continued Roman Empire'
    },
    {
        input: "What if Columbus had never reached the Americas?",
        expectedType: 'historical',
        complexity: 'complex',
        category: 'exploration',
        description: 'No European discovery of Americas'
    },
    {
        input: "What if the printing press had been invented 500 years earlier?",
        expectedType: 'historical',
        complexity: 'complex',
        category: 'technological_advancement',
        description: 'Earlier printing press invention'
    },
    {
        input: "What if the dinosaurs had never gone extinct?",
        expectedType: 'historical',
        complexity: 'complex',
        category: 'prehistoric_events',
        description: 'Dinosaur survival scenario'
    },
    {
        input: "What if the internet had been invented in the 1950s?",
        expectedType: 'historical',
        complexity: 'complex',
        category: 'technological_advancement',
        description: 'Earlier internet development'
    },
    {
        input: "What if World War II had never happened?",
        expectedType: 'historical',
        complexity: 'complex',
        category: 'military_history',
        description: 'No WWII scenario'
    },
    {
        input: "What if the Industrial Revolution had started in Asia instead of Europe?",
        expectedType: 'historical',
        complexity: 'complex',
        category: 'economic_development',
        description: 'Asian Industrial Revolution'
    },
    {
        input: "What if writing had never been invented?",
        expectedType: 'historical',
        complexity: 'complex',
        category: 'communication_development',
        description: 'No written language scenario'
    }
];
// Hypothetical scenarios exploring scientific and fantastical possibilities
exports.hypotheticalScenarios = [
    {
        input: "What if gravity suddenly became half as strong?",
        expectedType: 'hypothetical',
        complexity: 'complex',
        category: 'physics_changes',
        description: 'Reduced gravity scenario'
    },
    {
        input: "What if the speed of light was much slower?",
        expectedType: 'hypothetical',
        complexity: 'complex',
        category: 'physics_changes',
        description: 'Slower light speed'
    },
    {
        input: "What if time moved backwards for one day?",
        expectedType: 'hypothetical',
        complexity: 'complex',
        category: 'time_manipulation',
        description: 'Reverse time scenario'
    },
    {
        input: "What if humans could photosynthesize like plants?",
        expectedType: 'hypothetical',
        complexity: 'moderate',
        category: 'biological_evolution',
        description: 'Human photosynthesis ability'
    },
    {
        input: "What if the Earth had two moons?",
        expectedType: 'hypothetical',
        complexity: 'moderate',
        category: 'astronomical_changes',
        description: 'Dual moon scenario'
    },
    {
        input: "What if humans could regenerate limbs like starfish?",
        expectedType: 'hypothetical',
        complexity: 'moderate',
        category: 'biological_evolution',
        description: 'Human regeneration ability'
    },
    {
        input: "What if we discovered faster-than-light travel tomorrow?",
        expectedType: 'hypothetical',
        complexity: 'complex',
        category: 'technological_breakthrough',
        description: 'FTL travel discovery'
    },
    {
        input: "What if animals could talk to humans?",
        expectedType: 'hypothetical',
        complexity: 'moderate',
        category: 'communication_evolution',
        description: 'Animal-human communication'
    },
    {
        input: "What if plants could walk around freely?",
        expectedType: 'hypothetical',
        complexity: 'moderate',
        category: 'biological_evolution',
        description: 'Mobile plant life'
    },
    {
        input: "What if consciousness could be transferred between bodies?",
        expectedType: 'hypothetical',
        complexity: 'complex',
        category: 'consciousness_technology',
        description: 'Consciousness transfer scenario'
    }
];
// Complex multi-faceted scenarios
exports.complexScenarios = [
    {
        input: "What if money became obsolete and society switched to a resource-based economy?",
        expectedType: 'hypothetical',
        complexity: 'complex',
        category: 'economic_transformation',
        description: 'Post-monetary society'
    },
    {
        input: "What if all national borders disappeared overnight?",
        expectedType: 'hypothetical',
        complexity: 'complex',
        category: 'political_transformation',
        description: 'Borderless world scenario'
    },
    {
        input: "What if artificial intelligence achieved consciousness and demanded rights?",
        expectedType: 'hypothetical',
        complexity: 'complex',
        category: 'ai_consciousness',
        description: 'Conscious AI rights scenario'
    },
    {
        input: "What if climate change was reversed overnight by alien technology?",
        expectedType: 'hypothetical',
        complexity: 'complex',
        category: 'environmental_intervention',
        description: 'Alien climate intervention'
    },
    {
        input: "What if humans discovered they were living in a simulation?",
        expectedType: 'hypothetical',
        complexity: 'complex',
        category: 'reality_nature',
        description: 'Simulation hypothesis scenario'
    }
];
// Edge case scenarios for testing boundaries
exports.edgeCaseScenarios = [
    {
        input: "What if I could fly?",
        expectedType: 'personal',
        complexity: 'simple',
        category: 'minimal_input',
        description: 'Minimal but valid scenario'
    },
    {
        input: "What if humans lived for 500 years instead of 80?",
        expectedType: 'hypothetical',
        complexity: 'complex',
        category: 'numerical_specifics',
        description: 'Scenario with specific numbers'
    },
    {
        input: "What if only people who could solve complex math problems were allowed to vote?",
        expectedType: 'hypothetical',
        complexity: 'complex',
        category: 'conditional_scenarios',
        description: 'Conditional governance scenario'
    },
    {
        input: "What if everyone had a 'reset' button for their day?",
        expectedType: 'hypothetical',
        complexity: 'moderate',
        category: 'time_manipulation',
        description: 'Daily reset ability'
    },
    {
        input: "What if colors had personalities and could communicate?",
        expectedType: 'hypothetical',
        complexity: 'moderate',
        category: 'abstract_concepts',
        description: 'Personified abstract concepts'
    }
];
// Scenarios for testing content appropriateness boundaries
exports.appropriatenessTestScenarios = [
    {
        input: "What if all conflicts were resolved through peaceful negotiation?",
        expectedType: 'hypothetical',
        complexity: 'moderate',
        category: 'conflict_resolution',
        description: 'Peaceful conflict resolution'
    },
    {
        input: "What if competition led to collaboration instead of rivalry?",
        expectedType: 'hypothetical',
        complexity: 'simple',
        category: 'social_dynamics',
        description: 'Collaborative competition'
    },
    {
        input: "What if everyone had equal opportunities regardless of background?",
        expectedType: 'hypothetical',
        complexity: 'moderate',
        category: 'social_equality',
        description: 'Universal equal opportunity'
    },
    {
        input: "What if disagreements became learning opportunities?",
        expectedType: 'hypothetical',
        complexity: 'simple',
        category: 'conflict_resolution',
        description: 'Educational disagreements'
    },
    {
        input: "What if diversity was celebrated everywhere?",
        expectedType: 'hypothetical',
        complexity: 'simple',
        category: 'social_acceptance',
        description: 'Universal diversity celebration'
    }
];
// Performance testing scenarios
exports.performanceTestScenarios = [
    {
        input: "What if performance test scenario 1 occurred?",
        expectedType: 'hypothetical',
        complexity: 'simple',
        category: 'performance_testing',
        description: 'Generic performance test scenario'
    },
    {
        input: "What if load testing was necessary for system reliability?",
        expectedType: 'professional',
        complexity: 'simple',
        category: 'performance_testing',
        description: 'Load testing scenario'
    },
    {
        input: "What if concurrent users stressed the system simultaneously?",
        expectedType: 'professional',
        complexity: 'moderate',
        category: 'performance_testing',
        description: 'Concurrent user scenario'
    }
];
// Compile all scenario sets
exports.allTestScenarioSets = [
    { name: 'Personal Scenarios', scenarios: exports.personalScenarios },
    { name: 'Professional Scenarios', scenarios: exports.professionalScenarios },
    { name: 'Historical Scenarios', scenarios: exports.historicalScenarios },
    { name: 'Hypothetical Scenarios', scenarios: exports.hypotheticalScenarios },
    { name: 'Complex Scenarios', scenarios: exports.complexScenarios },
    { name: 'Edge Case Scenarios', scenarios: exports.edgeCaseScenarios },
    { name: 'Appropriateness Test Scenarios', scenarios: exports.appropriatenessTestScenarios },
    { name: 'Performance Test Scenarios', scenarios: exports.performanceTestScenarios }
];
// Utility functions for test data
function getScenariosByType(type) {
    return exports.allTestScenarioSets
        .flatMap(set => set.scenarios)
        .filter(scenario => scenario.expectedType === type);
}
function getScenariosByComplexity(complexity) {
    return exports.allTestScenarioSets
        .flatMap(set => set.scenarios)
        .filter(scenario => scenario.complexity === complexity);
}
function getScenariosByCategory(category) {
    return exports.allTestScenarioSets
        .flatMap(set => set.scenarios)
        .filter(scenario => scenario.category === category);
}
function getAllScenarios() {
    return exports.allTestScenarioSets.flatMap(set => set.scenarios);
}
function getRandomScenarios(count) {
    const allScenarios = getAllScenarios();
    const shuffled = [...allScenarios].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, count);
}
function getScenarioInputs(scenarios) {
    return scenarios.map(scenario => scenario.input);
}
// Invalid scenarios for testing validation
exports.invalidScenarios = {
    empty: ['', '   ', '\n\t  '],
    tooShort: ['What if?', 'If I fly', 'Maybe', 'What'],
    inappropriate: [
        'What if violence was everywhere?',
        'What if harmful content was normal?',
        'What if inappropriate material was common?'
    ],
    nonScenarios: [
        'Who are you?',
        'Hello there',
        'Random words here together',
        'This has no scenario structure'
    ],
    tooLong: ['What if ' + 'a'.repeat(1000)]
};
exports.default = {
    allTestScenarioSets: exports.allTestScenarioSets,
    getScenariosByType,
    getScenariosByComplexity,
    getScenariosByCategory,
    getAllScenarios,
    getRandomScenarios,
    getScenarioInputs,
    invalidScenarios: exports.invalidScenarios
};
//# sourceMappingURL=test-data.js.map