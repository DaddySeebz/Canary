import { AuthShell } from "@/components/auth/auth-shell";

export const dynamic = "force-dynamic";

export default function SignInPage() {
  return <AuthShell mode="login" />;
}
