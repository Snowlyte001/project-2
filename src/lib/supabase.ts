import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Database = {
  public: {
    Tables: {
      user_profiles: {
        Row: {
          id: string;
          user_id: string;
          parent_type: string;
          experience_level: string;
          support_network: string;
          primary_concerns: string[];
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          parent_type: string;
          experience_level: string;
          support_network: string;
          primary_concerns?: string[];
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          parent_type?: string;
          experience_level?: string;
          support_network?: string;
          primary_concerns?: string[];
          created_at?: string;
          updated_at?: string;
        };
      };
      children: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          age_category: string;
          specific_age: string | null;
          gender: string;
          special_needs: string[];
          personality_traits: string[];
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          age_category: string;
          specific_age?: string | null;
          gender?: string;
          special_needs?: string[];
          personality_traits?: string[];
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          age_category?: string;
          specific_age?: string | null;
          gender?: string;
          special_needs?: string[];
          personality_traits?: string[];
          created_at?: string;
        };
      };
      tracking_entries: {
        Row: {
          id: string;
          user_id: string;
          child_id: string | null;
          entry_type: string;
          entry_data: any;
          notes: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          child_id?: string | null;
          entry_type: string;
          entry_data: any;
          notes?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          child_id?: string | null;
          entry_type?: string;
          entry_data?: any;
          notes?: string | null;
          created_at?: string;
        };
      };
      reminders: {
        Row: {
          id: string;
          user_id: string;
          child_id: string | null;
          title: string;
          description: string | null;
          reminder_type: string;
          scheduled_time: string;
          is_completed: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          child_id?: string | null;
          title: string;
          description?: string | null;
          reminder_type: string;
          scheduled_time: string;
          is_completed?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          child_id?: string | null;
          title?: string;
          description?: string | null;
          reminder_type?: string;
          scheduled_time?: string;
          is_completed?: boolean;
          created_at?: string;
        };
      };
    };
  };
};