export interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: string;
  category?: string;
  hasWebSearch?: boolean;
  isOnlineResponse?: boolean;
}

export interface ChatSession {
  id: string;
  title: string;
  messages: Message[];
  createdAt: string;
  updatedAt: string;
  messageCount: number;
}