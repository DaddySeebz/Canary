import { LandingPage } from "@/components/marketing/landing-page";
import { getOptionalUserId } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const userId = await getOptionalUserId();

  return <LandingPage hasWorkspace={Boolean(userId)} />;
}
