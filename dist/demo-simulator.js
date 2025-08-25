"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DemoAIService = void 0;
exports.runDemo = runDemo;
const WhatIfSimulator_js_1 = require("./services/WhatIfSimulator.js");
/**
 * Demo AI Service implementation for testing the WhatIfSimulator
 * In a real application, this would integrate with actual AI services like OpenAI, Anthropic, etc.
 */
class DemoAIService {
    async generateResponse(prompt) {
        // Simulate AI processing delay
        await new Promise(resolve => setTimeout(resolve, 500));
        // Extract scenario from prompt for more specific responses
        const scenarioMatch = prompt.match(/Scenario: "([^"]+)"/);
        const scenario = scenarioMatch ? scenarioMatch[1].toLowerCase() : prompt.toLowerCase();
        // Generate different responses based on prompt content
        if (prompt.toLowerCase().includes('serious') || prompt.toLowerCase().includes('realistic')) {
            return this.generateSeriousResponse(scenario);
        }
        else {
            return this.generateFunResponse(scenario);
        }
    }
    generateSeriousResponse(scenario) {
        if (scenario.includes('read minds')) {
            return `**Realistic Analysis:**

Mind reading would fundamentally transform human society:

**Immediate Effects:**
- Complete breakdown of privacy as we know it
- Massive psychological adjustment period with increased anxiety and stress
- Collapse of many professions dependent on information asymmetry (poker, negotiation, therapy)

**Secondary Effects:**
- Development of "mental shields" or meditation techniques to protect thoughts
- New legal frameworks around mental privacy rights
- Radical changes in relationships, politics, and business practices

**Long-term Implications:**
- Potential for unprecedented empathy and understanding between people
- Elimination of many forms of deception and corruption
- New social hierarchies based on mental discipline and clarity

The transition period would be chaotic, but humanity might emerge more honest and connected.`;
        }
        else if (scenario.includes('4-day work week')) {
            return `**Realistic Analysis:**

A universal 4-day work week would reshape the global economy:

**Immediate Effects:**
- Initial productivity concerns and adjustment challenges for businesses
- Increased employee satisfaction and work-life balance
- Potential wage adjustments and hiring pattern changes

**Secondary Effects:**
- Boost to leisure and service industries as people have more free time
- Reduced commuting leading to environmental benefits
- Possible competitive advantages for early-adopting countries

**Long-term Implications:**
- Improved mental health and reduced burnout across populations
- Shift toward automation and efficiency-focused business models
- Potential for increased creativity and entrepreneurship with more personal time

Evidence from pilot programs suggests productivity often remains stable or improves.`;
        }
        else if (scenario.includes('gravity')) {
            return `**Realistic Analysis:**

Halving Earth's gravity would cause catastrophic changes:

**Immediate Effects:**
- Massive structural failures as buildings and infrastructure collapse
- Atmospheric expansion leading to breathing difficulties at current altitudes
- Disruption of all transportation systems and industrial processes

**Secondary Effects:**
- Ocean redistribution and extreme weather pattern changes
- Biological stress on all life forms adapted to current gravity
- Complete redesign needed for all human-made systems

**Long-term Implications:**
- Potential for humans to develop enhanced jumping and movement abilities
- Fundamental changes to sports, architecture, and daily activities
- Possible evolutionary adaptations over many generations

This would be an extinction-level event requiring immediate global cooperation for survival.`;
        }
        else if (scenario.includes('napoleon') || scenario.includes('waterloo')) {
            return `**Realistic Analysis:**

Napoleon's victory at Waterloo would have reshaped European history:

**Immediate Effects:**
- Continuation of the Napoleonic Empire and French dominance in Europe
- Delayed or prevented formation of the German Confederation
- Extended period of warfare as other European powers regroup

**Secondary Effects:**
- Different colonial expansion patterns, particularly affecting British Empire
- Alternative development of nationalism and liberalism across Europe
- Changed timeline for industrial and social revolutions

**Long-term Implications:**
- Possible French-dominated European union centuries before the EU
- Different patterns of American development without British naval supremacy
- Alternative paths for democratic and constitutional development

The ripple effects would have fundamentally altered the course of the 19th and 20th centuries.`;
        }
        else {
            return `**Realistic Analysis:**

This scenario would likely result in several interconnected consequences:

**Immediate Effects:**
- Initial adaptation period as people adjust to the new reality
- Changes in social dynamics and communication patterns
- Potential disruption to existing systems and processes

**Secondary Effects:**
- Economic implications as markets and industries adapt
- Social and cultural shifts in behavior and expectations
- Technological or infrastructural changes to support the new reality

**Long-term Implications:**
- Establishment of new norms and social structures
- Potential benefits including increased efficiency or improved quality of life
- Possible challenges requiring ongoing management and adaptation

The overall impact would depend heavily on implementation approach, public acceptance, and supporting infrastructure development.`;
        }
    }
    generateFunResponse(scenario) {
        if (scenario.includes('read minds')) {
            return `**Creative Interpretation:**

Welcome to the world's most awkward superpower! 🧠✨

**The Immediate Chaos:**
Everyone suddenly gains telepathy, but nobody gets an instruction manual! Picture the chaos: people accidentally broadcasting their grocery lists during important meetings, and discovering that their cat has been plotting world domination all along.

**The Hilarious Consequences:**
- Restaurants become incredibly efficient because waiters know exactly what you want before you do
- Dating becomes either incredibly easy or impossibly complicated
- Politicians have to wear special "thought-scrambling" helmets that make them think only about puppies and rainbows

**The Magical Resolution:**
Society adapts by developing "mental etiquette" classes where people learn to think in different "channels" like radio stations. The world becomes more honest, but also discovers that most people's thoughts are just "Did I leave the stove on?" and random song lyrics on repeat!

*And everyone lived telepathically ever after!* 🎭`;
        }
        else if (scenario.includes('4-day work week')) {
            return `**Creative Interpretation:**

The Great Work Week Revolution has begun! 📅✨

**The Immediate Chaos:**
Companies panic about productivity while employees celebrate by doing victory dances in the streets. Office supply stores mysteriously run out of "TGIF" mugs as people struggle to figure out what day it actually is.

**The Delightful Consequences:**
- Mondays become slightly less terrible, but Tuesdays become the new villain
- Coffee shops experience a mysterious boom on the new "weekend" day
- Pets are confused by their humans being home an extra day and stage interventions

**The Wonderful Resolution:**
People discover they're actually more productive when well-rested, leading to a golden age of innovation. The extra day becomes known as "Funday," dedicated entirely to pursuing hobbies, napping, and perfecting the art of doing absolutely nothing productive.

*And they all worked happily ever after!* 🎉`;
        }
        else if (scenario.includes('gravity')) {
            return `**Creative Interpretation:**

Welcome to Bouncy Earth! 🌍🦘

**The Immediate Chaos:**
Everyone suddenly becomes part kangaroo! People bounce to work, cats achieve their dreams of flying, and basketball becomes the most dangerous sport in the world as players accidentally launch themselves into orbit.

**The Bouncy Consequences:**
- Trampolines become the primary mode of transportation
- Architecture gets really weird as buildings need to be designed for people who might accidentally jump through the roof
- Dogs are absolutely thrilled because every walk becomes an adventure in low-gravity parkour

**The Springy Resolution:**
Humanity adapts by developing "gravity boots" for when they need to stay grounded and "bounce suits" for maximum fun. The Olympics become infinitely more entertaining, and "floor is lava" becomes a legitimate extreme sport.

*And they all bounced happily ever after!* 🚀`;
        }
        else if (scenario.includes('napoleon') || scenario.includes('waterloo')) {
            return `**Creative Interpretation:**

Napoleon's Alternate Victory Tour! 👑⚔️

**The Immediate Chaos:**
Napoleon celebrates by commissioning even MORE portraits of himself, this time riding a unicorn. Europe becomes one giant French café where everyone is required to appreciate fine wine and debate philosophy while wearing fabulous hats.

**The Magnifique Consequences:**
- The metric system spreads even faster, causing mass confusion in Britain
- Croissants become the international currency
- Everyone develops a mysterious ability to gesture dramatically while speaking

**The Très Bien Resolution:**
The world becomes a more stylish place where dueling with baguettes is considered high art, and every international treaty must be signed with a fancy quill pen while wearing a cape. History books become much more entertaining to read.

*Et ils vécurent tous heureux pour toujours!* 🥐`;
        }
        else {
            return `**Creative Interpretation:**

Oh my, what a delightfully absurd world this would create! 🎭

**The Immediate Chaos:**
Picture this: everyone suddenly develops the ability, but nobody knows how to control it properly! There would be hilarious mishaps everywhere - people accidentally reading their boss's thoughts about lunch instead of the important meeting agenda.

**The Unexpected Consequences:**
- Pets would finally get their revenge by broadcasting their true opinions about their owners' fashion choices
- Politicians would have to wear special "thought-blocking" hats made of tinfoil (which becomes the hottest fashion trend)
- Dating apps would become obsolete because people could just think-swipe through potential matches

**The Magical Resolution:**
Eventually, society would adapt by developing "mental etiquette" classes in schools, and we'd discover that most people's thoughts are actually just wondering what to have for dinner or humming random songs. The world becomes more empathetic and understanding, with the occasional burst of laughter when someone's inner monologue gets a bit too silly!

*And they all lived thoughtfully ever after!* ✨`;
        }
    }
}
exports.DemoAIService = DemoAIService;
/**
 * Demo function showing how to use the WhatIfSimulator
 */
async function runDemo() {
    console.log('🎭 What If Simulator Demo\n');
    // Create AI service and simulator
    const aiService = new DemoAIService();
    const simulator = new WhatIfSimulator_js_1.WhatIfSimulator(aiService, {
        enableLogging: true,
        enableMetrics: true,
        enableParallelGeneration: true
    });
    // Demo scenarios
    const scenarios = [
        "What if everyone could read minds?",
        "What if companies switched to a 4-day work week?",
        "What if gravity was half as strong?",
        "What if Napoleon had won at Waterloo?"
    ];
    for (const scenario of scenarios) {
        console.log(`\n${'='.repeat(60)}`);
        console.log(`🤔 Scenario: ${scenario}`);
        console.log(`${'='.repeat(60)}\n`);
        try {
            const result = await simulator.processScenario(scenario);
            if (result.success) {
                console.log(result.presentationOutput);
                if (result.metrics) {
                    console.log(`\n📊 Processing Metrics:`);
                    console.log(`   Total Time: ${result.metrics.totalProcessingTime}ms`);
                    console.log(`   Validation: ${result.metrics.validationTime}ms`);
                    console.log(`   Processing: ${result.metrics.processingTime}ms`);
                    console.log(`   Serious Generation: ${result.metrics.seriousGenerationTime}ms`);
                    console.log(`   Fun Generation: ${result.metrics.funGenerationTime}ms`);
                    console.log(`   Formatting: ${result.metrics.formattingTime}ms`);
                    console.log(`   Scenario Type: ${result.formattedOutput?.metadata.scenarioType || 'unknown'}`);
                }
            }
            else {
                console.log(`❌ Error: ${result.error}`);
            }
        }
        catch (error) {
            console.log(`💥 Unexpected error: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
        // Add delay between scenarios for better readability
        await new Promise(resolve => setTimeout(resolve, 1000));
    }
    console.log(`\n${'='.repeat(60)}`);
    console.log('✨ Demo completed! Thanks for exploring the What If Simulator!');
    console.log(`${'='.repeat(60)}\n`);
}
// Run the demo if this file is executed directly
// Check if this module is being run directly (not imported)
const isMainModule = process.argv[1] && process.argv[1].endsWith('demo-simulator.js');
if (isMainModule) {
    runDemo().catch(console.error);
}
//# sourceMappingURL=demo-simulator.js.map