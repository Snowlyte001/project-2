import { WebSearchService } from './webSearch';
import { OfflineKnowledgeBase } from './offlineKnowledge';

interface AIProvider {
  name: string;
  apiKey: string | undefined;
  endpoint: string;
  model: string;
  maxTokens: number;
  temperature: number;
  priority: number; // Higher priority = preferred provider
}

interface AIContext {
  childAge?: string;
  urgency: 'low' | 'medium' | 'high';
  category: string;
  hasWebSearch?: boolean;
  isOnlineMode?: boolean;
  conversationHistory?: Array<{ role: 'user' | 'assistant'; content: string }>;
  parentProfile?: {
    experienceLevel: string;
    primaryConcerns: string[];
    supportNetwork: string;
  };
}

interface AIResponse {
  response: string;
  category: string;
  hasWebSearch: boolean;
  isOnlineResponse: boolean;
  provider?: string;
  confidence: number;
  reasoning?: string;
}

export class EnhancedAIService {
  private static providers: AIProvider[] = [
    {
      name: 'OpenAI',
      apiKey: import.meta.env.VITE_OPENAI_API_KEY,
      endpoint: 'https://api.openai.com/v1/chat/completions',
      model: 'gpt-3.5-turbo',
      maxTokens: 1000,
      temperature: 0.7,
      priority: 10 // Highest priority for general AI
    }
  ];

  private static conversationMemory: Map<string, Array<{ role: 'user' | 'assistant'; content: string; timestamp: number }>> = new Map();

  static async generateParentingResponse(
    question: string,
    context: AIContext
  ): Promise<AIResponse> {
    
    // Enhanced question analysis
    const questionAnalysis = this.analyzeQuestion(question, context);
    
    // Check if this is a greeting or casual conversation
    if (questionAnalysis.type === 'greeting') {
      return this.handleGreeting();
    }

    if (questionAnalysis.type === 'casual') {
      return this.handleCasualConversation(question);
    }
    
    // Get best available AI provider based on question complexity
    const selectedProvider = this.selectBestProvider(questionAnalysis);
    const canUseWebSearch = !!import.meta.env.VITE_SERPER_API_KEY;
    const isOnlineMode = !!selectedProvider || canUseWebSearch;
    
    let finalResponse = '';
    let hasWebSearch = false;
    let webSearchResults = '';
    let usedProvider = '';
    let confidence = 0.7;
    let reasoning = '';
    
    try {
      // Step 1: Enhanced web search with intelligent query optimization
      if (canUseWebSearch && this.shouldUseWebSearch(questionAnalysis)) {
        console.log('🔍 Performing intelligent web search...');
        const optimizedQuery = this.optimizeSearchQuery(question, context);
        const searchData = await WebSearchService.searchParentingInfo(optimizedQuery);
        
        if (searchData.hasResults) {
          webSearchResults = WebSearchService.formatSearchResults(searchData.results, searchData.summary);
          hasWebSearch = true;
          console.log('✅ Enhanced web search completed with relevant results');
        }
      }
      
      // Step 2: Generate AI response with enhanced context
      if (selectedProvider) {
        console.log(`🧠 Generating response with ${selectedProvider.name}...`);
        try {
          const enhancedContext = this.buildEnhancedContext(question, context, webSearchResults);
          const aiResult = await this.callAIProvider(selectedProvider, enhancedContext);
          
          finalResponse = aiResult.response;
          confidence = aiResult.confidence;
          reasoning = aiResult.reasoning;
          usedProvider = selectedProvider.name;
          
          console.log(`✅ Response generated with ${selectedProvider.name} (Confidence: ${confidence})`);
        } catch (aiError) {
          console.error(`${selectedProvider.name} failed, using offline mode:`, aiError);
          finalResponse = this.generateEnhancedOfflineResponse(question, webSearchResults);
          confidence = 0.6;
        }
      } else if (hasWebSearch) {
        // Enhanced offline mode with web search
        console.log('📚 Generating offline response with web research...');
        finalResponse = this.generateEnhancedOfflineResponse(question, webSearchResults);
        confidence = 0.7;
      } else {
        // Pure enhanced offline mode
        console.log('📚 Using offline intelligence...');
        finalResponse = this.generateEnhancedOfflineResponse(question, '');
        confidence = 0.6;
      }
      
      // Store conversation for context
      this.storeConversationContext(question, finalResponse);
      
    } catch (error) {
      console.error('AI processing failed, using fallback:', error);
      finalResponse = this.generateEnhancedOfflineResponse(question, '');
      confidence = 0.5;
    }
    
    return {
      response: finalResponse,
      category: questionAnalysis.category,
      hasWebSearch,
      isOnlineResponse: isOnlineMode,
      provider: usedProvider,
      confidence,
      reasoning
    };
  }

  private static analyzeQuestion(question: string, context: AIContext) {
    const lowerQuestion = question.toLowerCase().trim();
    
    // Enhanced question classification
    const questionTypes = {
      greeting: this.isGreeting(question),
      casual: this.isCasualConversation(question),
      emergency: this.isEmergencyQuestion(lowerQuestion),
      complex: this.isComplexQuestion(lowerQuestion),
      factual: this.isFactualQuestion(lowerQuestion),
      emotional: this.isEmotionalQuestion(lowerQuestion)
    };

    const type = Object.entries(questionTypes).find(([_, isType]) => isType)?.[0] || 'general';
    
    return {
      type,
      complexity: this.assessComplexity(lowerQuestion),
      emotionalTone: this.detectEmotionalTone(lowerQuestion),
      category: this.categorizeQuestion(question),
      urgency: this.determineUrgency(question),
      childAge: this.extractChildAge(question),
      requiresEmpathy: questionTypes.emotional || context.urgency === 'high',
      requiresFactualAccuracy: questionTypes.factual || questionTypes.emergency
    };
  }

  private static selectBestProvider(questionAnalysis: any): AIProvider | null {
    const availableProviders = this.providers
      .filter(provider => provider.apiKey)
      .sort((a, b) => b.priority - a.priority);

    if (availableProviders.length === 0) return null;

    // Select provider based on question characteristics
    if (questionAnalysis.requiresEmpathy || questionAnalysis.emotionalTone === 'distressed') {
      // Prefer Claude for empathetic responses
      return availableProviders.find(p => p.name === 'Anthropic Claude') || availableProviders[0];
    }

    if (questionAnalysis.complexity === 'high' || questionAnalysis.requiresFactualAccuracy) {
      // Prefer DeepSeek for complex reasoning
      return availableProviders.find(p => p.name === 'DeepSeek') || availableProviders[0];
    }

    if (questionAnalysis.urgency === 'high') {
      // Prefer Groq for fast responses
      return availableProviders.find(p => p.name === 'Groq') || availableProviders[0];
    }

    // Default to highest priority available
    return availableProviders[0];
  }

  private static buildEnhancedContext(question: string, context: AIContext, webSearchResults?: string) {
    const conversationHistory = this.getRecentConversationHistory();
    
    return {
      question,
      context: {
        ...context,
        conversationHistory,
        webSearchResults,
        timestamp: new Date().toISOString(),
        sessionContext: this.buildSessionContext()
      }
    };
  }

  private static async callAIProvider(provider: AIProvider, enhancedContext: any): Promise<{ response: string; confidence: number; reasoning: string }> {
    const systemPrompt = this.createConciseParentingSystemPrompt();
    const userPrompt = this.createConciseUserPrompt(enhancedContext);

    let response: string;
    
    if (provider.name === 'Anthropic Claude') {
      response = await this.callAnthropicClaude(provider, systemPrompt, userPrompt);
    } else {
      response = await this.callOpenAICompatible(provider, systemPrompt, userPrompt);
    }

    // Clean up response to remove unnecessary AI jargon
    response = this.cleanResponse(response);

    // Analyze response quality
    const confidence = this.assessResponseConfidence(response, enhancedContext);
    const reasoning = this.generateReasoning(enhancedContext, provider);

    return { response, confidence, reasoning };
  }

  private static cleanResponse(response: string): string {
    // Remove unnecessary AI analysis sections and jargon
    const cleanedResponse = response
      // Remove AI insights sections
      .replace(/🎯\s*\*\*AI Insights:\*\*[\s\S]*?(?=\n\n|\n$|$)/gi, '')
      .replace(/🧠\s*\*\*Advanced AI Analysis\*\*[\s\S]*?(?=\n\n|\n$|$)/gi, '')
      .replace(/📈\s*\*\*AI Pattern Recognition:.*?\*\*[\s\S]*?(?=\n\n|\n$|$)/gi, '')
      .replace(/🔬\s*\*\*Evidence-Based Intelligence\*\*[\s\S]*?(?=\n\n|\n$|$)/gi, '')
      .replace(/💡\s*\*\*Cognitive Processing Framework\*\*[\s\S]*?(?=\n\n|\n$|$)/gi, '')
      
      // Remove technical analysis headers
      .replace(/\*\*🧠 INTELLIGENT.*?\*\*/gi, '')
      .replace(/\*\*📈 AI Pattern Recognition.*?\*\*/gi, '')
      .replace(/### Additional Context ###/gi, '')
      
      // Remove meta-commentary about AI capabilities
      .replace(/This guidance combines evidence-based practices with advanced AI analysis/gi, '')
      .replace(/Recommendations are personalized based on your specific situation/gi, '')
      .replace(/Multiple factors have been considered for comprehensive support/gi, '')
      .replace(/\*\*Priority response\*\* due to urgency level detected/gi, '')
      
      // Clean up excessive formatting
      .replace(/\n{3,}/g, '\n\n')
      .replace(/^\s*[\*\-•]\s*/gm, '• ')
      
      // Remove redundant headers
      .replace(/^\*\*Enhanced with Latest Research & AI Analysis\*\*\n\n/gm, '')
      .replace(/^\*\*Advanced AI Analysis\*\*\n\n/gm, '')
      
      .trim();

    return cleanedResponse;
  }

  private static async callAnthropicClaude(provider: AIProvider, systemPrompt: string, userPrompt: string): Promise<string> {
    const response = await fetch(provider.endpoint, {
      method: 'POST',
      headers: {
        'x-api-key': provider.apiKey!,
        'Content-Type': 'application/json',
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: provider.model,
        max_tokens: provider.maxTokens,
        temperature: provider.temperature,
        system: systemPrompt,
        messages: [
          { role: 'user', content: userPrompt }
        ]
      })
    });

    if (!response.ok) {
      throw new Error(`Anthropic API error: ${response.status}`);
    }

    const data = await response.json();
    return data.content[0].text;
  }

  private static async callOpenAICompatible(provider: AIProvider, systemPrompt: string, userPrompt: string): Promise<string> {
    const response = await fetch(provider.endpoint, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${provider.apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: provider.model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        max_tokens: provider.maxTokens,
        temperature: provider.temperature,
        stream: false
      })
    });

    if (!response.ok) {
      throw new Error(`${provider.name} API error: ${response.status}`);
    }

    const data = await response.json();
    return data.choices[0].message.content;
  }

  private static createConciseParentingSystemPrompt(): string {
    return `You are ParentGPT, a helpful AI parenting assistant. Provide practical, evidence-based parenting advice in a warm, supportive tone.

RESPONSE GUIDELINES:
- Be concise and directly helpful (aim for 200-400 words)
- Focus on actionable advice parents can use immediately
- Use simple, clear language without technical jargon
- Structure responses with clear headings and bullet points
- Always prioritize child safety and wellbeing
- Acknowledge when professional help is needed

AVOID:
- Long technical explanations about AI analysis
- Meta-commentary about your capabilities
- Excessive formatting or complex structures
- Redundant information or filler content

For emergency situations, provide immediate safety guidance and direct to appropriate help.
For general questions, give practical strategies with brief explanations.
Always be empathetic and supportive while staying focused and helpful.`;
  }

  private static createConciseUserPrompt(enhancedContext: any): string {
    const { question, context } = enhancedContext;
    
    let prompt = `Parent's Question: "${question}"\n\n`;

    // Add essential context only
    if (context.childAge) {
      prompt += `Child's Age: ${context.childAge}\n`;
    }

    if (context.urgency && context.urgency !== 'low') {
      prompt += `Urgency: ${context.urgency}\n`;
    }

    // Add web search results if available
    if (context.webSearchResults) {
      prompt += `\nLatest Research:\n${context.webSearchResults}\n`;
    }

    prompt += `\nProvide helpful, practical parenting advice. Be concise, supportive, and focus on actionable solutions.`;

    return prompt;
  }

  // Enhanced helper methods
  private static isComplexQuestion(question: string): boolean {
    const complexityIndicators = [
      'multiple', 'several', 'different', 'various', 'complex', 'complicated',
      'relationship', 'balance', 'manage', 'handle', 'deal with', 'struggle',
      'both', 'either', 'neither', 'however', 'although', 'despite'
    ];
    return complexityIndicators.some(indicator => question.includes(indicator));
  }

  private static isFactualQuestion(question: string): boolean {
    const factualIndicators = [
      'what is', 'how much', 'how many', 'when should', 'what age',
      'normal', 'typical', 'average', 'recommended', 'guidelines',
      'research', 'studies', 'evidence', 'facts', 'statistics'
    ];
    return factualIndicators.some(indicator => question.includes(indicator));
  }

  private static isEmotionalQuestion(question: string): boolean {
    const emotionalIndicators = [
      'worried', 'concerned', 'anxious', 'stressed', 'overwhelmed',
      'frustrated', 'upset', 'scared', 'afraid', 'confused',
      'feel', 'feeling', 'emotion', 'cry', 'crying', 'difficult'
    ];
    return emotionalIndicators.some(indicator => question.includes(indicator));
  }

  private static isEmergencyQuestion(question: string): boolean {
    const emergencyKeywords = [
      'emergency', 'urgent', 'help', 'dangerous', 'hurt', 'bleeding', 'choking',
      'can\'t breathe', 'difficulty breathing', 'unconscious', 'severe pain',
      'high fever', 'dehydrated', 'allergic reaction', 'poisoned', 'swallowed'
    ];
    return emergencyKeywords.some(keyword => question.includes(keyword));
  }

  private static assessComplexity(question: string): 'low' | 'medium' | 'high' {
    let complexityScore = 0;
    
    // Length factor
    if (question.length > 100) complexityScore += 1;
    if (question.length > 200) complexityScore += 1;
    
    // Multiple questions
    if (question.includes('?') && question.split('?').length > 2) complexityScore += 1;
    
    // Complex concepts
    if (this.isComplexQuestion(question)) complexityScore += 1;
    
    // Multiple topics
    const topics = ['sleep', 'behavior', 'feeding', 'development', 'health'];
    const topicCount = topics.filter(topic => question.toLowerCase().includes(topic)).length;
    if (topicCount > 1) complexityScore += 1;
    
    if (complexityScore >= 3) return 'high';
    if (complexityScore >= 1) return 'medium';
    return 'low';
  }

  private static detectEmotionalTone(question: string): 'neutral' | 'concerned' | 'distressed' | 'positive' {
    const distressedWords = ['desperate', 'exhausted', 'overwhelmed', 'can\'t handle', 'breaking down'];
    const concernedWords = ['worried', 'concerned', 'anxious', 'unsure', 'confused'];
    const positiveWords = ['excited', 'happy', 'proud', 'grateful', 'wonderful'];
    
    if (distressedWords.some(word => question.toLowerCase().includes(word))) return 'distressed';
    if (concernedWords.some(word => question.toLowerCase().includes(word))) return 'concerned';
    if (positiveWords.some(word => question.toLowerCase().includes(word))) return 'positive';
    return 'neutral';
  }

  private static optimizeSearchQuery(question: string, context: AIContext): string {
    let optimizedQuery = question;
    
    // Add context-specific terms
    if (context.childAge) {
      optimizedQuery += ` ${context.childAge}`;
    }
    
    // Add current year for latest information
    optimizedQuery += ' 2024 2025 latest research pediatric guidelines';
    
    // Add authoritative source preferences
    optimizedQuery += ' AAP CDC medical expert advice';
    
    return optimizedQuery;
  }

  private static shouldUseWebSearch(questionAnalysis: any): boolean {
    return (
      questionAnalysis.urgency === 'high' ||
      questionAnalysis.requiresFactualAccuracy ||
      questionAnalysis.complexity === 'high' ||
      questionAnalysis.category === 'Health' ||
      questionAnalysis.type === 'factual'
    );
  }

  private static generateEnhancedOfflineResponse(question: string, webSearchResults?: string): string {
    const { response: offlineResponse } = OfflineKnowledgeBase.getResponse(question);
    
    let enhancedResponse = offlineResponse;
    
    if (webSearchResults) {
      enhancedResponse += `\n\n**Latest Research:**\n\n${webSearchResults}`;
    }
    
    return enhancedResponse;
  }

  private static storeConversationContext(question: string, response: string): void {
    const sessionId = 'current'; // In a real app, this would be the actual session ID
    
    if (!this.conversationMemory.has(sessionId)) {
      this.conversationMemory.set(sessionId, []);
    }
    
    const conversation = this.conversationMemory.get(sessionId)!;
    const timestamp = Date.now();
    
    conversation.push(
      { role: 'user', content: question, timestamp },
      { role: 'assistant', content: response, timestamp }
    );
    
    // Keep only last 10 exchanges (20 messages)
    if (conversation.length > 20) {
      conversation.splice(0, conversation.length - 20);
    }
  }

  private static getRecentConversationHistory(): Array<{ role: 'user' | 'assistant'; content: string }> {
    const sessionId = 'current';
    const conversation = this.conversationMemory.get(sessionId) || [];
    
    // Return last 6 messages (3 exchanges)
    return conversation.slice(-6).map(msg => ({
      role: msg.role,
      content: msg.content.substring(0, 200) // Truncate for context
    }));
  }

  private static buildSessionContext(): any {
    return {
      sessionStart: Date.now(),
      totalQuestions: this.conversationMemory.get('current')?.length || 0,
      primaryTopics: this.getSessionTopics()
    };
  }

  private static getSessionTopics(): string[] {
    const conversation = this.conversationMemory.get('current') || [];
    const topics = new Set<string>();
    
    conversation.forEach(msg => {
      if (msg.role === 'user') {
        const category = this.categorizeQuestion(msg.content);
        topics.add(category);
      }
    });
    
    return Array.from(topics);
  }

  private static assessResponseConfidence(response: string, context: any): number {
    let confidence = 0.7; // Base confidence
    
    // Increase confidence based on response quality indicators
    if (response.length > 300) confidence += 0.1; // Comprehensive response
    if (response.includes('research') || response.includes('study')) confidence += 0.1; // Evidence-based
    if (context.webSearchResults) confidence += 0.1; // Enhanced with web search
    if (response.includes('**') && response.includes('•')) confidence += 0.05; // Well-structured
    
    return Math.min(confidence, 0.95); // Cap at 95%
  }

  private static generateReasoning(context: any, provider: AIProvider): string {
    const reasons = [];
    
    reasons.push(`Selected ${provider.name} for optimal response quality`);
    
    if (context.webSearchResults) {
      reasons.push('Enhanced with latest research and expert sources');
    }
    
    if (context.conversationHistory?.length > 0) {
      reasons.push('Considered conversation history for personalized guidance');
    }
    
    reasons.push('Applied advanced AI analysis for comprehensive support');
    
    return reasons.join('; ');
  }

  // Existing helper methods (keeping the same logic but enhanced)
  private static isGreeting(message: string): boolean {
    const lowerMessage = message.toLowerCase().trim();
    
    const greetingPatterns = [
      /^(hi|hello|hey|good morning|good afternoon|good evening|good night)$/,
      /^(hi|hello|hey|good morning|good afternoon|good evening|good night)\s*[!.]*$/,
      /^(hi|hello|hey)\s+(there|parentgpt)$/,
      /^good\s+(morning|afternoon|evening|night)$/,
      /^(howdy|greetings|what's up|whats up|sup)$/,
      /^how\s+(are\s+you|is\s+it\s+going)$/,
      /^(i'm|im)\s+new\s+(here|to\s+this)$/,
      /^first\s+time\s+(here|using\s+this)$/
    ];

    return greetingPatterns.some(pattern => pattern.test(lowerMessage));
  }

  private static isCasualConversation(message: string): boolean {
    const lowerMessage = message.toLowerCase().trim();
    
    const casualPatterns = [
      /^(thank\s+you|thanks|thx)$/,
      /^(thank\s+you|thanks)\s+(so\s+much|very\s+much)$/,
      /^how\s+are\s+you(\s+doing)?$/,
      /^(that\s+was\s+helpful|that\s+helped|great\s+advice)$/,
      /^(you're\s+amazing|youre\s+amazing|this\s+is\s+great)$/,
      /^(ok|okay|got\s+it|i\s+see|understood)$/,
      /^(yes|no|maybe|sure)$/,
      /^(bye|goodbye|see\s+you|talk\s+to\s+you\s+later|ttyl)$/,
      /^(have\s+a\s+good\s+day|have\s+a\s+great\s+day)$/
    ];

    return casualPatterns.some(pattern => pattern.test(lowerMessage));
  }

  private static handleGreeting(): AIResponse {
    const responses = [
      `👋 **Welcome to ParentGPT!**

I'm here to help with all your parenting questions and concerns. Whether you're dealing with sleep issues, behavior challenges, feeding problems, or developmental milestones, I'm ready to provide practical, evidence-based guidance.

**I can help with:**
• Sleep training and bedtime routines
• Behavior management and discipline
• Feeding challenges and nutrition
• Developmental milestones and concerns
• Health and safety questions
• School readiness and learning

What parenting challenge can I help you with today?`,

      `🌟 **Hello! I'm Your Parenting Assistant**

I'm designed to provide helpful, practical advice for parents at every stage of the journey. From newborn care to teenage challenges, I'm here to support you with evidence-based guidance and empathetic support.

**Popular topics I help with:**
• Sleep problems and solutions
• Tantrums and behavior issues
• Picky eating and nutrition
• Potty training guidance
• Developmental concerns
• Safety and health questions

What's on your mind today? I'm here to help! 😊`
    ];

    return {
      response: responses[Math.floor(Math.random() * responses.length)],
      category: 'Greeting',
      hasWebSearch: false,
      isOnlineResponse: false,
      confidence: 0.9
    };
  }

  private static handleCasualConversation(message: string): AIResponse {
    const lowerMessage = message.toLowerCase().trim();
    
    let response = '';

    if (lowerMessage.includes('thank') || lowerMessage.includes('thx')) {
      response = "You're very welcome! 😊 I'm so glad I could help. Remember, parenting is challenging and you're doing great by seeking guidance. Feel free to ask me anything else!";
    } else if (lowerMessage.includes('how are you')) {
      response = "I'm doing well, thank you for asking! 🌟 I'm here and ready to help with any parenting questions or concerns you might have. How are you doing with your parenting journey?";
    } else {
      response = "I appreciate you chatting with me! 💝 I'm always here when you need parenting support, advice, or just someone to listen. What would you like to talk about?";
    }

    return {
      response,
      category: 'Conversation',
      hasWebSearch: false,
      isOnlineResponse: false,
      confidence: 0.8
    };
  }

  static categorizeQuestion(question: string): string {
    const lowerQuestion = question.toLowerCase();
    
    if (this.isGreeting(question)) return 'Greeting';
    if (this.isCasualConversation(question)) return 'Conversation';
    
    if (lowerQuestion.includes('emergency') || lowerQuestion.includes('urgent')) return 'Emergency';
    if (lowerQuestion.includes('sleep') || lowerQuestion.includes('bedtime') || lowerQuestion.includes('nap')) return 'Sleep';
    if (lowerQuestion.includes('behavior') || lowerQuestion.includes('tantrum') || lowerQuestion.includes('discipline')) return 'Behavior';
    if (lowerQuestion.includes('eat') || lowerQuestion.includes('food') || lowerQuestion.includes('feed') || lowerQuestion.includes('nutrition')) return 'Feeding';
    if (lowerQuestion.includes('develop') || lowerQuestion.includes('milestone') || lowerQuestion.includes('learn')) return 'Development';
    if (lowerQuestion.includes('potty') || lowerQuestion.includes('toilet')) return 'Potty Training';
    if (lowerQuestion.includes('screen') || lowerQuestion.includes('tv') || lowerQuestion.includes('tablet')) return 'Screen Time';
    if (lowerQuestion.includes('safe') || lowerQuestion.includes('danger') || lowerQuestion.includes('accident')) return 'Safety';
    if (lowerQuestion.includes('sick') || lowerQuestion.includes('health') || lowerQuestion.includes('doctor')) return 'Health';
    if (lowerQuestion.includes('school') || lowerQuestion.includes('education') || lowerQuestion.includes('learning')) return 'Education';
    if (lowerQuestion.includes('sibling') || lowerQuestion.includes('brother') || lowerQuestion.includes('sister')) return 'Siblings';
    
    return 'General Parenting';
  }
  
  static determineUrgency(question: string): 'low' | 'medium' | 'high' {
    const lowerQuestion = question.toLowerCase();
    
    if (this.isGreeting(question) || this.isCasualConversation(question)) {
      return 'low';
    }
    
    const highUrgencyWords = [
      'emergency', 'urgent', 'help', 'dangerous', 'hurt', 'bleeding', 
      'choking', 'can\'t breathe', 'difficulty breathing', 'unconscious',
      'severe pain', 'high fever', 'dehydrated', 'allergic reaction'
    ];
    
    const mediumUrgencyWords = [
      'worried', 'concerned', 'problem', 'issue', 'trouble', 'won\'t', 
      'refuses', 'crying', 'upset', 'difficult', 'struggling'
    ];
    
    if (highUrgencyWords.some(word => lowerQuestion.includes(word))) return 'high';
    if (mediumUrgencyWords.some(word => lowerQuestion.includes(word))) return 'medium';
    return 'low';
  }
  
  static extractChildAge(question: string): string | undefined {
    const agePatterns = [
      { pattern: /newborn|0.{0,5}month/i, age: 'newborn' },
      { pattern: /(\d+).{0,5}month/i, age: 'infant' },
      { pattern: /toddler|1.{0,5}year|2.{0,5}year/i, age: 'toddler' },
      { pattern: /preschool|3.{0,5}year|4.{0,5}year|5.{0,5}year/i, age: 'preschooler' },
      { pattern: /school.{0,5}age|6.{0,5}year|7.{0,5}year|8.{0,5}year/i, age: 'school-age' },
      { pattern: /teen|adolescent|13|14|15|16|17/i, age: 'teenager' }
    ];
    
    for (const { pattern, age } of agePatterns) {
      if (pattern.test(question)) {
        return age;
      }
    }
    
    return undefined;
  }

  static getAvailableProviders(): string[] {
    return this.providers
      .filter(provider => provider.apiKey)
      .sort((a, b) => b.priority - a.priority)
      .map(provider => provider.name);
  }

  static isConfigured(): boolean {
    return this.providers.some(provider => provider.apiKey);
  }
}