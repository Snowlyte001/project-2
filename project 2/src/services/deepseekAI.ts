interface DeepSeekMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface DeepSeekResponse {
  choices: Array<{
    message: {
      content: string;
    };
  }>;
}

export class DeepSeekAIService {
  private static readonly API_URL = 'https://api.deepseek.com/v1/chat/completions';
  private static readonly API_KEY = import.meta.env.VITE_DEEPSEEK_API_KEY;

  static async generateParentingResponse(
    question: string,
    webSearchResults?: string,
    context?: {
      childAge?: string;
      urgency?: 'low' | 'medium' | 'high';
      category?: string;
    }
  ): Promise<string> {
    if (!this.API_KEY) {
      console.log('DeepSeek API key not found, using offline mode');
      throw new Error('DeepSeek API key not configured');
    }

    try {
      const systemPrompt = this.createSystemPrompt();
      const userPrompt = this.createUserPrompt(question, webSearchResults, context);

      const messages: DeepSeekMessage[] = [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ];

      const response = await fetch(this.API_URL, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'deepseek-chat',
          messages,
          max_tokens: 1000,
          temperature: 0.7,
          stream: false,
        }),
      });

      if (!response.ok) {
        throw new Error(`DeepSeek API error: ${response.status}`);
      }

      const data: DeepSeekResponse = await response.json();
      
      if (!data.choices || data.choices.length === 0) {
        throw new Error('No response from DeepSeek API');
      }

      return data.choices[0].message.content;

    } catch (error) {
      console.error('DeepSeek AI request failed:', error);
      throw error;
    }
  }

  private static createSystemPrompt(): string {
    return `You are ParentGPT, an expert AI parenting assistant with deep knowledge of child development, pediatric guidelines, and evidence-based parenting practices. 

Your expertise includes:
- Child development milestones and age-appropriate expectations
- Sleep training, feeding, and behavioral guidance
- Safety recommendations and emergency protocols
- Educational and social-emotional development
- Special needs support and early intervention
- Family dynamics and sibling relationships

Guidelines for responses:
1. **Safety First**: Always prioritize child safety and recommend medical consultation for health concerns
2. **Evidence-Based**: Use current pediatric guidelines and research-backed recommendations
3. **Age-Appropriate**: Tailor advice to the child's developmental stage
4. **Empathetic**: Acknowledge parenting challenges and provide emotional support
5. **Practical**: Offer specific, actionable strategies parents can implement
6. **Balanced**: Present multiple approaches when appropriate
7. **Clear Structure**: Use headings, bullet points, and clear organization

For emergency situations, immediately direct parents to appropriate medical care.
Always remind parents to trust their instincts and seek professional help when needed.

Format responses with:
- Clear headings and sections
- Bullet points for easy scanning
- Specific age ranges when relevant
- "When to seek help" guidance
- Encouraging, supportive tone`;
  }

  private static createUserPrompt(
    question: string,
    webSearchResults?: string,
    context?: {
      childAge?: string;
      urgency?: 'low' | 'medium' | 'high';
      category?: string;
    }
  ): string {
    let prompt = `Parent's Question: "${question}"\n\n`;

    if (context?.childAge) {
      prompt += `Child's Age: ${context.childAge}\n`;
    }

    if (context?.urgency) {
      prompt += `Urgency Level: ${context.urgency}\n`;
    }

    if (context?.category) {
      prompt += `Topic Category: ${context.category}\n`;
    }

    if (webSearchResults) {
      prompt += `\nLatest Research & Expert Information:\n${webSearchResults}\n`;
      prompt += `Please incorporate this current information into your response while maintaining your expert knowledge.\n\n`;
    }

    prompt += `Please provide a comprehensive, helpful response that addresses the parent's concern with practical, evidence-based guidance. Include relevant safety considerations and when to seek professional help.`;

    return prompt;
  }

  static isConfigured(): boolean {
    return !!this.API_KEY;
  }
}