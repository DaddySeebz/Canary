import { LandingPage } from "@/components/marketing/landing-page";
import { listProjectsWithStats } from "@/lib/db/projects";

export const dynamic = "force-dynamic";

export default function HomePage() {
  return <LandingPage projects={listProjectsWithStats()} />;
}
