import { supabase } from '../lib/supabase';
import { format, startOfDay, endOfDay } from 'date-fns';

export interface TrackingEntry {
  id?: string;
  user_id: string;
  child_id?: string;
  entry_type: 'feeding' | 'sleep' | 'diaper' | 'mood' | 'milestone' | 'parent_mood';
  entry_data: any;
  notes?: string;
  created_at?: string;
}

export interface Reminder {
  id?: string;
  user_id: string;
  child_id?: string;
  title: string;
  description?: string;
  reminder_type: 'feeding' | 'medication' | 'appointment' | 'milestone_check' | 'self_care';
  scheduled_time: string;
  is_completed: boolean;
  created_at?: string;
}

export class TrackingService {
  // Add tracking entry
  static async addTrackingEntry(entry: TrackingEntry): Promise<TrackingEntry | null> {
    try {
      const { data, error } = await supabase
        .from('tracking_entries')
        .insert([entry])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error adding tracking entry:', error);
      return null;
    }
  }

  // Get tracking entries for a date range
  static async getTrackingEntries(
    userId: string,
    startDate: Date,
    endDate: Date,
    entryType?: string
  ): Promise<TrackingEntry[]> {
    try {
      let query = supabase
        .from('tracking_entries')
        .select('*')
        .eq('user_id', userId)
        .gte('created_at', startOfDay(startDate).toISOString())
        .lte('created_at', endOfDay(endDate).toISOString())
        .order('created_at', { ascending: false });

      if (entryType) {
        query = query.eq('entry_type', entryType);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching tracking entries:', error);
      return [];
    }
  }

  // Add reminder
  static async addReminder(reminder: Reminder): Promise<Reminder | null> {
    try {
      const { data, error } = await supabase
        .from('reminders')
        .insert([reminder])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error adding reminder:', error);
      return null;
    }
  }

  // Get upcoming reminders
  static async getUpcomingReminders(userId: string): Promise<Reminder[]> {
    try {
      const { data, error } = await supabase
        .from('reminders')
        .select('*')
        .eq('user_id', userId)
        .eq('is_completed', false)
        .gte('scheduled_time', new Date().toISOString())
        .order('scheduled_time', { ascending: true })
        .limit(10);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching reminders:', error);
      return [];
    }
  }

  // Mark reminder as completed
  static async completeReminder(reminderId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('reminders')
        .update({ is_completed: true })
        .eq('id', reminderId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error completing reminder:', error);
      return false;
    }
  }

  // Quick tracking helpers
  static async trackFeeding(
    userId: string,
    childId: string,
    feedingData: {
      type: 'breast' | 'bottle' | 'solid';
      amount?: number;
      duration?: number;
      side?: 'left' | 'right' | 'both';
    },
    notes?: string
  ): Promise<TrackingEntry | null> {
    return this.addTrackingEntry({
      user_id: userId,
      child_id: childId,
      entry_type: 'feeding',
      entry_data: feedingData,
      notes
    });
  }

  static async trackSleep(
    userId: string,
    childId: string,
    sleepData: {
      type: 'nap' | 'night_sleep';
      start_time: string;
      end_time?: string;
      duration?: number;
      quality: 'poor' | 'fair' | 'good' | 'excellent';
    },
    notes?: string
  ): Promise<TrackingEntry | null> {
    return this.addTrackingEntry({
      user_id: userId,
      child_id: childId,
      entry_type: 'sleep',
      entry_data: sleepData,
      notes
    });
  }

  static async trackDiaper(
    userId: string,
    childId: string,
    diaperData: {
      type: 'wet' | 'dirty' | 'both';
      consistency?: 'liquid' | 'soft' | 'normal' | 'hard';
      color?: string;
    },
    notes?: string
  ): Promise<TrackingEntry | null> {
    return this.addTrackingEntry({
      user_id: userId,
      child_id: childId,
      entry_type: 'diaper',
      entry_data: diaperData,
      notes
    });
  }

  static async trackParentMood(
    userId: string,
    moodData: {
      mood: 'stressed' | 'tired' | 'overwhelmed' | 'content' | 'happy' | 'anxious';
      energy_level: 1 | 2 | 3 | 4 | 5;
      support_needed: boolean;
    },
    notes?: string
  ): Promise<TrackingEntry | null> {
    return this.addTrackingEntry({
      user_id: userId,
      entry_type: 'parent_mood',
      entry_data: moodData,
      notes
    });
  }

  // Analytics helpers
  static async getFeedingStats(userId: string, childId: string, days: number = 7): Promise<any> {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    
    const entries = await this.getTrackingEntries(userId, startDate, new Date(), 'feeding');
    
    return {
      totalFeedings: entries.length,
      averagePerDay: entries.length / days,
      breastFeedings: entries.filter(e => e.entry_data.type === 'breast').length,
      bottleFeedings: entries.filter(e => e.entry_data.type === 'bottle').length,
      solidFeedings: entries.filter(e => e.entry_data.type === 'solid').length
    };
  }

  static async getSleepStats(userId: string, childId: string, days: number = 7): Promise<any> {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    
    const entries = await this.getTrackingEntries(userId, startDate, new Date(), 'sleep');
    
    const totalSleep = entries.reduce((sum, entry) => {
      return sum + (entry.entry_data.duration || 0);
    }, 0);

    return {
      totalSleepHours: totalSleep / 60, // Convert minutes to hours
      averageSleepPerDay: (totalSleep / 60) / days,
      napCount: entries.filter(e => e.entry_data.type === 'nap').length,
      nightSleepCount: entries.filter(e => e.entry_data.type === 'night_sleep').length
    };
  }
}