import { NextResponse } from "next/server";
import { refreshJobs } from "@/lib/cache";

// This endpoint can be called by Vercel Cron to refresh jobs daily
// Configure in vercel.json

export async function GET(request: Request) {
  // Verify cron secret for security (optional but recommended)
  const authHeader = request.headers.get("authorization");

  if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const data = await refreshJobs();

    return NextResponse.json({
      success: true,
      jobsCount: data.jobs.length,
      lastUpdated: data.lastUpdated,
    });
  } catch (error) {
    console.error("Failed to refresh jobs:", error);
    return NextResponse.json(
      { error: "Failed to refresh jobs" },
      { status: 500 }
    );
  }
}
