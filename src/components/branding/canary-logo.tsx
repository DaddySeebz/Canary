import { useId } from "react";

import { cn } from "@/lib/utils";

type CanaryLogoProps = {
  className?: string;
  variant?: "mark" | "inline" | "stacked";
  showTagline?: boolean;
};

function CanaryMark({ className }: { className?: string }) {
  const gradientPrimary = useId();
  const gradientSecondary = useId();
  const glow = useId();

  return (
    <svg viewBox="0 0 176 176" fill="none" aria-hidden="true" className={cn("text-amber-300", className)}>
      <defs>
        <linearGradient id={gradientPrimary} x1="28" y1="138" x2="144" y2="38" gradientUnits="userSpaceOnUse">
          <stop stopColor="#F59E0B" />
          <stop offset="0.52" stopColor="#FBBF24" />
          <stop offset="1" stopColor="#FDE68A" />
        </linearGradient>
        <linearGradient id={gradientSecondary} x1="90" y1="30" x2="122" y2="148" gradientUnits="userSpaceOnUse">
          <stop stopColor="#FCD34D" />
          <stop offset="1" stopColor="#D97706" />
        </linearGradient>
        <radialGradient id={glow} cx="0" cy="0" r="1" gradientTransform="translate(88 88) rotate(90) scale(72)">
          <stop stopColor="#FBBF24" stopOpacity="0.22" />
          <stop offset="1" stopColor="#FBBF24" stopOpacity="0" />
        </radialGradient>
      </defs>

      <circle cx="88" cy="88" r="72" fill={`url(#${glow})`} />

      <g opacity="0.28" stroke="currentColor" strokeWidth="2.3">
        <path d="M88 16 140 46V130L88 160 36 130V46L88 16Z" />
        <path d="M88 28 130 52V124L88 148 46 124V52L88 28Z" opacity="0.82" />
      </g>

      <g opacity="0.14" stroke="currentColor" strokeWidth="1.5">
        <path d="M58 54h40" />
        <path d="M58 78h22" />
        <path d="M58 102h16" />
        <path d="M70 44v40" />
        <path d="M92 40v24" />
        <path d="M124 70v34" />
      </g>

      <g stroke="#2D1705" strokeLinejoin="round">
        <path d="M34 140 68 112 92 116 54 147 34 140Z" fill={`url(#${gradientPrimary})`} strokeWidth="3.6" />
        <path d="M69 109 101 39 128 49 118 123 90 145 69 109Z" fill={`url(#${gradientSecondary})`} strokeWidth="4.8" />
        <path d="M100 42 128 34 145 43 128 71 106 66 95 54 100 42Z" fill={`url(#${gradientPrimary})`} strokeWidth="4.8" />
        <path d="M143 44 159 55 138 56 143 44Z" fill="#FDE68A" strokeWidth="3.2" />
        <path d="M84 83 114 62 98 105 84 83Z" fill="#FCD34D" strokeWidth="3.4" />
        <path d="M88 116 109 138 96 145 78 126 88 116Z" fill="#D97706" strokeWidth="3.2" />
        <path d="M113 123 132 142 119 149 103 131 113 123Z" fill="#B45309" strokeWidth="3.2" />
        <path d="M66 112 112 68" strokeWidth="4.6" />
        <path d="M96 54 123 123" strokeWidth="4.6" />
        <path d="M92 145 143 63" strokeWidth="4.4" opacity="0.92" />
      </g>

      <circle cx="126" cy="50" r="10.5" fill="#251406" opacity="0.95" />
      <path
        d="m121.5 49.8 3.1 3.4 7.1-8"
        stroke="#F8D373"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="3.1"
      />
    </svg>
  );
}

export function CanaryLogo({
  className,
  variant = "inline",
  showTagline = true,
}: CanaryLogoProps) {
  if (variant === "mark") {
    return <CanaryMark className={className} />;
  }

  if (variant === "stacked") {
    return (
      <div className={cn("space-y-3", className)}>
        <div className="flex items-center gap-4">
          <CanaryMark className="h-20 w-20 shrink-0 drop-shadow-[0_16px_30px_rgba(251,191,36,0.12)]" />
          <div className="space-y-2">
            <div className="text-4xl font-semibold uppercase tracking-[0.18em] text-white md:text-5xl">
              Canary
            </div>
            {showTagline ? (
              <div className="font-mono text-[11px] uppercase tracking-[0.34em] text-zinc-400">
                Know before it costs you
              </div>
            ) : null}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("flex items-center gap-3", className)}>
      <CanaryMark className="h-10 w-10 shrink-0" />
      <div className="space-y-0.5">
        <div className="text-lg font-semibold uppercase tracking-[0.16em] text-white">Canary</div>
        {showTagline ? (
          <div className="font-mono text-[10px] uppercase tracking-[0.3em] text-zinc-400">
            Know before it costs you
          </div>
        ) : null}
      </div>
    </div>
  );
}
