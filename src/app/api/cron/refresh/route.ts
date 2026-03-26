import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { refreshJobs } from "@/lib/cache";

// This endpoint can be called by Vercel Cron to refresh jobs daily
// Configure in vercel.json

export async function GET(request: Request) {
  // Verify cron secret for security (fail-closed: reject if not configured)
  const authHeader = request.headers.get("authorization");

  if (!process.env.CRON_SECRET) {
    return NextResponse.json({ error: "CRON_SECRET not configured" }, { status: 500 });
  }

  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const data = await refreshJobs();

    // Revalidate the home page to show new jobs
    revalidatePath("/");

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
