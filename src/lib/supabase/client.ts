import { createBrowserClient } from '@supabase/ssr';

export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://xnmpzjpthszfnovrdrqi.supabase.co';
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhubXB6anB0aHN6Zm5vdnJkcnFpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTEyOTg1MDUsImV4cCI6MjEwNjg3NDUwNX0.IMYQM8stT-qMkXtQM7TCkiNgVbO8Ydf0mt7yVrszmWc';

  return createBrowserClient(supabaseUrl, supabaseAnonKey);
}
