import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

import { getProjectById } from "@/lib/db/projects";
import { runAudit, type AuditProgressEvent } from "@/lib/rules/engine";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!(await getProjectById(id, userId))) {
    return NextResponse.json({ error: "Project not found" }, { status: 404 });
  }

  const body = (await request.json().catch(() => ({}))) as { stream?: unknown };
  const wantsStream = body.stream === true;

  if (wantsStream) {
    const encoder = new TextEncoder();
    let sentTerminalEvent = false;

    const stream = new ReadableStream({
      async start(controller) {
        const send = (event: AuditProgressEvent) => {
          if (event.type === "completed" || event.type === "failed") {
            sentTerminalEvent = true;
          }

          controller.enqueue(encoder.encode(`${JSON.stringify(event)}\n`));
        };

        try {
          await runAudit(id, { onProgress: send });
        } catch (error) {
          if (!sentTerminalEvent) {
            send({
              type: "failed",
              run_id: "",
              error: error instanceof Error ? error.message : "Audit failed",
            });
          }
        } finally {
          controller.close();
        }
      },
    });

    return new Response(stream, {
      status: 200,
      headers: {
        "cache-control": "no-cache, no-transform",
        "content-type": "application/x-ndjson; charset=utf-8",
      },
    });
  }

  try {
    const result = await runAudit(id);
    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Audit failed" },
      { status: 400 },
    );
  }
}
