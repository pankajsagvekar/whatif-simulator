import { WhatIfSimulator } from '../../services/WhatIfSimulator';
import { InputValidator } from '../../services/InputValidator';
import { FormattedOutput, ValidationResult } from '../../models/interfaces';

/**
 * Service class that bridges React UI with the existing WhatIfSimulator backend
 */
export class ReactWhatIfService {
  private simulator: WhatIfSimulator;
  private validator: InputValidator;

  constructor() {
    this.simulator = new WhatIfSimulator();
    this.validator = new InputValidator();
  }

  /**
   * Process a scenario and return formatted results for React UI
   */
  async processScenario(scenario: string): Promise<{
    seriousVersion: string;
    funVersion: string;
    processingTime: number;
  }> {
    try {
      const startTime = Date.now();
      const result: FormattedOutput = await this.simulator.processScenario(scenario);
      const processingTime = Date.now() - startTime;

      return {
        seriousVersion: result.seriousVersion,
        funVersion: result.funVersion,
        processingTime,
      };
    } catch (error) {
      console.error('Error processing scenario:', error);
      throw new Error('Failed to process scenario. Please try again.');
    }
  }

  /**
   * Validate input before processing using the proper InputValidator
   */
  validateInput(input: string): { isValid: boolean; message?: string; sanitizedInput?: string } {
    const validationResult: ValidationResult = this.validator.validateScenario(input);
    
    return {
      isValid: validationResult.isValid,
      message: validationResult.errorMessage,
      sanitizedInput: validationResult.sanitizedInput
    };
  }
}