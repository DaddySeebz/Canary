import { NextResponse } from "next/server";
import { z } from "zod";

import { logActivity } from "@/lib/db/activity";
import { getROISettings, upsertROISettings } from "@/lib/db/roi";

export const runtime = "nodejs";

const roiSchema = z.object({
  cost_per_error: z.number().min(0),
  time_per_fix_minutes: z.number().min(0),
  hourly_rate: z.number().min(0),
  volume_per_period: z.number().int().min(0),
});

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;
  return NextResponse.json({
    roi: getROISettings(id),
  });
}

export async function PUT(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;
  const body = roiSchema.safeParse(await request.json());

  if (!body.success) {
    return NextResponse.json({ error: body.error.flatten() }, { status: 400 });
  }

  const roi = upsertROISettings(id, body.data);
  logActivity(id, "roi.updated", JSON.stringify(body.data));

  return NextResponse.json({ roi });
}
