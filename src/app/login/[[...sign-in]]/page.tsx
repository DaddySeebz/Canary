import { AuthShell } from "@/components/auth/auth-shell";
import { isClerkConfigured } from "@/lib/env";

export const dynamic = "force-dynamic";

export default function SignInPage() {
  return <AuthShell mode="login" authEnabled={isClerkConfigured()} />;
}
