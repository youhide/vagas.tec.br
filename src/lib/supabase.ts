import { createClient } from "@supabase/supabase-js";

if (!process.env.SUPABASE_URL || !process.env.SUPABASE_ANON_KEY) {
  console.warn("Supabase credentials not found. Cache will be disabled.");
}

export const supabase = process.env.SUPABASE_URL && process.env.SUPABASE_ANON_KEY
  ? createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY)
  : null;

export type Database = {
  public: {
    Tables: {
      jobs_cache: {
        Row: {
          id: string;
          data: unknown;
          updated_at: string;
        };
        Insert: {
          id: string;
          data: unknown;
          updated_at?: string;
        };
        Update: {
          id?: string;
          data?: unknown;
          updated_at?: string;
        };
      };
    };
  };
};
