import { createClient } from "@supabase/supabase-js";
import { Label, LocationType, Seniority } from "@/types/job";

if (!process.env.SUPABASE_URL || !process.env.SUPABASE_ANON_KEY) {
  console.warn("Supabase credentials not found. Cache will be disabled.");
}

// `type` (não `interface`): precisa da index signature implícita para
// satisfazer o constraint Record<string, unknown> do supabase-js
export type JobRow = {
  id: number;
  title: string;
  body: string;
  url: string;
  labels: Label[];
  category_id: string;
  repository: string;
  author: string;
  author_avatar: string;
  created_at: string;
  updated_at: string;
  state: "open" | "closed";
  location_type: LocationType | null;
  seniority: Seniority[] | null;
  first_seen_at: string;
  last_seen_at: string;
  closed_detected_at: string | null;
};

export type Database = {
  public: {
    Tables: {
      jobs: {
        Row: JobRow;
        Insert: Omit<JobRow, "first_seen_at" | "closed_detected_at"> &
          Partial<Pick<JobRow, "first_seen_at" | "closed_detected_at">>;
        Update: Partial<JobRow>;
        Relationships: [];
      };
    };
    // {[_ in never]: never} e não Record<string, never>: keyof precisa ser
    // never, senão o supabase-js trata toda coluna como "computed field"
    Views: { [_ in never]: never };
    Functions: { [_ in never]: never };
    Enums: { [_ in never]: never };
    CompositeTypes: { [_ in never]: never };
  };
};

// Read-only client using anon key (safe for public reads via RLS)
export const supabase = process.env.SUPABASE_URL && process.env.SUPABASE_ANON_KEY
  ? createClient<Database>(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY)
  : null;

// Write client using service_role key (bypasses RLS, server-only)
export const supabaseAdmin =
  process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY
    ? createClient<Database>(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)
    : null;
