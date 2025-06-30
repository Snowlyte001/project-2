import { useState } from 'react';
import { 
  MessageCircle, 
  Settings, 
  BarChart3, 
  Baby, 
  Brain, 
  X, 
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { ChatSidebar } from './ChatSidebar';
import { SettingsPanel } from './SettingsPanel';
import { TrackingPanel } from './TrackingPanel';
import { ChatSession } from '../types/chat';

interface MainSidebarProps {
  // Chat props
  sessions: ChatSession[];
  currentSessionId: string | null;
  onSessionSelect: (sessionId: string) => void;
  onNewChat: () => void;
  onDeleteSession: (sessionId: string) => void;
  
  // Settings props
  apiStatus: {
    serper: boolean;
    anthropic: boolean;
    groq: boolean;
    together: boolean;
    deepseek: boolean;
    elevenlabs: boolean;
    tavus: boolean;
    supabase: boolean;
  };
  user: any;
  children: any[];
  
  // UI props
  isOpen: boolean;
  onToggle: () => void;
  
  // Data management
  onExportData: () => void;
  onImportData: (file: File) => void;
  onClearData: () => void;
}

type SidebarView = 'chats' | 'tracking' | 'settings';

export function MainSidebar({
  sessions,
  currentSessionId,
  onSessionSelect,
  onNewChat,
  onDeleteSession,
  apiStatus,
  user,
  children,
  isOpen,
  onToggle,
  onExportData,
  onImportData,
  onClearData
}: MainSidebarProps) {
  const [currentView, setCurrentView] = useState<SidebarView>('chats');
  const [isCollapsed, setIsCollapsed] = useState(false);

  const sidebarViews = [
    { id: 'chats', label: 'Chats', icon: MessageCircle, count: sessions.length },
    { id: 'tracking', label: 'Tracking', icon: BarChart3, available: apiStatus.supabase },
    { id: 'settings', label: 'Settings', icon: Settings }
  ];

  const getViewContent = () => {
    switch (currentView) {
      case 'chats':
        return (
          <ChatSidebar
            sessions={sessions}
            currentSessionId={currentSessionId}
            onSessionSelect={onSessionSelect}
            onNewChat={onNewChat}
            onDeleteSession={onDeleteSession}
            isOpen={true}
            onToggle={() => {}}
            embedded={true}
          />
        );
      
      case 'tracking':
        if (!apiStatus.supabase || !user) {
          return (
            <div className="p-4 text-center">
              <Baby className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                Tracking requires Supabase
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-500">
                Configure Supabase to enable tracking features
              </p>
            </div>
          );
        }
        return (
          <TrackingPanel
            userId={user.id}
            children={children}
          />
        );
      
      case 'settings':
        return (
          <SettingsPanel
            apiStatus={apiStatus}
            user={user}
            onExportData={onExportData}
            onImportData={onImportData}
            onClearData={onClearData}
          />
        );
      
      default:
        return null;
    }
  };

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onToggle}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed top-0 left-0 h-full bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 z-50 
        transform transition-all duration-300 ease-in-out flex
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:relative lg:translate-x-0
        ${isCollapsed ? 'w-16' : 'w-80'}
      `}>
        
        {/* Navigation Rail */}
        <div className={`
          ${isCollapsed ? 'w-16' : 'w-16'} 
          bg-gray-50 dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 
          flex flex-col items-center py-4 space-y-2
        `}>
          {/* Logo */}
          <div className="w-10 h-10 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full flex items-center justify-center mb-4">
            <Brain className="w-5 h-5 text-white" />
          </div>

          {/* Navigation Items */}
          {sidebarViews.map((view) => {
            const Icon = view.icon;
            const isActive = currentView === view.id;
            const isAvailable = view.available !== false;
            
            return (
              <button
                key={view.id}
                onClick={() => isAvailable && setCurrentView(view.id as SidebarView)}
                disabled={!isAvailable}
                className={`
                  relative w-12 h-12 rounded-xl flex items-center justify-center transition-all
                  ${isActive 
                    ? 'bg-indigo-500 text-white shadow-lg' 
                    : isAvailable
                      ? 'text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                      : 'text-gray-400 dark:text-gray-600 cursor-not-allowed'
                  }
                `}
                title={view.label}
              >
                <Icon className="w-5 h-5" />
                {view.count !== undefined && view.count > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                    {view.count > 99 ? '99+' : view.count}
                  </span>
                )}
                {!isAvailable && (
                  <div className="absolute inset-0 bg-gray-200 dark:bg-gray-700 rounded-xl opacity-50" />
                )}
              </button>
            );
          })}

          {/* Spacer */}
          <div className="flex-1" />

          {/* Collapse Toggle */}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="w-12 h-12 rounded-xl flex items-center justify-center text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 transition-all"
            title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {isCollapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
          </button>

          {/* Mobile Close */}
          <button
            onClick={onToggle}
            className="lg:hidden w-12 h-12 rounded-xl flex items-center justify-center text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Panel */}
        {!isCollapsed && (
          <div className="flex-1 flex flex-col min-w-0">
            {getViewContent()}
          </div>
        )}
      </div>
    </>
  );
}