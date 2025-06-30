import React, { useState } from 'react';
import { 
  Settings, 
  User, 
  Bell, 
  Shield, 
  Palette, 
  Volume2, 
  Globe, 
  Database,
  Key,
  Info,
  Save,
  RefreshCw,
  Download,
  Upload,
  Trash2
} from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

interface SettingsPanelProps {
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
  onExportData: () => void;
  onImportData: (file: File) => void;
  onClearData: () => void;
}

export function SettingsPanel({ 
  apiStatus, 
  user, 
  onExportData, 
  onImportData, 
  onClearData 
}: SettingsPanelProps) {
  const [activeSection, setActiveSection] = useState<'profile' | 'apis' | 'notifications' | 'privacy' | 'data'>('profile');
  const [notifications, setNotifications] = useState({
    feeding: true,
    sleep: true,
    appointments: true,
    milestones: true,
    wellness: false
  });
  const [voiceSettings, setVoiceSettings] = useState({
    autoPlay: false,
    speed: 1.0,
    voice: 'default'
  });
  const { theme, toggleTheme } = useTheme();

  const settingSections = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'apis', label: 'API Keys', icon: Key },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'privacy', label: 'Privacy', icon: Shield },
    { id: 'data', label: 'Data', icon: Database }
  ];

  const handleFileImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      onImportData(file);
    }
  };

  const getApiStatusColor = (isConfigured: boolean) => {
    return isConfigured 
      ? 'text-green-600 dark:text-green-400' 
      : 'text-red-600 dark:text-red-400';
  };

  const getApiStatusText = (isConfigured: boolean) => {
    return isConfigured ? 'Connected' : 'Not configured';
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-r from-gray-500 to-gray-600 rounded-full flex items-center justify-center">
            <Settings className="w-4 h-4 text-white" />
          </div>
          <div>
            <h2 className="font-semibold text-gray-800 dark:text-gray-200">Settings</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">Customize your ParentGPT experience</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="grid grid-cols-2 gap-2">
          {settingSections.map((section) => {
            const Icon = section.icon;
            return (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id as any)}
                className={`
                  flex items-center gap-2 p-2 rounded-lg text-sm transition-all
                  ${activeSection === section.id
                    ? 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                  }
                `}
              >
                <Icon className="w-4 h-4" />
                <span>{section.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 p-4 overflow-y-auto">
        {activeSection === 'profile' && (
          <div className="space-y-6">
            <div>
              <h3 className="font-medium text-gray-800 dark:text-gray-200 mb-3">User Profile</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Display Name
                  </label>
                  <input
                    type="text"
                    defaultValue={user?.email || 'Anonymous User'}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Parenting Experience
                  </label>
                  <select className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100">
                    <option>First-time parent</option>
                    <option>Experienced parent</option>
                    <option>Very experienced parent</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Primary Concerns
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {['Sleep', 'Feeding', 'Behavior', 'Development', 'Health', 'Safety'].map((concern) => (
                      <label key={concern} className="flex items-center gap-2">
                        <input type="checkbox" className="rounded" />
                        <span className="text-sm text-gray-700 dark:text-gray-300">{concern}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h3 className="font-medium text-gray-800 dark:text-gray-200 mb-3">Appearance</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Theme</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Choose your preferred color scheme</p>
                  </div>
                  <button
                    onClick={toggleTheme}
                    className={`
                      flex items-center gap-2 px-3 py-2 rounded-lg transition-all
                      ${theme === 'dark' 
                        ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300' 
                        : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300'
                      }
                    `}
                  >
                    <Palette className="w-4 h-4" />
                    <span className="text-sm">{theme === 'dark' ? 'Dark' : 'Light'}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeSection === 'apis' && (
          <div className="space-y-6">
            <div>
              <h3 className="font-medium text-gray-800 dark:text-gray-200 mb-3">API Configuration</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Configure your API keys to unlock advanced features. See .env.example for setup instructions.
              </p>
            </div>

            <div className="space-y-4">
              <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                <h4 className="font-medium text-blue-800 dark:text-blue-300 mb-2">AI Providers</h4>
                <div className="space-y-2">
                  {[
                    { key: 'anthropic', name: 'Anthropic Claude', desc: 'Best for empathetic responses' },
                    { key: 'groq', name: 'Groq', desc: 'Lightning-fast responses' },
                    { key: 'together', name: 'Together AI', desc: 'Multiple models available' },
                    { key: 'deepseek', name: 'DeepSeek', desc: 'Advanced reasoning capabilities' }
                  ].map((provider) => (
                    <div key={provider.key} className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-700 dark:text-gray-300">{provider.name}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{provider.desc}</p>
                      </div>
                      <span className={`text-sm ${getApiStatusColor(apiStatus[provider.key as keyof typeof apiStatus])}`}>
                        {getApiStatusText(apiStatus[provider.key as keyof typeof apiStatus])}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg">
                <h4 className="font-medium text-purple-800 dark:text-purple-300 mb-2">Advanced Features</h4>
                <div className="space-y-2">
                  {[
                    { key: 'elevenlabs', name: 'ElevenLabs Voice', desc: 'Premium text-to-speech' },
                    { key: 'tavus', name: 'Tavus Video', desc: 'Virtual pediatrician videos' },
                    { key: 'supabase', name: 'Supabase Database', desc: 'Tracking and reminders' },
                    { key: 'serper', name: 'Serper Search', desc: 'Real-time web search' }
                  ].map((service) => (
                    <div key={service.key} className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-700 dark:text-gray-300">{service.name}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{service.desc}</p>
                      </div>
                      <span className={`text-sm ${getApiStatusColor(apiStatus[service.key as keyof typeof apiStatus])}`}>
                        {getApiStatusText(apiStatus[service.key as keyof typeof apiStatus])}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <Info className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mt-0.5" />
                <div>
                  <h4 className="font-medium text-yellow-800 dark:text-yellow-300">Setup Instructions</h4>
                  <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
                    Add your API keys to the .env file to enable these features. The app works great with offline knowledge even without API keys!
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeSection === 'notifications' && (
          <div className="space-y-6">
            <div>
              <h3 className="font-medium text-gray-800 dark:text-gray-200 mb-3">Notification Preferences</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Choose which reminders and alerts you'd like to receive.
              </p>
            </div>

            <div className="space-y-4">
              {Object.entries(notifications).map(([key, enabled]) => (
                <div key={key} className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300 capitalize">
                      {key.replace(/([A-Z])/g, ' $1').trim()} Reminders
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Get notified about {key} schedules and milestones
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={enabled}
                      onChange={(e) => setNotifications(prev => ({ ...prev, [key]: e.target.checked }))}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                  </label>
                </div>
              ))}
            </div>

            <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
              <h4 className="font-medium text-gray-800 dark:text-gray-200 mb-3">Voice Settings</h4>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Auto-play responses</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Automatically play voice responses</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={voiceSettings.autoPlay}
                      onChange={(e) => setVoiceSettings(prev => ({ ...prev, autoPlay: e.target.checked }))}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                  </label>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Speech Speed: {voiceSettings.speed}x
                  </label>
                  <input
                    type="range"
                    min="0.5"
                    max="2"
                    step="0.1"
                    value={voiceSettings.speed}
                    onChange={(e) => setVoiceSettings(prev => ({ ...prev, speed: parseFloat(e.target.value) }))}
                    className="w-full"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {activeSection === 'privacy' && (
          <div className="space-y-6">
            <div>
              <h3 className="font-medium text-gray-800 dark:text-gray-200 mb-3">Privacy & Security</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Your privacy is important to us. Here's how we protect your data.
              </p>
            </div>

            <div className="space-y-4">
              <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                <h4 className="font-medium text-green-800 dark:text-green-300 mb-2">🔒 Privacy-First Design</h4>
                <ul className="text-sm text-green-700 dark:text-green-300 space-y-1">
                  <li>• All chat data is stored locally in your browser</li>
                  <li>• No personal data is sent to our servers</li>
                  <li>• API calls are made directly from your browser</li>
                  <li>• You control all your data and can delete it anytime</li>
                </ul>
              </div>

              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                <h4 className="font-medium text-blue-800 dark:text-blue-300 mb-2">🛡️ Data Security</h4>
                <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
                  <li>• End-to-end encryption for API communications</li>
                  <li>• No tracking or analytics cookies</li>
                  <li>• Open-source codebase for transparency</li>
                  <li>• Regular security updates and patches</li>
                </ul>
              </div>

              <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                <h4 className="font-medium text-yellow-800 dark:text-yellow-300 mb-2">⚠️ Important Notes</h4>
                <ul className="text-sm text-yellow-700 dark:text-yellow-300 space-y-1">
                  <li>• ParentGPT is not a replacement for professional medical advice</li>
                  <li>• Always consult healthcare providers for medical concerns</li>
                  <li>• Use your parental judgment alongside AI guidance</li>
                  <li>• Emergency situations require immediate professional help</li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {activeSection === 'data' && (
          <div className="space-y-6">
            <div>
              <h3 className="font-medium text-gray-800 dark:text-gray-200 mb-3">Data Management</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Manage your chat history, tracking data, and preferences.
              </p>
            </div>

            <div className="space-y-4">
              <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                <h4 className="font-medium text-gray-800 dark:text-gray-200 mb-3">Export & Import</h4>
                <div className="space-y-3">
                  <button
                    onClick={onExportData}
                    className="flex items-center gap-2 w-full px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                  >
                    <Download className="w-4 h-4" />
                    <span>Export All Data</span>
                  </button>
                  
                  <label className="flex items-center gap-2 w-full px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors cursor-pointer">
                    <Upload className="w-4 h-4" />
                    <span>Import Data</span>
                    <input
                      type="file"
                      accept=".json"
                      onChange={handleFileImport}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>

              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                <h4 className="font-medium text-red-800 dark:text-red-300 mb-2">⚠️ Danger Zone</h4>
                <p className="text-sm text-red-700 dark:text-red-300 mb-3">
                  These actions cannot be undone. Please be careful.
                </p>
                <button
                  onClick={onClearData}
                  className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Clear All Data</span>
                </button>
              </div>

              <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                <h4 className="font-medium text-blue-800 dark:text-blue-300 mb-2">📊 Storage Usage</h4>
                <div className="space-y-2 text-sm text-blue-700 dark:text-blue-300">
                  <div className="flex justify-between">
                    <span>Chat Sessions:</span>
                    <span>{localStorage.getItem('parentgpt_chat_sessions') ? JSON.parse(localStorage.getItem('parentgpt_chat_sessions')!).length : 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Storage Used:</span>
                    <span>{Math.round((JSON.stringify(localStorage).length / 1024))} KB</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700">
        <button className="flex items-center gap-2 w-full px-4 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 transition-colors">
          <Save className="w-4 h-4" />
          <span>Save Settings</span>
        </button>
      </div>
    </div>
  );
}