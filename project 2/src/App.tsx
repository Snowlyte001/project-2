import React, { useState, useRef, useEffect } from 'react';
import { Send, Volume2, Play, Pause, Brain, User, MessageCircle, Sparkles, BookOpen, Search, Globe, Zap, Menu, Sun, Moon, Cpu, Baby, BarChart3 } from 'lucide-react';
import { EnhancedAIService } from './services/enhancedAI';
import { ChatStorageService } from './services/chatStorage';
import { MainSidebar } from './components/MainSidebar';
import { BoltBadge } from './components/BoltBadge';
import { VoiceAssistant } from './components/VoiceAssistant';
import { VirtualPediatrician } from './components/VirtualPediatrician';
import { Message, ChatSession } from './types/chat';
import { useTheme } from './contexts/ThemeContext';
import { supabase } from './lib/supabase';

function App() {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [currentSession, setCurrentSession] = useState<ChatSession | null>(null);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [currentlyPlaying, setCurrentlyPlaying] = useState<string | null>(null);
  const [isOnlineMode, setIsOnlineMode] = useState(false);
  const [apiStatus, setApiStatus] = useState({ 
    serper: false, 
    anthropic: false, 
    groq: false, 
    together: false, 
    deepseek: false,
    elevenlabs: false,
    tavus: false,
    supabase: false
  });
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [children, setChildren] = useState<any[]>([]);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const { theme, toggleTheme } = useTheme();

  useEffect(() => {
    // Check API configuration
    const serperConfigured = !!import.meta.env.VITE_SERPER_API_KEY;
    const anthropicConfigured = !!import.meta.env.VITE_ANTHROPIC_API_KEY;
    const groqConfigured = !!import.meta.env.VITE_GROQ_API_KEY;
    const togetherConfigured = !!import.meta.env.VITE_TOGETHER_API_KEY;
    const deepseekConfigured = !!import.meta.env.VITE_DEEPSEEK_API_KEY;
    const elevenlabsConfigured = !!import.meta.env.VITE_ELEVENLABS_API_KEY;
    const tavusConfigured = !!(import.meta.env.VITE_TAVUS_API_KEY && import.meta.env.VITE_TAVUS_REPLICA_ID);
    const supabaseConfigured = !!(import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY);
    
    setApiStatus({ 
      serper: serperConfigured, 
      anthropic: anthropicConfigured,
      groq: groqConfigured,
      together: togetherConfigured,
      deepseek: deepseekConfigured,
      elevenlabs: elevenlabsConfigured,
      tavus: tavusConfigured,
      supabase: supabaseConfigured
    });
    
    const hasAnyAI = anthropicConfigured || groqConfigured || togetherConfigured || deepseekConfigured;
    setIsOnlineMode(serperConfigured || hasAnyAI);

    // Initialize Supabase auth
    if (supabaseConfigured) {
      initializeAuth();
    }

    // Load existing sessions
    const existingSessions = ChatStorageService.getAllSessions();
    setSessions(existingSessions);

    // Load current session or create new one
    const currentSessionId = ChatStorageService.getCurrentSessionId();
    let sessionToLoad: ChatSession | null = null;

    if (currentSessionId) {
      sessionToLoad = ChatStorageService.getSession(currentSessionId);
    }

    if (!sessionToLoad) {
      sessionToLoad = createNewSession();
    }

    setCurrentSession(sessionToLoad);
  }, []);

  const initializeAuth = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setUser(session.user);
        loadUserChildren(session.user.id);
      } else {
        // Sign in anonymously for demo purposes
        const { data, error } = await supabase.auth.signInAnonymously();
        if (data.user) {
          setUser(data.user);
          loadUserChildren(data.user.id);
        }
      }
    } catch (error) {
      console.error('Auth initialization failed:', error);
    }
  };

  const loadUserChildren = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('children')
        .select('*')
        .eq('user_id', userId);
      
      if (error) throw error;
      setChildren(data || []);
    } catch (error) {
      console.error('Failed to load children:', error);
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [currentSession?.messages]);

  const createNewSession = (): ChatSession => {
    const newSession = ChatStorageService.createNewSession();
    
    // Add welcome message
    const welcomeMessage: Message = {
      id: '1',
      text: getWelcomeMessage(),
      isUser: false,
      timestamp: new Date().toISOString(),
      isOnlineResponse: isOnlineMode
    };

    newSession.messages = [welcomeMessage];
    newSession.messageCount = 1;
    newSession.updatedAt = new Date().toISOString();

    ChatStorageService.saveSession(newSession);
    ChatStorageService.setCurrentSessionId(newSession.id);
    
    // Update sessions list
    const updatedSessions = ChatStorageService.getAllSessions();
    setSessions(updatedSessions);

    return newSession;
  };

  const getWelcomeMessage = (): string => {
    const availableProviders = EnhancedAIService.getAvailableProviders();
    const hasAI = availableProviders.length > 0;
    const hasWebSearch = apiStatus.serper;
    const hasVoice = apiStatus.elevenlabs;
    const hasVideo = apiStatus.tavus;
    const hasTracking = apiStatus.supabase;

    return `👋 **Welcome to ParentGPT!**

I'm here to help you navigate the wonderful journey of parenting with practical advice, evidence-based guidance, and a supportive approach.

${hasAI || hasWebSearch || hasVoice || hasVideo || hasTracking
  ? `🌟 **Enhanced Features Available:**
${hasWebSearch ? '• 🔍 **Smart Search** - Access to latest parenting research' : ''}
${hasAI ? `• 🧠 **Advanced AI** - Powered by ${availableProviders.join(', ')}` : ''}
${hasVoice ? '• 🎤 **Voice Assistant** - Natural voice conversations' : ''}
${hasVideo ? '• 🩺 **Virtual Pediatrician** - Video guidance from AI doctor' : ''}
${hasTracking ? '• 📊 **Smart Tracking** - Monitor feeding, sleep, and wellness' : ''}

Experience personalized parenting support with cutting-edge technology!`
  : `📚 **Comprehensive Parenting Support**
• Expert guidance on child development and milestones
• Sleep training, feeding, and behavior strategies
• Safety recommendations and emergency protocols
• Age-appropriate advice from newborn to teenager

*Add API keys to unlock advanced features like voice assistance and smart tracking!*`
}

**I can help with:**
• 😴 Sleep challenges and bedtime routines
• 🎭 Behavior management and discipline strategies
• 🍼 Feeding problems and nutrition questions
• 🌱 Developmental milestones and concerns
• 🛡️ Safety tips and emergency guidance
• 🏥 Health questions and when to seek help

What parenting question can I help you with today? 💝`;
  };

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || isLoading || !currentSession) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputText,
      isUser: true,
      timestamp: new Date().toISOString()
    };

    // Update current session with user message
    const updatedSession = {
      ...currentSession,
      messages: [...currentSession.messages, userMessage],
      messageCount: currentSession.messageCount + 1,
      updatedAt: new Date().toISOString()
    };

    // Update title if this is the first user message
    if (currentSession.messages.length === 1 && currentSession.title === 'New Conversation') {
      updatedSession.title = ChatStorageService.generateSessionTitle(inputText);
    }

    setCurrentSession(updatedSession);
    ChatStorageService.saveSession(updatedSession);

    const currentInput = inputText;
    setInputText('');
    setIsLoading(true);

    try {
      // Analyze the question
      const category = EnhancedAIService.categorizeQuestion(currentInput);
      const urgency = EnhancedAIService.determineUrgency(currentInput);
      const childAge = EnhancedAIService.extractChildAge(currentInput);
      
      console.log(`Processing question - Category: ${category}, Urgency: ${urgency}, Age: ${childAge || 'not specified'}`);
      
      // Generate enhanced response using our enhanced AI service
      const { response: aiResponseText, category: responseCategory, hasWebSearch, isOnlineResponse, provider } = 
        await EnhancedAIService.generateParentingResponse(currentInput, {
          childAge,
          urgency,
          category,
          isOnlineMode
        });
      
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: aiResponseText,
        isUser: false,
        timestamp: new Date().toISOString(),
        category: responseCategory,
        hasWebSearch,
        isOnlineResponse
      };

      // Update session with AI response
      const finalSession = {
        ...updatedSession,
        messages: [...updatedSession.messages, aiMessage],
        messageCount: updatedSession.messageCount + 1,
        updatedAt: new Date().toISOString()
      };

      setCurrentSession(finalSession);
      ChatStorageService.saveSession(finalSession);
      
      // Update sessions list
      const refreshedSessions = ChatStorageService.getAllSessions();
      setSessions(refreshedSessions);
      
      if (provider) {
        console.log(`✅ Response generated using ${provider}`);
      }
      
    } catch (error) {
      console.error('Error processing message:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: "I'm experiencing technical difficulties, but I'm still here to help! Please try asking your question again - I have extensive parenting knowledge to support you.",
        isUser: false,
        timestamp: new Date().toISOString(),
        category: 'System'
      };
      
      const errorSession = {
        ...updatedSession,
        messages: [...updatedSession.messages, errorMessage],
        messageCount: updatedSession.messageCount + 1,
        updatedAt: new Date().toISOString()
      };

      setCurrentSession(errorSession);
      ChatStorageService.saveSession(errorSession);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVoiceInput = (transcript: string) => {
    setInputText(transcript);
  };

  const handleVoiceResponse = (audioUrl: string) => {
    // Audio will be played automatically by the VoiceAssistant component
    console.log('Voice response generated:', audioUrl);
  };

  const handleVideoGenerated = (videoUrl: string) => {
    console.log('Video response generated:', videoUrl);
  };

  const handleAudioPlay = (messageId: string, text: string) => {
    if (currentlyPlaying === messageId) {
      speechSynthesis.cancel();
      setCurrentlyPlaying(null);
      return;
    }

    speechSynthesis.cancel();
    
    // Clean text for speech synthesis
    const cleanText = text
      .replace(/\*\*/g, '') // Remove markdown bold
      .replace(/#{1,6}\s/g, '') // Remove markdown headers
      .replace(/\n\n/g, '. ') // Replace double newlines with periods
      .replace(/\n/g, ' ') // Replace single newlines with spaces
      .replace(/•/g, '') // Remove bullet points
      .replace(/🔍|🧠|📚|🌐|⚠️|🚨|😴|🍼|🎭|🌱|🛡️|🏥|💝|🚀|🎯|✨|💡|🔧|📱|🎓|👨‍👩‍👧‍👦/g, ''); // Remove emojis
    
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.rate = 0.9;
    utterance.pitch = 1.0;
    utterance.volume = 1.0;

    // Try to use a pleasant voice
    const voices = speechSynthesis.getVoices();
    const preferredVoice = voices.find(voice => 
      voice.name.toLowerCase().includes('female') || 
      voice.name.toLowerCase().includes('samantha') ||
      voice.name.toLowerCase().includes('karen')
    );
    
    if (preferredVoice) utterance.voice = preferredVoice;

    utterance.onend = () => setCurrentlyPlaying(null);
    utterance.onerror = () => setCurrentlyPlaying(null);

    speechSynthesis.speak(utterance);
    setCurrentlyPlaying(messageId);
  };

  const handleNewChat = () => {
    const newSession = createNewSession();
    setCurrentSession(newSession);
    setSidebarOpen(false); // Close sidebar on mobile after creating new chat
  };

  const handleSessionSelect = (sessionId: string) => {
    const session = ChatStorageService.getSession(sessionId);
    if (session) {
      setCurrentSession(session);
      ChatStorageService.setCurrentSessionId(sessionId);
      setSidebarOpen(false); // Close sidebar on mobile after selecting
    }
  };

  const handleDeleteSession = (sessionId: string) => {
    ChatStorageService.deleteSession(sessionId);
    const updatedSessions = ChatStorageService.getAllSessions();
    setSessions(updatedSessions);

    // If we deleted the current session, create a new one
    if (currentSession?.id === sessionId) {
      const newSession = createNewSession();
      setCurrentSession(newSession);
    }
  };

  const handleExportData = () => {
    const data = {
      sessions: ChatStorageService.getAllSessions(),
      timestamp: new Date().toISOString(),
      version: '1.0'
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `parentgpt-data-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleImportData = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string);
        if (data.sessions && Array.isArray(data.sessions)) {
          // Import sessions
          data.sessions.forEach((session: ChatSession) => {
            ChatStorageService.saveSession(session);
          });
          
          // Refresh sessions list
          const updatedSessions = ChatStorageService.getAllSessions();
          setSessions(updatedSessions);
          
          alert('Data imported successfully!');
        } else {
          alert('Invalid data format');
        }
      } catch (error) {
        alert('Error importing data');
      }
    };
    reader.readAsText(file);
  };

  const handleClearData = () => {
    if (confirm('Are you sure you want to clear all data? This cannot be undone.')) {
      localStorage.clear();
      setSessions([]);
      const newSession = createNewSession();
      setCurrentSession(newSession);
      alert('All data cleared successfully!');
    }
  };

  const getCategoryIcon = (category?: string) => {
    switch (category) {
      case 'Sleep': return '😴';
      case 'Behavior': return '🎭';
      case 'Feeding': return '🍼';
      case 'Development': return '🌱';
      case 'Safety': return '🛡️';
      case 'Health': return '🏥';
      case 'Education': return '🎓';
      case 'Emergency': return '🚨';
      case 'Potty Training': return '🚽';
      case 'Screen Time': return '📱';
      case 'Siblings': return '👫';
      default: return '💝';
    }
  };

  const quickTopics = [
    { icon: '😴', text: 'Sleep Help', query: 'My child has sleep problems and won\'t go to bed' },
    { icon: '🍼', text: 'Feeding Issues', query: 'I need help with feeding my child - they\'re being picky' },
    { icon: '🎭', text: 'Behavior', query: 'My child is having behavior challenges and tantrums' },
    { icon: '🌱', text: 'Development', query: 'I have questions about my child\'s development milestones' },
    { icon: '🚽', text: 'Potty Training', query: 'How do I start potty training my toddler?' },
    { icon: '🏥', text: 'Health Concerns', query: 'When should I be concerned about my child\'s health?' },
    { icon: '📱', text: 'Screen Time', query: 'How much screen time is appropriate for my child?' },
    { icon: '🎓', text: 'School Readiness', query: 'How can I prepare my child for school?' }
  ];

  if (!currentSession) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center">
        <div className="text-center animate-fade-in">
          <div className="w-16 h-16 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4 animate-gentle-bounce">
            <Brain className="w-8 h-8 text-white" />
          </div>
          <p className="text-gray-600 dark:text-gray-400">Loading ParentGPT...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex transition-colors duration-300">
      {/* Main Sidebar */}
      <MainSidebar
        sessions={sessions}
        currentSessionId={currentSession.id}
        onSessionSelect={handleSessionSelect}
        onNewChat={handleNewChat}
        onDeleteSession={handleDeleteSession}
        apiStatus={apiStatus}
        user={user}
        children={children}
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
        onExportData={handleExportData}
        onImportData={handleImportData}
        onClearData={handleClearData}
      />

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-b border-gray-200 dark:border-gray-700 sticky top-0 z-10">
          <div className="max-w-4xl mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setSidebarOpen(true)}
                  className="lg:hidden p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors hover-lift"
                >
                  <Menu className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                </button>
                
                <div className="w-10 h-10 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full flex items-center justify-center animate-gentle-bounce">
                  <Brain className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-semibold text-gray-800 dark:text-gray-200">ParentGPT</h1>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Your AI Parenting Assistant
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                {/* Theme Toggle */}
                <button
                  onClick={toggleTheme}
                  className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors hover-lift"
                  title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
                >
                  {theme === 'light' ? (
                    <Moon className="w-5 h-5 text-gray-600" />
                  ) : (
                    <Sun className="w-5 h-5 text-yellow-500 animate-gentle-bounce" />
                  )}
                </button>

                {/* API Status Indicators */}
                <div className="hidden md:flex items-center gap-2">
                  {apiStatus.serper && (
                    <div className="flex items-center gap-1 px-2 py-1 rounded-full text-xs bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 animate-slide-in-left">
                      <Search className="w-3 h-3" />
                      Smart Search
                    </div>
                  )}
                  {(apiStatus.anthropic || apiStatus.groq || apiStatus.together || apiStatus.deepseek) && (
                    <div className="flex items-center gap-1 px-2 py-1 rounded-full text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 animate-slide-in-left">
                      <Cpu className="w-3 h-3" />
                      Enhanced AI
                    </div>
                  )}
                  {apiStatus.elevenlabs && (
                    <div className="flex items-center gap-1 px-2 py-1 rounded-full text-xs bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 animate-slide-in-left">
                      <Volume2 className="w-3 h-3" />
                      Voice AI
                    </div>
                  )}
                  {apiStatus.tavus && (
                    <div className="flex items-center gap-1 px-2 py-1 rounded-full text-xs bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 animate-slide-in-left">
                      <Baby className="w-3 h-3" />
                      Virtual Dr
                    </div>
                  )}
                </div>
                
                <button
                  onClick={handleNewChat}
                  className="flex items-center gap-2 px-3 py-1 rounded-full text-sm bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors hover-lift"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span className="hidden sm:inline">New Chat</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 p-4">
          {/* Chat Container */}
          <div className="max-w-4xl mx-auto w-full">
            <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 overflow-hidden gentle-glow">
              {/* Messages */}
              <div className="h-96 md:h-[500px] overflow-y-auto p-6 space-y-4 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 scrollbar-track-transparent">
                {currentSession.messages.map((message, index) => (
                  <div key={message.id}>
                    <div className={`flex gap-3 ${message.isUser ? 'justify-end' : 'justify-start'} message-bubble`} style={{ animationDelay: `${index * 0.1}s` }}>
                      {!message.isUser && (
                        <div className="w-8 h-8 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0 mt-1 animate-float">
                          <Brain className="w-4 h-4 text-white" />
                        </div>
                      )}
                      
                      <div className={`max-w-xs md:max-w-md lg:max-w-lg ${message.isUser ? 'order-first' : ''}`}>
                        <div
                          className={`px-4 py-3 rounded-2xl transition-all duration-200 hover-lift ${
                            message.isUser
                              ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-br-md'
                              : 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 rounded-bl-md'
                          }`}
                        >
                          <p 
                            className="text-sm leading-relaxed whitespace-pre-line"
                            data-last-ai-message={!message.isUser ? 'true' : undefined}
                          >
                            {message.text}
                          </p>
                        </div>
                        
                        {/* Category and feature indicators */}
                        {!message.isUser && (
                          <div className="mt-1 flex gap-2 flex-wrap">
                            {message.category && (
                              <span className="text-xs px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full flex items-center gap-1 animate-slide-in-left">
                                <span className="emoji-wiggle">{getCategoryIcon(message.category)}</span>
                                {message.category}
                              </span>
                            )}
                            {message.hasWebSearch && (
                              <span className="text-xs px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-full flex items-center gap-1 animate-slide-in-left">
                                <Search className="w-3 h-3" />
                                Latest Research
                              </span>
                            )}
                            {message.isOnlineResponse && (
                              <span className="text-xs px-2 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-full flex items-center gap-1 animate-slide-in-left">
                                <Sparkles className="w-3 h-3" />
                                Enhanced AI
                              </span>
                            )}
                          </div>
                        )}
                        
                        {/* Audio Player for AI messages */}
                        {!message.isUser && (
                          <div className="mt-2">
                            <button
                              onClick={() => handleAudioPlay(message.id, message.text)}
                              className="flex items-center gap-2 px-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-full hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-sm text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 hover-lift voice-button"
                            >
                              {currentlyPlaying === message.id ? (
                                <Pause className="w-4 h-4" />
                              ) : (
                                <Play className="w-4 h-4" />
                              )}
                              <Volume2 className="w-4 h-4" />
                              <span>Listen</span>
                            </button>
                          </div>
                        )}
                        
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>

                      {message.isUser && (
                        <div className="w-8 h-8 bg-gradient-to-r from-emerald-400 to-blue-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1 animate-heart-beat">
                          <User className="w-4 h-4 text-white" />
                        </div>
                      )}
                    </div>

                    {/* Virtual Pediatrician for health-related messages */}
                    {!message.isUser && message.category === 'Health' && apiStatus.tavus && (
                      <div className="mt-4 animate-slide-in-left">
                        <VirtualPediatrician
                          message={message.text}
                          urgency={EnhancedAIService.determineUrgency(message.text)}
                          onVideoGenerated={handleVideoGenerated}
                        />
                      </div>
                    )}
                  </div>
                ))}
                
                {/* Loading Indicator */}
                {isLoading && (
                  <div className="flex gap-3 justify-start animate-fade-in">
                    <div className="w-8 h-8 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0 animate-pulse-glow">
                      <Brain className="w-4 h-4 text-white" />
                    </div>
                    <div className="bg-gray-100 dark:bg-gray-800 rounded-2xl rounded-bl-md px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="typing-indicator">
                          <div className="typing-dot bg-indigo-400 dark:bg-indigo-500"></div>
                          <div className="typing-dot bg-purple-400 dark:bg-purple-500"></div>
                          <div className="typing-dot bg-blue-400 dark:bg-blue-500"></div>
                        </div>
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          {isOnlineMode ? 'Analyzing & searching latest research...' : 'Processing your parenting question...'}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={chatEndRef} />
              </div>

              {/* Input Area */}
              <div className="border-t border-gray-100 dark:border-gray-700 p-4 bg-gray-50/50 dark:bg-gray-800/50">
                {/* Voice Assistant */}
                {(apiStatus.elevenlabs || true) && (
                  <div className="mb-3 flex justify-center">
                    <VoiceAssistant
                      onVoiceInput={handleVoiceInput}
                      onVoiceResponse={handleVoiceResponse}
                      isProcessing={isLoading}
                    />
                  </div>
                )}

                <form onSubmit={handleSubmit} className="flex gap-3">
                  <div className="flex-1 relative">
                    <input
                      type="text"
                      value={inputText}
                      onChange={(e) => setInputText(e.target.value)}
                      placeholder={isOnlineMode 
                        ? "Ask me anything about parenting - I'll help with practical advice..."
                        : "Ask about sleep, behavior, feeding, development, safety, or any parenting concern..."
                      }
                      className="w-full px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 transition-all duration-200"
                      disabled={isLoading}
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={!inputText.trim() || isLoading}
                    className="px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl hover:from-indigo-600 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center gap-2 transform hover:scale-[1.02] active:scale-[0.98] hover-glow"
                  >
                    <Send className="w-4 h-4" />
                    <span className="hidden sm:inline">Send</span>
                  </button>
                </form>
              </div>
            </div>

            {/* Quick Topic Buttons */}
            <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-3">
              {quickTopics.slice(0, 4).map((topic, index) => (
                <button
                  key={index}
                  onClick={() => setInputText(topic.query)}
                  className="topic-button flex items-center gap-2 p-3 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-indigo-300 dark:hover:border-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-all text-sm"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <span className="text-lg emoji-wiggle">{topic.icon}</span>
                  <span className="text-gray-700 dark:text-gray-300">{topic.text}</span>
                </button>
              ))}
            </div>

            {/* More Topics */}
            <div className="mt-3 grid grid-cols-2 md:grid-cols-4 gap-3">
              {quickTopics.slice(4).map((topic, index) => (
                <button
                  key={index + 4}
                  onClick={() => setInputText(topic.query)}
                  className="topic-button flex items-center gap-2 p-3 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-indigo-300 dark:hover:border-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-all text-sm"
                  style={{ animationDelay: `${(index + 4) * 0.1}s` }}
                >
                  <span className="text-lg emoji-wiggle">{topic.icon}</span>
                  <span className="text-gray-700 dark:text-gray-300">{topic.text}</span>
                </button>
              ))}
            </div>

            {/* API Setup Notice */}
            {!isOnlineMode && (
              <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-200 dark:border-blue-800 rounded-xl animate-slide-in-left">
                <div className="flex items-start gap-3">
                  <Brain className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5 animate-gentle-bounce" />
                  <div>
                    <h3 className="font-semibold text-blue-800 dark:text-blue-300 mb-1">🚀 Unlock Enhanced Features</h3>
                    <p className="text-blue-700 dark:text-blue-300 text-sm mb-2">
                      Get the full ParentGPT experience with these premium integrations:
                    </p>
                    <ul className="text-blue-700 dark:text-blue-300 text-sm space-y-1">
                      <li>• <strong>Enhanced AI</strong> - Advanced reasoning with multiple providers</li>
                      <li>• <strong>Smart Search</strong> - Real-time access to latest parenting research</li>
                      <li>• <strong>Voice Assistant</strong> - Natural conversations with premium TTS</li>
                      <li>• <strong>Virtual Pediatrician</strong> - AI-generated video guidance</li>
                      <li>• <strong>Smart Tracking</strong> - Comprehensive wellness monitoring</li>
                    </ul>
                    <p className="text-blue-600 dark:text-blue-400 text-xs mt-2">
                      See .env.example for setup instructions. I'm already providing great support with offline knowledge!
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bolt.new Badge */}
      <BoltBadge />
    </div>
  );
}

export default App;