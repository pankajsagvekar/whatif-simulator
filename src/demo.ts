#!/usr/bin/env node

import { InputValidator } from './services/InputValidator';
import { OutputFormatter } from './services/OutputFormatter';
import { ProcessedScenario } from './models/interfaces';

/**
 * Demo script to showcase the InputValidator functionality
 */
function runDemo() {
  console.log('🚀 What If Simulator - InputValidator Demo\n');
  
  const validator = new InputValidator();
  
  // Test scenarios to demonstrate validation
  const testScenarios = [
    // Valid scenarios
    'What if everyone could fly?',
    'What if robots took over all jobs?',
    'Everyone could teleport instantly',
    'The internet suddenly disappeared forever',
    
    // Invalid scenarios
    '',
    'Hi there',
    'What if?',
    'What if I could kill everyone?',
    'Random words here together',
    'Who are you?'
  ];
  
  console.log('Testing various scenarios:\n');
  
  testScenarios.forEach((scenario, index) => {
    console.log(`${index + 1}. Testing: "${scenario}"`);
    const result = validator.validateScenario(scenario);
    
    if (result.isValid) {
      console.log('   ✅ Valid scenario');
      console.log(`   📝 Sanitized: "${result.sanitizedInput}"`);
    } else {
      console.log('   ❌ Invalid scenario');
      console.log(`   💬 Error: ${result.errorMessage}`);
    }
    console.log('');
  });
  
  console.log('🎯 InputValidator demo completed!\n');
  
  // OutputFormatter Demo
  console.log('🎨 OutputFormatter Demo\n');
  
  const formatter = new OutputFormatter();
  
  // Mock scenario for demonstration
  const mockScenario: ProcessedScenario = {
    originalText: 'What if everyone could fly?',
    scenarioType: 'hypothetical',
    keyElements: {
      actors: ['everyone'],
      actions: ['fly'],
      context: 'universal human ability'
    },
    complexity: 'moderate'
  };
  
  // Mock outcomes
  const seriousOutcome = `Flying would fundamentally transform human society and infrastructure. Therefore, we would need to redesign cities with vertical transportation in mind. However, the energy requirements would be enormous, requiring significant biological adaptations. Additionally, air traffic control systems would need complete overhaul to manage millions of flying humans safely.`;
  
  const funOutcome = `Everyone becomes a human airplane! Traffic jams would move to the sky, and we'd have flying traffic cops with jetpacks! Birds would start a union demanding equal airspace rights!! Weather forecasts would include "human migration patterns" and umbrellas would become obsolete!!!`;
  
  // Format the results
  const formattedOutput = formatter.formatResults(seriousOutcome, funOutcome, mockScenario, 1250);
  
  // Create presentation
  const presentation = formatter.createPresentationOutput(formattedOutput);
  
  console.log('📋 Formatted Output Example:');
  console.log('─'.repeat(80));
  console.log(presentation);
  console.log('─'.repeat(80));
  
  // Validate outcomes
  const isValid = formatter.validateOutcomes(seriousOutcome, funOutcome);
  console.log(`\n✅ Outcomes validation: ${isValid ? 'PASSED' : 'FAILED'}`);
  
  console.log('\n🎯 OutputFormatter demo completed!');
  console.log('📋 The formatter provides clear, structured dual outcomes with consistent presentation.');
}

// Run the demo
runDemo();