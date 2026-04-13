"use client";

import Link from "next/link";
import { SignIn, SignUp } from "@clerk/nextjs";
import { ShieldCheck, Star } from "lucide-react";

import { CanaryLogo } from "@/components/branding/canary-logo";

const clerkAppearance = {
  elements: {
    rootBox: "w-full",
    card: "shadow-none bg-transparent border-0 p-0 w-full",
    header: "hidden",
    headerTitle: "hidden",
    headerSubtitle: "hidden",
    socialButtonsBlock: "hidden",
    socialButtonsBlockButton: "hidden",
    dividerLine: "bg-[color:var(--workspace-border)]",
    dividerText: "text-xs uppercase tracking-[0.22em] text-slate-400",
    formButtonPrimary:
      "h-12 w-full rounded-[0.5rem] border-0 bg-[#ffc965] font-semibold text-[#18120a] shadow-[inset_0_1px_0_rgba(255,255,255,0.4)] hover:bg-[#ffcf78]",
    formFieldLabel: "text-xs uppercase tracking-[0.22em] text-slate-500",
    formFieldInput:
      "h-11 rounded-[0.5rem] border border-[color:var(--workspace-border)] bg-white px-4 text-sm text-slate-900 shadow-none focus:border-[#ffc965] focus:ring-[#ffc965]",
    footer: "hidden",
    footerAction: "hidden",
    footerActionLink: "hidden",
    formFieldHintText: "text-xs text-slate-400",
    formFieldSuccessText: "text-xs text-emerald-600",
    formFieldErrorText: "text-xs text-red-500",
    identityPreviewText: "text-sm text-slate-500",
    otpCodeFieldInput:
      "h-11 rounded-[0.5rem] border border-[color:var(--workspace-border)] bg-white text-slate-900",
    alertText: "text-sm text-red-500",
  },
  variables: {
    colorPrimary: "#ffc965",
    colorBackground: "#ffffff",
    colorInputBackground: "#ffffff",
    colorInputText: "#0f172a",
    colorText: "#0f172a",
    borderRadius: "0.5rem",
  },
} as const;

export function AuthShell({ mode }: { mode: "signup" | "login" }) {
  const isSignup = mode === "signup";

  return (
    <main className="min-h-[100dvh] bg-[#0e0e10] px-4 py-6 md:px-8">
      <div className="mx-auto grid min-h-[calc(100dvh-3rem)] max-w-[1400px] overflow-hidden rounded-[1rem] border border-white/10 lg:grid-cols-[1.15fr_0.85fr]">
        <section className="canary-grid relative flex flex-col justify-between bg-[linear-gradient(180deg,#111114,#0b0b0d)] px-8 py-10 md:px-12 md:py-12">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_18%,rgba(255,201,101,0.12),transparent_32%)]" />
          <div className="relative z-10">
            <CanaryLogo variant="inline" showTagline={false} />
          </div>

          <div className="relative z-10 max-w-[28rem] space-y-6">
            <h1 className="max-w-[10ch] text-5xl font-semibold tracking-tight text-white md:text-7xl">
              Start your first audit in <span className="text-primary">15 minutes.</span>
            </h1>
            <p className="text-lg leading-9 text-zinc-300">
              Stop finding out about data issues in board meetings. Empower your operations team with instrumental precision and live operational memory.
            </p>
          </div>

          <div className="relative z-10 max-w-[30rem] rounded-[0.75rem] border border-white/10 bg-white/[0.03] p-6">
            <div className="flex items-center gap-1 text-primary">
              {Array.from({ length: 5 }).map((_, index) => (
                <Star key={index} className="h-4 w-4 fill-current" />
              ))}
            </div>
            <p className="mt-5 text-lg leading-8 text-zinc-100">
              “Canary moved our team from reactive fire-fighting to proactive data stewardship. The early warning system is non-negotiable now.”
            </p>
            <div className="mt-6">
              <div className="text-base font-semibold text-white">Mara Ellison</div>
              <div className="text-xs uppercase tracking-[0.22em] text-zinc-500">Director of Analytics, Vantage Ledger</div>
            </div>
          </div>
        </section>

        <section className="flex items-center bg-[color:var(--workspace-bg)] px-6 py-10 md:px-10">
          <div className="mx-auto w-full max-w-[26rem] space-y-8">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-[11px] uppercase tracking-[0.2em] text-amber-700">
                <ShieldCheck className="h-3.5 w-3.5" />
                Canary account
              </div>
              <h2 className="text-4xl font-semibold tracking-tight text-slate-950">
                {isSignup ? "Create your account" : "Welcome back"}
              </h2>
              <p className="text-base leading-7 text-slate-500">
                {isSignup
                  ? "Join the network of high-precision data operators."
                  : "Sign in to continue monitoring the health of your audit workspace."}
              </p>
            </div>

            {isSignup ? (
              <SignUp
                appearance={clerkAppearance}
                path="/signup"
                routing="path"
                signInUrl="/login"
                fallbackRedirectUrl="/projects"
              />
            ) : (
              <SignIn
                appearance={clerkAppearance}
                path="/login"
                routing="path"
                signUpUrl="/signup"
                fallbackRedirectUrl="/projects"
              />
            )}

            <p className="text-sm text-slate-500">
              {isSignup ? "Already have an account?" : "Need a Canary account?"}{" "}
              <Link href={isSignup ? "/login" : "/signup"} className="font-semibold text-amber-700">
                {isSignup ? "Log in" : "Create one"}
              </Link>
            </p>
            <p className="text-xs leading-6 text-slate-400">
              By continuing you agree to our <Link href="/terms" className="underline">Terms of Service</Link> and <Link href="/privacy" className="underline">Privacy Policy</Link>.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
