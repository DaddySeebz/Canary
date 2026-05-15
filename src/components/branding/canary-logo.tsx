"use client";

import Image from "next/image";

import { canaryBrandAssets, type CanaryBrandSurface, type CanaryLogoVariant } from "@/lib/branding/logo-assets";
import { cn } from "@/lib/utils";

type CanaryLogoProps = {
  className?: string;
  variant?: CanaryLogoVariant;
  surface?: CanaryBrandSurface;
  showTagline?: boolean;
};

const logoSizeClasses: Record<CanaryLogoVariant, string> = {
  mark: "h-10 w-auto",
  inline: "h-11 w-auto",
  stacked: "h-20 w-auto",
};

const taglineSizeClasses: Record<CanaryLogoVariant, string> = {
  mark: "text-[10px] uppercase tracking-[0.3em]",
  inline: "text-[10px] uppercase tracking-[0.3em]",
  stacked: "text-[11px] uppercase tracking-[0.34em]",
};

const taglineToneClasses: Record<CanaryBrandSurface, string> = {
  dark: "text-zinc-400",
  light: "text-slate-500",
};

export function CanaryLogo({
  className,
  variant = "inline",
  surface = "dark",
  showTagline = true,
}: CanaryLogoProps) {
  const asset = canaryBrandAssets.logos[variant].svg[surface];
  const dimensions = canaryBrandAssets.logos[variant].dimensions;
  const shouldShowTagline = showTagline;

  return (
    <div className={cn("inline-flex items-start", shouldShowTagline && "flex-col gap-2", className)}>
      <Image
        src={asset.src}
        alt=""
        aria-hidden="true"
        unoptimized
        width={dimensions.width}
        height={dimensions.height}
        className={cn("block shrink-0", logoSizeClasses[variant])}
      />
      <span className="sr-only">Canary</span>
      {shouldShowTagline ? (
        <span className={cn("font-mono", taglineSizeClasses[variant], taglineToneClasses[surface])}>
          Know before it costs you
        </span>
      ) : null}
    </div>
  );
}
