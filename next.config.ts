import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  env: {
    NEXT_PUBLIC_SUPABASE_URL:
      process.env.NEXT_PUBLIC_SUPABASE_URL ||
      "https://nzctpjbsilflawpdicqr.supabase.co",
    NEXT_PUBLIC_SUPABASE_ANON_KEY:
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im56Y3RwamJzaWxmbGF3cGRpY3FyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODk2Mzg5ODYsImV4cCI6MjEwNTIxNDk4Nn0.g2TSKAgXx7qdkZybse6YWLPLQ5aUwnaZX4olLNHwLI4",
  },
};

export default nextConfig;
