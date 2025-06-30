// Legacy service - now redirects to EnhancedAIService
import { EnhancedAIService } from './enhancedAI';

interface AIContext {
  childAge?: string;
  urgency: 'low' | 'medium' | 'high';
  category: string;
  hasWebSearch?: boolean;
  isOnlineMode?: boolean;
}

export class CustomAIService {
  static async generateParentingResponse(
    question: string,
    context: AIContext
  ): Promise<{ response: string; category: string; hasWebSearch: boolean; isOnlineResponse: boolean }> {
    return EnhancedAIService.generateParentingResponse(question, context);
  }

  static categorizeQuestion(question: string): string {
    return EnhancedAIService.categorizeQuestion(question);
  }
  
  static determineUrgency(question: string): 'low' | 'medium' | 'high' {
    return EnhancedAIService.determineUrgency(question);
  }
  
  static extractChildAge(question: string): string | undefined {
    return EnhancedAIService.extractChildAge(question);
  }
}