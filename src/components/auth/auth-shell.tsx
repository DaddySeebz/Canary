"use client";

import Link from "next/link";
import { SignIn, SignUp } from "@clerk/nextjs";
import { Star } from "lucide-react";

import { CanaryLogo } from "@/components/branding/canary-logo";

const clerkAppearance = {
  elements: {
    rootBox: "w-full",
    card: "w-full border-0 bg-transparent p-0 shadow-none",
    header: "hidden",
    headerTitle: "hidden",
    headerSubtitle: "hidden",
    socialButtons:
      "mt-8 grid gap-3",
    socialButtonsBlockButton:
      "h-[50px] rounded-[10px] border border-white/12 bg-[#141416] px-[18px] text-sm font-medium text-[#f5f2eb] shadow-none transition hover:bg-[#19191c]",
    socialButtonsBlockButtonText:
      "text-sm font-medium text-[#f5f2eb]",
    dividerRow: "my-6",
    dividerLine: "bg-white/7",
    dividerText:
      "font-mono text-[10px] uppercase tracking-[0.16em] text-[#6d6c68]",
    formField: "mb-[18px]",
    formFieldLabel:
      "mb-2 block font-mono text-[10px] font-medium uppercase tracking-[0.12em] text-[#a8a7a2]",
    formFieldInput:
      "h-[50px] rounded-[10px] border border-white/12 bg-[#141416] px-4 text-[15px] text-[#f5f2eb] shadow-none outline-none transition placeholder:text-[#6d6c68] focus:border-[#d4a94a] focus:bg-[#19191c] focus:ring-0",
    formButtonPrimary:
      "mt-2 h-[54px] w-full rounded-[10px] border-0 bg-[#d4a94a] text-[13px] font-bold uppercase tracking-[0.08em] text-[#18120a] shadow-[inset_0_1px_0_rgba(255,255,255,0.18),0_8px_24px_-8px_rgba(212,169,74,0.45)] transition hover:bg-[#e0b654] active:translate-y-px",
    footer: "hidden",
    footerAction: "hidden",
    footerActionLink: "hidden",
    formFieldHintText: "mt-2 text-xs text-[#6d6c68]",
    formFieldSuccessText: "mt-2 text-xs text-emerald-400",
    formFieldErrorText: "mt-2 text-xs text-[#ff716a]",
    identityPreviewText: "text-sm text-[#a8a7a2]",
    otpCodeFieldInput:
      "h-11 rounded-[10px] border border-white/12 bg-[#141416] text-[#f5f2eb]",
    alertText: "text-sm text-[#ff716a]",
  },
  variables: {
    colorPrimary: "#d4a94a",
    colorBackground: "#0e0e10",
    colorInputBackground: "#141416",
    colorInputText: "#f5f2eb",
    colorText: "#f5f2eb",
    colorTextSecondary: "#a8a7a2",
    borderRadius: "0.625rem",
  },
} as const;

function Testimonial() {
  return (
    <figure className="max-w-[560px] rounded border border-white/7 border-l-2 border-l-[#d4a94a] bg-[linear-gradient(180deg,rgba(255,255,255,0.02),rgba(255,255,255,0.005))] px-7 py-6">
      <div className="mb-4 flex gap-1 text-[#d4a94a]" aria-label="Five out of five stars">
        {Array.from({ length: 5 }).map((_, index) => (
          <Star key={index} className="h-4 w-4 fill-current" aria-hidden="true" />
        ))}
      </div>
      <blockquote className="m-0 font-[var(--font-space-grotesk)] text-[17px] font-medium italic leading-[1.55] tracking-[-0.01em] text-[#f5f2eb]">
        &ldquo;Canary transitioned our team from reactive fire-fighting to proactive data stewardship. The
        early warning system is non-negotiable now.&rdquo;
      </blockquote>
      <figcaption className="mt-[22px] flex items-center gap-3.5 border-t border-white/7 pt-[18px]">
        <div
          className="relative h-10 w-10 shrink-0 overflow-hidden rounded-full border border-white/12 bg-[radial-gradient(circle_at_35%_30%,#4a3f2b,#1a1612_70%)]"
          aria-hidden="true"
        >
          <span className="absolute left-1/2 top-[7px] z-10 h-4 w-4 -translate-x-1/2 rounded-full bg-[#8a7349]" />
          <span className="absolute bottom-[-10px] left-1/2 h-7 w-7 -translate-x-1/2 rounded-full bg-[#6b5836] opacity-85" />
        </div>
        <div>
          <div className="text-sm font-semibold tracking-[-0.005em] text-[#f5f2eb]">Sarah Chen</div>
          <div className="mt-[3px] font-mono text-[10px] uppercase tracking-[0.08em] text-[#6d6c68]">
            DIRECTOR OF ANALYTICS · FINSCALE
          </div>
        </div>
      </figcaption>
    </figure>
  );
}

export function AuthShell({
  mode,
  authEnabled = true,
}: {
  mode: "signup" | "login";
  authEnabled?: boolean;
}) {
  const isSignup = mode === "signup";

  return (
    <main className="min-h-[100dvh] bg-[#0e0e10] text-[#f5f2eb]">
      <div className="grid min-h-[100dvh] grid-rows-[1fr_auto]">
        <div className="grid min-h-full lg:grid-cols-[1.05fr_1fr]">
          <section className="relative flex flex-col gap-10 overflow-hidden bg-[radial-gradient(ellipse_600px_380px_at_38%_14%,rgba(212,169,74,0.10),transparent_70%),radial-gradient(ellipse_500px_340px_at_18%_90%,rgba(212,169,74,0.04),transparent_70%)] px-8 py-12 md:px-16 lg:px-20">
            <Link href="/" className="inline-flex w-fit">
              <CanaryLogo variant="inline" surface="dark" showTagline={false} className="[&_img]:h-[49px]" />
            </Link>

            <div className="flex max-w-[640px] flex-col">
              <h1 className="text-[64px] font-semibold leading-[0.98] tracking-[-0.03em] text-[#f5f2eb] md:text-[88px]">
                Start Your First Audit in <span className="text-[#d4a94a]">15&nbsp;Minutes.</span>
              </h1>
              <p className="mt-8 max-w-[44ch] text-[19px] leading-[1.55] tracking-[-0.005em] text-[#a8a7a2]">
                Stop finding out about data issues in board meetings. Empower your operations with
                instrumental precision.
              </p>
            </div>

            <Testimonial />
          </section>

          <section className="flex items-center justify-center border-t border-white/7 bg-[linear-gradient(180deg,rgba(255,255,255,0.012),transparent_40%),#0e0e10] px-8 py-12 md:px-16 lg:border-l lg:border-t-0 lg:px-20">
            <div className="w-full max-w-[460px]">
              <div>
                <h2 className="font-[var(--font-space-grotesk)] text-4xl font-semibold leading-[1.05] tracking-[-0.02em] text-[#f5f2eb]">
                  {isSignup ? "Create your account" : "Welcome back"}
                </h2>
                <p className="mt-3 text-sm leading-[1.55] text-[#a8a7a2]">
                  {isSignup
                    ? "Join the network of high-precision data ops."
                    : "Sign in to continue monitoring the health of your audit workspace."}
                </p>
              </div>

              <div className="mt-8">
                {authEnabled ? (
                  isSignup ? (
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
                  )
                ) : (
                  <div className="rounded-[10px] border border-dashed border-white/12 bg-[#141416] p-5 text-sm leading-7 text-[#a8a7a2]">
                    Authentication is not configured for this deployment yet. Add
                    `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` and `CLERK_SECRET_KEY` in Vercel project settings,
                    then redeploy.
                  </div>
                )}
              </div>

              <div className="mt-[22px] text-center text-sm text-[#a8a7a2]">
                {isSignup ? "Already have an account?" : "Need a Canary account?"}
                <Link href={isSignup ? "/login" : "/signup"} className="ml-1.5 font-semibold text-[#d4a94a]">
                  {isSignup ? "Log In" : "Create one"}
                </Link>
              </div>

              <div className="mt-[26px] text-center font-mono text-[9.5px] uppercase leading-[1.7] tracking-[0.1em] text-[#6d6c68]">
                BY CREATING AN ACCOUNT, YOU AGREE TO OUR
                <br />
                <Link href="/terms" className="text-[#a8a7a2] underline underline-offset-2">
                  TERMS OF SERVICE
                </Link>{" "}
                AND{" "}
                <Link href="/privacy" className="text-[#a8a7a2] underline underline-offset-2">
                  PRIVACY POLICY
                </Link>
                .
              </div>
            </div>
          </section>
        </div>

        <footer className="flex flex-col items-center justify-between gap-5 border-t border-white/7 px-8 py-[26px] font-mono text-[11px] uppercase tracking-[0.1em] text-[#6d6c68] md:flex-row md:px-20">
          <Link href="/" className="inline-flex">
            <CanaryLogo variant="inline" surface="dark" showTagline={false} className="[&_img]:h-9" />
          </Link>
          <div className="flex flex-wrap justify-center gap-8 md:gap-10">
            <Link href="/security" className="hover:text-[#a8a7a2]">
              SECURITY
            </Link>
            <Link href="/privacy" className="hover:text-[#a8a7a2]">
              PRIVACY POLICY
            </Link>
            <Link href="/terms" className="hover:text-[#a8a7a2]">
              TERMS OF SERVICE
            </Link>
          </div>
          <span>© 2026 ALL RIGHTS RESERVED</span>
        </footer>
      </div>
    </main>
  );
}
