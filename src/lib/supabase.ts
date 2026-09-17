import { createBrowserClient } from "@supabase/ssr";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";

export const DEFAULT_SUPABASE_URL =
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  "https://nzctpjbsilflawpdicqr.supabase.co";

export const DEFAULT_SUPABASE_ANON_KEY =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im56Y3RwamJzaWxmbGF3cGRpY3FyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODk2Mzg5ODYsImV4cCI6MjEwNTIxNDk4Nn0.g2TSKAgXx7qdkZybse6YWLPLQ5aUwnaZX4olLNHwLI4";

export const createClient = () =>
  createBrowserClient(DEFAULT_SUPABASE_URL, DEFAULT_SUPABASE_ANON_KEY);

export const createServerClient = () =>
  createSupabaseClient(DEFAULT_SUPABASE_URL, DEFAULT_SUPABASE_ANON_KEY);