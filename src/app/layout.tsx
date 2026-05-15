import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { Inter, Space_Grotesk } from "next/font/google";

import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { canaryBrandAssets } from "@/lib/branding/logo-assets";
import { isClerkConfigured } from "@/lib/env";

import "./globals.css";

const bodyFont = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const displayFont = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Canary | Instrumental Early Warning for Data Operations",
  description:
    "High-precision auditing, live monitoring, and operational intelligence for revenue and finance data teams.",
  manifest: canaryBrandAssets.icons.manifest,
  icons: {
    icon: [
      { url: canaryBrandAssets.icons.favicon.src, sizes: "any" },
      { url: canaryBrandAssets.icons.favicon16.src, type: "image/png", sizes: canaryBrandAssets.icons.favicon16.sizes },
      { url: canaryBrandAssets.icons.favicon32.src, type: "image/png", sizes: canaryBrandAssets.icons.favicon32.sizes },
      { url: canaryBrandAssets.icons.favicon48.src, type: "image/png", sizes: canaryBrandAssets.icons.favicon48.sizes },
      { url: canaryBrandAssets.icons.favicon64.src, type: "image/png", sizes: canaryBrandAssets.icons.favicon64.sizes },
      {
        url: canaryBrandAssets.icons.androidChrome192.src,
        type: "image/png",
        sizes: canaryBrandAssets.icons.androidChrome192.sizes,
      },
      {
        url: canaryBrandAssets.icons.androidChrome512.src,
        type: "image/png",
        sizes: canaryBrandAssets.icons.androidChrome512.sizes,
      },
    ],
    apple: [
      {
        url: canaryBrandAssets.icons.appleTouchIcon.src,
        type: "image/png",
        sizes: canaryBrandAssets.icons.appleTouchIcon.sizes,
      },
    ],
    other: [{ rel: "mask-icon", url: canaryBrandAssets.icons.safariPinnedTab.src, color: "#D7AD3C" }],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const content = (
    <TooltipProvider>
      {children}
      <Toaster richColors position="top-right" theme="dark" />
    </TooltipProvider>
  );

  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${bodyFont.variable} ${displayFont.variable} bg-background text-foreground antialiased`}>
        {isClerkConfigured() ? (
          <ClerkProvider signInUrl="/login" signUpUrl="/signup">{content}</ClerkProvider>
        ) : (
          content
        )}
      </body>
    </html>
  );
}
