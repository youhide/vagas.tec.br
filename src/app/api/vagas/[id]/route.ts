import { NextResponse } from "next/server";
import { getJobById } from "@/lib/cache";

// Corpo markdown sob demanda para o JobModal — a home envia só JobSummary
// (sem body) para manter o payload pequeno.

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(_request: Request, { params }: RouteParams) {
  const { id } = await params;
  const job = await getJobById(id);

  if (!job) {
    return NextResponse.json({ error: "Vaga não encontrada" }, { status: 404 });
  }

  return NextResponse.json(
    { body: job.body },
    {
      headers: {
        "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
      },
    }
  );
}
