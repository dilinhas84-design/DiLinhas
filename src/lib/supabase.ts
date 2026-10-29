import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://wpkkfpedurjsiiipemvb.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Indwa2tmcGVkdXJqc2lpaXBlbXZiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTMyMzI1MTYsImV4cCI6MjEwODgwODUxNn0.66lOaXYtvcuSldV6RTLGTqZqIfotKzk8hDZ-om3ZwDE';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
});

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);
