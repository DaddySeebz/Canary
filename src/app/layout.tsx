import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { Inter, Space_Grotesk } from "next/font/google";

import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
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
