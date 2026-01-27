import { JobsData } from "@/types/job";
import { CATEGORIES } from "./categories";
import { fetchAllJobs } from "./github";
import { supabase } from "./supabase";

const CACHE_KEY = "jobs_data";
const CACHE_TTL_HOURS = 24;

export async function getJobs(): Promise<JobsData> {
  // Try to get from Supabase cache first
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from("jobs_cache")
        .select("data, updated_at")
        .eq("id", CACHE_KEY)
        .single();

      if (data && !error) {
        const updatedAt = new Date(data.updated_at);
        const now = new Date();
        const hoursAgo = (now.getTime() - updatedAt.getTime()) / (1000 * 60 * 60);

        // Return cached data if less than 24 hours old
        if (hoursAgo < CACHE_TTL_HOURS) {
          console.log(`Returning cached jobs data (${hoursAgo.toFixed(1)}h old)`);
          return data.data as JobsData;
        }
      }
    } catch (error) {
      console.log("Supabase cache read failed:", error);
    }
  }

  // Fetch fresh data
  return refreshJobs();
}

export async function refreshJobs(): Promise<JobsData> {
  console.log("Fetching fresh jobs from GitHub...");
  const jobs = await fetchAllJobs();

  const data: JobsData = {
    jobs,
    lastUpdated: new Date().toISOString(),
    categories: CATEGORIES,
  };

  // Try to cache the data in Supabase
  if (supabase) {
    try {
      const { error } = await supabase.from("jobs_cache").upsert(
        {
          id: CACHE_KEY,
          data: data,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "id" }
      );

      if (error) {
        console.error("Failed to cache jobs:", error.message);
      } else {
        console.log("Jobs cached successfully in Supabase");
      }
    } catch (error) {
      console.log("Could not cache jobs (Supabase not available)");
    }
  }

  return data;
}

// For local development or when cache fails
export async function getJobsDirect(): Promise<JobsData> {
  // Try cache first, then fallback to direct fetch
  try {
    return await getJobs();
  } catch {
    const jobs = await fetchAllJobs();
    return {
      jobs,
      lastUpdated: new Date().toISOString(),
      categories: CATEGORIES,
    };
  }
}
