import { ChatSession, Message } from '../types/chat';

export class ChatStorageService {
  private static readonly STORAGE_KEY = 'parentgpt_chat_sessions';
  private static readonly CURRENT_SESSION_KEY = 'parentgpt_current_session';

  static getAllSessions(): ChatSession[] {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (!stored) return [];
      
      const sessions = JSON.parse(stored) as ChatSession[];
      // Sort by most recently updated
      return sessions.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
    } catch (error) {
      console.error('Error loading chat sessions:', error);
      return [];
    }
  }

  static getSession(sessionId: string): ChatSession | null {
    const sessions = this.getAllSessions();
    return sessions.find(session => session.id === sessionId) || null;
  }

  static saveSession(session: ChatSession): void {
    try {
      const sessions = this.getAllSessions();
      const existingIndex = sessions.findIndex(s => s.id === session.id);
      
      if (existingIndex >= 0) {
        sessions[existingIndex] = session;
      } else {
        sessions.unshift(session); // Add new sessions to the beginning
      }
      
      // Keep only the last 50 sessions to prevent storage bloat
      const limitedSessions = sessions.slice(0, 50);
      
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(limitedSessions));
    } catch (error) {
      console.error('Error saving chat session:', error);
    }
  }

  static deleteSession(sessionId: string): void {
    try {
      const sessions = this.getAllSessions();
      const filteredSessions = sessions.filter(session => session.id !== sessionId);
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(filteredSessions));
    } catch (error) {
      console.error('Error deleting chat session:', error);
    }
  }

  static createNewSession(): ChatSession {
    const now = new Date().toISOString();
    return {
      id: `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      title: 'New Conversation',
      messages: [],
      createdAt: now,
      updatedAt: now,
      messageCount: 0
    };
  }

  static updateSessionTitle(sessionId: string, title: string): void {
    try {
      const sessions = this.getAllSessions();
      const sessionIndex = sessions.findIndex(s => s.id === sessionId);
      
      if (sessionIndex >= 0) {
        sessions[sessionIndex].title = title;
        sessions[sessionIndex].updatedAt = new Date().toISOString();
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(sessions));
      }
    } catch (error) {
      console.error('Error updating session title:', error);
    }
  }

  static generateSessionTitle(firstMessage: string): string {
    // Extract key topics from the first user message
    const message = firstMessage.toLowerCase();
    
    if (message.includes('sleep') || message.includes('bedtime') || message.includes('nap')) {
      return '💤 Sleep Help';
    }
    if (message.includes('feed') || message.includes('eat') || message.includes('food') || message.includes('nutrition')) {
      return '🍼 Feeding Questions';
    }
    if (message.includes('behavior') || message.includes('tantrum') || message.includes('discipline')) {
      return '🎭 Behavior Support';
    }
    if (message.includes('develop') || message.includes('milestone') || message.includes('learn')) {
      return '🌱 Development';
    }
    if (message.includes('potty') || message.includes('toilet')) {
      return '🚽 Potty Training';
    }
    if (message.includes('health') || message.includes('sick') || message.includes('doctor')) {
      return '🏥 Health Concerns';
    }
    if (message.includes('safe') || message.includes('danger')) {
      return '🛡️ Safety Questions';
    }
    if (message.includes('school') || message.includes('education')) {
      return '🎓 School & Learning';
    }
    
    // Fallback: use first few words
    const words = firstMessage.split(' ').slice(0, 3).join(' ');
    return words.length > 20 ? words.substring(0, 20) + '...' : words;
  }

  static getCurrentSessionId(): string | null {
    return localStorage.getItem(this.CURRENT_SESSION_KEY);
  }

  static setCurrentSessionId(sessionId: string): void {
    localStorage.setItem(this.CURRENT_SESSION_KEY, sessionId);
  }

  static clearCurrentSession(): void {
    localStorage.removeItem(this.CURRENT_SESSION_KEY);
  }
}