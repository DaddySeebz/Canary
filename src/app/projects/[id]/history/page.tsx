import { ActivityTimeline } from "@/components/activity/activity-timeline";
import { listActivity } from "@/lib/db/activity";

export const dynamic = "force-dynamic";

export default async function ProjectHistoryPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return <ActivityTimeline entries={listActivity(id)} />;
}
