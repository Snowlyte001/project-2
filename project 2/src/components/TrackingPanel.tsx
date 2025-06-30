import React, { useState, useEffect } from 'react';
import { Plus, Clock, Baby, Heart, Calendar, CheckCircle } from 'lucide-react';
import { TrackingService, type TrackingEntry, type Reminder } from '../services/trackingService';
import { format } from 'date-fns';

interface TrackingPanelProps {
  userId: string;
  children: Array<{ id: string; name: string; age_category: string }>;
}

export function TrackingPanel({ userId, children }: TrackingPanelProps) {
  const [activeTab, setActiveTab] = useState<'track' | 'reminders' | 'stats'>('track');
  const [selectedChild, setSelectedChild] = useState<string>(children[0]?.id || '');
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [recentEntries, setRecentEntries] = useState<TrackingEntry[]>([]);
  const [showQuickTrack, setShowQuickTrack] = useState(false);

  useEffect(() => {
    loadReminders();
    loadRecentEntries();
  }, [userId]);

  const loadReminders = async () => {
    const upcomingReminders = await TrackingService.getUpcomingReminders(userId);
    setReminders(upcomingReminders);
  };

  const loadRecentEntries = async () => {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    const entries = await TrackingService.getTrackingEntries(userId, yesterday, today);
    setRecentEntries(entries);
  };

  const quickTrackFeeding = async (type: 'breast' | 'bottle' | 'solid') => {
    if (!selectedChild) return;

    await TrackingService.trackFeeding(
      userId,
      selectedChild,
      { type },
      `Quick tracked ${type} feeding`
    );
    
    loadRecentEntries();
    setShowQuickTrack(false);
  };

  const quickTrackSleep = async (type: 'nap' | 'night_sleep') => {
    if (!selectedChild) return;

    await TrackingService.trackSleep(
      userId,
      selectedChild,
      {
        type,
        start_time: new Date().toISOString(),
        quality: 'good'
      },
      `Quick tracked ${type}`
    );
    
    loadRecentEntries();
    setShowQuickTrack(false);
  };

  const quickTrackDiaper = async (type: 'wet' | 'dirty') => {
    if (!selectedChild) return;

    await TrackingService.trackDiaper(
      userId,
      selectedChild,
      { type },
      `Quick tracked ${type} diaper`
    );
    
    loadRecentEntries();
    setShowQuickTrack(false);
  };

  const trackParentMood = async (mood: 'stressed' | 'tired' | 'content' | 'happy') => {
    await TrackingService.trackParentMood(
      userId,
      {
        mood,
        energy_level: 3,
        support_needed: mood === 'stressed' || mood === 'tired'
      },
      'Quick mood check-in'
    );
    
    loadRecentEntries();
  };

  const completeReminder = async (reminderId: string) => {
    await TrackingService.completeReminder(reminderId);
    loadReminders();
  };

  const getEntryIcon = (type: string) => {
    switch (type) {
      case 'feeding': return '🍼';
      case 'sleep': return '😴';
      case 'diaper': return '👶';
      case 'parent_mood': return '💝';
      default: return '📝';
    }
  };

  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-pink-500 to-purple-600 p-4">
        <h2 className="text-xl font-semibold text-white mb-2">Parenting Tracker</h2>
        <div className="flex gap-2">
          {['track', 'reminders', 'stats'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as any)}
              className={`
                px-3 py-1 rounded-full text-sm transition-all
                ${activeTab === tab 
                  ? 'bg-white text-purple-600' 
                  : 'bg-white/20 text-white hover:bg-white/30'
                }
              `}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        {activeTab === 'track' && (
          <div className="space-y-4">
            {/* Child Selector */}
            {children.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Select Child
                </label>
                <select
                  value={selectedChild}
                  onChange={(e) => setSelectedChild(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                >
                  {children.map((child) => (
                    <option key={child.id} value={child.id}>
                      {child.name} ({child.age_category})
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Quick Track Buttons */}
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setShowQuickTrack(!showQuickTrack)}
                className="flex items-center gap-2 p-3 bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-700 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors"
              >
                <Plus className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <span className="text-blue-700 dark:text-blue-300 text-sm font-medium">Quick Track</span>
              </button>

              <button
                onClick={() => trackParentMood('content')}
                className="flex items-center gap-2 p-3 bg-pink-50 dark:bg-pink-900/30 border border-pink-200 dark:border-pink-700 rounded-lg hover:bg-pink-100 dark:hover:bg-pink-900/50 transition-colors"
              >
                <Heart className="w-4 h-4 text-pink-600 dark:text-pink-400" />
                <span className="text-pink-700 dark:text-pink-300 text-sm font-medium">Mood Check</span>
              </button>
            </div>

            {/* Quick Track Options */}
            {showQuickTrack && (
              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 space-y-3">
                <h3 className="font-medium text-gray-800 dark:text-gray-200">Quick Track Options</h3>
                
                <div className="grid grid-cols-3 gap-2">
                  <button
                    onClick={() => quickTrackFeeding('breast')}
                    className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded text-xs text-blue-700 dark:text-blue-300 hover:bg-blue-200 dark:hover:bg-blue-900/50"
                  >
                    🤱 Breastfeed
                  </button>
                  <button
                    onClick={() => quickTrackFeeding('bottle')}
                    className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded text-xs text-blue-700 dark:text-blue-300 hover:bg-blue-200 dark:hover:bg-blue-900/50"
                  >
                    🍼 Bottle
                  </button>
                  <button
                    onClick={() => quickTrackFeeding('solid')}
                    className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded text-xs text-blue-700 dark:text-blue-300 hover:bg-blue-200 dark:hover:bg-blue-900/50"
                  >
                    🥄 Solids
                  </button>
                  <button
                    onClick={() => quickTrackSleep('nap')}
                    className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded text-xs text-purple-700 dark:text-purple-300 hover:bg-purple-200 dark:hover:bg-purple-900/50"
                  >
                    😴 Nap
                  </button>
                  <button
                    onClick={() => quickTrackSleep('night_sleep')}
                    className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded text-xs text-purple-700 dark:text-purple-300 hover:bg-purple-200 dark:hover:bg-purple-900/50"
                  >
                    🌙 Sleep
                  </button>
                  <button
                    onClick={() => quickTrackDiaper('wet')}
                    className="p-2 bg-green-100 dark:bg-green-900/30 rounded text-xs text-green-700 dark:text-green-300 hover:bg-green-200 dark:hover:bg-green-900/50"
                  >
                    💧 Wet
                  </button>
                </div>
              </div>
            )}

            {/* Recent Entries */}
            <div>
              <h3 className="font-medium text-gray-800 dark:text-gray-200 mb-3">Recent Activity</h3>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {recentEntries.map((entry) => (
                  <div key={entry.id} className="flex items-center gap-3 p-2 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <span className="text-lg">{getEntryIcon(entry.entry_type)}</span>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-800 dark:text-gray-200">
                        {entry.entry_type.charAt(0).toUpperCase() + entry.entry_type.slice(1)}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {format(new Date(entry.created_at!), 'MMM d, h:mm a')}
                      </p>
                    </div>
                  </div>
                ))}
                {recentEntries.length === 0 && (
                  <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">
                    No recent activity. Start tracking to see your entries here!
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'reminders' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-medium text-gray-800 dark:text-gray-200">Upcoming Reminders</h3>
              <Calendar className="w-5 h-5 text-gray-500 dark:text-gray-400" />
            </div>

            <div className="space-y-2">
              {reminders.map((reminder) => (
                <div key={reminder.id} className="flex items-center gap-3 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                  <Clock className="w-4 h-4 text-yellow-600 dark:text-yellow-400" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-800 dark:text-gray-200">
                      {reminder.title}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {format(new Date(reminder.scheduled_time), 'MMM d, h:mm a')}
                    </p>
                  </div>
                  <button
                    onClick={() => completeReminder(reminder.id!)}
                    className="p-1 text-green-600 dark:text-green-400 hover:bg-green-100 dark:hover:bg-green-900/30 rounded"
                  >
                    <CheckCircle className="w-4 h-4" />
                  </button>
                </div>
              ))}
              {reminders.length === 0 && (
                <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">
                  No upcoming reminders. You're all caught up! 🎉
                </p>
              )}
            </div>
          </div>
        )}

        {activeTab === 'stats' && (
          <div className="space-y-4">
            <h3 className="font-medium text-gray-800 dark:text-gray-200">Weekly Summary</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
                <p className="text-sm font-medium text-blue-700 dark:text-blue-300">Feedings</p>
                <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {recentEntries.filter(e => e.entry_type === 'feeding').length}
                </p>
                <p className="text-xs text-blue-600 dark:text-blue-400">This week</p>
              </div>
              
              <div className="bg-purple-50 dark:bg-purple-900/20 p-3 rounded-lg">
                <p className="text-sm font-medium text-purple-700 dark:text-purple-300">Sleep Sessions</p>
                <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                  {recentEntries.filter(e => e.entry_type === 'sleep').length}
                </p>
                <p className="text-xs text-purple-600 dark:text-purple-400">This week</p>
              </div>
            </div>

            <div className="bg-pink-50 dark:bg-pink-900/20 p-3 rounded-lg">
              <p className="text-sm font-medium text-pink-700 dark:text-pink-300">Parent Wellness</p>
              <p className="text-sm text-pink-600 dark:text-pink-400">
                {recentEntries.filter(e => e.entry_type === 'parent_mood').length} mood check-ins this week
              </p>
              <p className="text-xs text-pink-600 dark:text-pink-400">
                Remember to take care of yourself too! 💝
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}