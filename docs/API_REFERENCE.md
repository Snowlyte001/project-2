# ParentGPT API Reference
## Comprehensive API Documentation

### Table of Contents
1. [AI Services API](#ai-services-api)
2. [Database API](#database-api)
3. [Voice Services API](#voice-services-api)
4. [Search API](#search-api)
5. [Tracking API](#tracking-api)
6. [Authentication API](#authentication-api)
7. [Error Handling](#error-handling)
8. [Rate Limiting](#rate-limiting)

---

## AI Services API

### EnhancedAIService

#### `generateParentingResponse(question: string, context: AIContext): Promise<AIResponse>`

Generates intelligent parenting responses using multiple AI providers.

**Parameters:**
```typescript
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
```

**Returns:**
```typescript
interface AIResponse {
  response: string;
  category: string;
  hasWebSearch: boolean;
  isOnlineResponse: boolean;
  provider?: string;
  confidence: number;
  reasoning?: string;
}
```

**Example:**
```typescript
const response = await EnhancedAIService.generateParentingResponse(
  "My 2-year-old won't sleep through the night",
  {
    childAge: 'toddler',
    urgency: 'medium',
    category: 'Sleep',
    isOnlineMode: true
  }
);

console.log(response.provider); // "Anthropic Claude"
console.log(response.confidence); // 0.85
```

#### `categorizeQuestion(question: string): string`

Automatically categorizes parenting questions.

**Returns:** Category string (Sleep, Behavior, Feeding, Development, etc.)

#### `determineUrgency(question: string): 'low' | 'medium' | 'high'`

Analyzes question urgency level.

#### `extractChildAge(question: string): string | undefined`

Extracts child age information from questions.

#### `getAvailableProviders(): string[]`

Returns list of configured AI providers.

---

## Database API

### Supabase Integration

#### User Profiles

```typescript
// Create user profile
const { data, error } = await supabase
  .from('user_profiles')
  .insert([{
    user_id: userId,
    parent_type: 'single',
    experience_level: 'first_time',
    support_network: 'moderate',
    primary_concerns: ['sleep', 'feeding']
  }]);

// Get user profile
const { data, error } = await supabase
  .from('user_profiles')
  .select('*')
  .eq('user_id', userId)
  .single();
```

#### Children Management

```typescript
// Add child
const { data, error } = await supabase
  .from('children')
  .insert([{
    user_id: userId,
    name: 'Emma',
    age_category: '2_years',
    gender: 'female',
    personality_traits: ['active', 'curious']
  }]);

// Get children
const { data, error } = await supabase
  .from('children')
  .select('*')
  .eq('user_id', userId);
```

#### Chat Sessions

```typescript
// Create session
const { data, error } = await supabase
  .from('chat_sessions')
  .insert([{
    user_id: userId,
    title: 'Sleep Training Discussion'
  }]);

// Get sessions
const { data, error } = await supabase
  .from('chat_sessions')
  .select('*')
  .eq('user_id', userId)
  .order('updated_at', { ascending: false });
```

---

## Voice Services API

### VoiceService

#### `generateSpeech(text: string): Promise<string | null>`

Generates speech audio from text using ElevenLabs or browser TTS.

**Parameters:**
- `text`: Text to convert to speech

**Returns:** Audio URL or null for browser TTS

**Example:**
```typescript
const audioUrl = await VoiceService.generateSpeech(
  "Here's some helpful parenting advice..."
);

if (audioUrl) {
  const audio = new Audio(audioUrl);
  audio.play();
}
```

#### `startListening(onResult: Function, onError: Function): void`

Starts speech recognition for voice input.

**Parameters:**
- `onResult`: Callback for successful transcription
- `onError`: Callback for errors

**Example:**
```typescript
VoiceService.startListening(
  (transcript) => {
    console.log('User said:', transcript);
    setInputText(transcript);
  },
  (error) => {
    console.error('Speech recognition error:', error);
  }
);
```

#### `stopListening(): void`

Stops active speech recognition.

#### `isElevenLabsConfigured(): boolean`

Checks if ElevenLabs API is configured.

#### `isSpeechRecognitionSupported(): boolean`

Checks browser speech recognition support.

---

## Search API

### WebSearchService

#### `searchParentingInfo(query: string): Promise<SearchResults>`

Searches for parenting information using Serper API.

**Parameters:**
- `query`: Search query string

**Returns:**
```typescript
interface SearchResults {
  results: SearchResult[];
  summary?: string;
  hasResults: boolean;
}

interface SearchResult {
  title: string;
  link: string;
  snippet: string;
  date?: string;
}
```

**Example:**
```typescript
const searchResults = await WebSearchService.searchParentingInfo(
  "toddler sleep training methods 2024"
);

if (searchResults.hasResults) {
  console.log('Found', searchResults.results.length, 'results');
  searchResults.results.forEach(result => {
    console.log(result.title, result.snippet);
  });
}
```

#### `formatSearchResults(results: SearchResult[], summary?: string): string`

Formats search results for AI integration.

---

## Tracking API

### TrackingService

#### `addTrackingEntry(entry: TrackingEntry): Promise<TrackingEntry | null>`

Adds a new tracking entry.

**Parameters:**
```typescript
interface TrackingEntry {
  id?: string;
  user_id: string;
  child_id?: string;
  entry_type: 'feeding' | 'sleep' | 'diaper' | 'mood' | 'milestone' | 'parent_mood';
  entry_data: any;
  notes?: string;
  created_at?: string;
}
```

#### `trackFeeding(userId: string, childId: string, feedingData: FeedingData, notes?: string): Promise<TrackingEntry | null>`

Quick feeding tracking.

**Parameters:**
```typescript
interface FeedingData {
  type: 'breast' | 'bottle' | 'solid';
  amount?: number;
  duration?: number;
  side?: 'left' | 'right' | 'both';
}
```

**Example:**
```typescript
const entry = await TrackingService.trackFeeding(
  userId,
  childId,
  {
    type: 'breast',
    duration: 20,
    side: 'left'
  },
  'Baby seemed satisfied'
);
```

#### `trackSleep(userId: string, childId: string, sleepData: SleepData, notes?: string): Promise<TrackingEntry | null>`

Sleep tracking functionality.

**Parameters:**
```typescript
interface SleepData {
  type: 'nap' | 'night_sleep';
  start_time: string;
  end_time?: string;
  duration?: number;
  quality: 'poor' | 'fair' | 'good' | 'excellent';
}
```

#### `getFeedingStats(userId: string, childId: string, days: number = 7): Promise<FeedingStats>`

Get feeding analytics.

**Returns:**
```typescript
interface FeedingStats {
  totalFeedings: number;
  averagePerDay: number;
  breastFeedings: number;
  bottleFeedings: number;
  solidFeedings: number;
}
```

---

## Authentication API

### Supabase Auth Integration

#### Anonymous Authentication
```typescript
const { data, error } = await supabase.auth.signInAnonymously();
```

#### Email Authentication
```typescript
// Sign up
const { data, error } = await supabase.auth.signUp({
  email: 'user@example.com',
  password: 'password123'
});

// Sign in
const { data, error } = await supabase.auth.signInWithPassword({
  email: 'user@example.com',
  password: 'password123'
});
```

#### Session Management
```typescript
// Get current session
const { data: { session } } = await supabase.auth.getSession();

// Listen for auth changes
supabase.auth.onAuthStateChange((event, session) => {
  if (event === 'SIGNED_IN') {
    console.log('User signed in:', session.user);
  }
});
```

---

## Error Handling

### Standard Error Response Format

```typescript
interface APIError {
  error: string;
  message: string;
  code?: string;
  details?: any;
}
```

### Common Error Codes

#### AI Service Errors
- `AI_PROVIDER_UNAVAILABLE`: Selected AI provider is not responding
- `AI_QUOTA_EXCEEDED`: API quota limit reached
- `AI_INVALID_REQUEST`: Malformed request to AI service

#### Database Errors
- `DB_CONNECTION_FAILED`: Database connection issue
- `DB_PERMISSION_DENIED`: Insufficient permissions
- `DB_VALIDATION_ERROR`: Data validation failed

#### Voice Service Errors
- `VOICE_NOT_SUPPORTED`: Browser doesn't support speech recognition
- `VOICE_PERMISSION_DENIED`: Microphone access denied
- `VOICE_NETWORK_ERROR`: Network issue during voice processing

### Error Handling Examples

```typescript
try {
  const response = await EnhancedAIService.generateParentingResponse(question, context);
} catch (error) {
  if (error.code === 'AI_PROVIDER_UNAVAILABLE') {
    // Fallback to offline mode
    const fallbackResponse = OfflineKnowledgeBase.getResponse(question);
  } else {
    // Handle other errors
    console.error('Unexpected error:', error);
  }
}
```

---

## Rate Limiting

### API Rate Limits

#### AI Providers
- **Anthropic Claude**: 50 requests/minute
- **DeepSeek**: 60 requests/minute  
- **Groq**: 100 requests/minute
- **Together AI**: 80 requests/minute

#### Search API
- **Serper**: 100 requests/hour (free tier)

#### Voice Services
- **ElevenLabs**: 10,000 characters/month (free tier)

### Rate Limit Handling

```typescript
class RateLimiter {
  private static limits = new Map<string, { count: number; resetTime: number }>();
  
  static async checkLimit(service: string, limit: number, windowMs: number): Promise<boolean> {
    const now = Date.now();
    const serviceLimit = this.limits.get(service);
    
    if (!serviceLimit || now > serviceLimit.resetTime) {
      this.limits.set(service, { count: 1, resetTime: now + windowMs });
      return true;
    }
    
    if (serviceLimit.count >= limit) {
      return false;
    }
    
    serviceLimit.count++;
    return true;
  }
}

// Usage
const canMakeRequest = await RateLimiter.checkLimit('anthropic', 50, 60000);
if (!canMakeRequest) {
  throw new Error('Rate limit exceeded');
}
```

---

## SDK Usage Examples

### Complete Conversation Flow

```typescript
// Initialize conversation
const session = ChatStorageService.createNewSession();

// Process user input
const userMessage: Message = {
  id: Date.now().toString(),
  text: "My toddler won't eat vegetables",
  isUser: true,
  timestamp: new Date().toISOString()
};

// Analyze and respond
const context: AIContext = {
  childAge: 'toddler',
  urgency: 'medium',
  category: 'Feeding',
  isOnlineMode: true
};

const aiResponse = await EnhancedAIService.generateParentingResponse(
  userMessage.text,
  context
);

// Generate voice response
if (aiResponse.response) {
  const audioUrl = await VoiceService.generateSpeech(aiResponse.response);
  // Play audio
}

// Track interaction
await TrackingService.addTrackingEntry({
  user_id: userId,
  entry_type: 'parent_mood',
  entry_data: { concern: 'feeding', satisfaction: 'helpful' },
  notes: 'Got helpful advice about vegetables'
});
```

### Batch Operations

```typescript
// Bulk tracking entries
const entries = [
  { type: 'feeding', data: { type: 'breast', duration: 15 } },
  { type: 'sleep', data: { type: 'nap', duration: 90 } },
  { type: 'diaper', data: { type: 'wet' } }
];

const results = await Promise.all(
  entries.map(entry => 
    TrackingService.addTrackingEntry({
      user_id: userId,
      child_id: childId,
      entry_type: entry.type,
      entry_data: entry.data
    })
  )
);
```

---

*This API reference provides comprehensive documentation for all ParentGPT services and integrations. For additional support or questions, please refer to the main project documentation.*