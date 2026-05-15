export type CanaryBrandSurface = "dark" | "light";
export type CanaryLogoVariant = "mark" | "inline" | "stacked";

export const canaryBrandAssets = {
  logos: {
    mark: {
      dimensions: { width: 755, height: 860 },
      svg: {
        dark: { src: "/brand/canary/svg/canary-icon-mark-gold.svg" },
        light: { src: "/brand/canary/svg/canary-icon-mark.svg" },
      },
      png: {
        dark: { src: "/brand/canary/png/canary-icon-gold-transparent.png" },
        light: { src: "/brand/canary/png/canary-icon-black-flat-transparent.png" },
      },
    },
    inline: {
      dimensions: { width: 1745, height: 860 },
      svg: {
        dark: { src: "/brand/canary/svg/canary-logo-horizontal-dark.svg" },
        light: { src: "/brand/canary/svg/canary-logo-horizontal-light.svg" },
      },
      png: {
        dark: { src: "/brand/canary/png/canary-logo-horizontal-transparent-dark.png" },
        light: { src: "/brand/canary/png/canary-logo-horizontal-transparent-light.png" },
      },
    },
    stacked: {
      dimensions: { width: 1000, height: 1095 },
      svg: {
        dark: { src: "/brand/canary/svg/canary-logo-stacked-dark.svg" },
        light: { src: "/brand/canary/svg/canary-logo-stacked-light.svg" },
      },
      png: {
        dark: { src: "/brand/canary/png/canary-logo-stacked-dark.png" },
        light: { src: "/brand/canary/png/canary-logo-stacked-transparent.png" },
      },
    },
    wordmark: {
      dimensions: { width: 920, height: 145 },
      svg: {
        dark: { src: "/brand/canary/svg/canary-wordmark-white.svg" },
        light: { src: "/brand/canary/svg/canary-wordmark-black.svg" },
        gold: { src: "/brand/canary/svg/canary-wordmark.svg" },
      },
      png: {
        dark: { src: "/brand/canary/png/canary-wordmark-white-transparent.png" },
        light: { src: "/brand/canary/png/canary-wordmark-black-transparent.png" },
        gold: { src: "/brand/canary/png/canary-wordmark-gold-transparent.png" },
      },
    },
  },
  icons: {
    faviconSource: { src: "/favicon-source-1024.png", width: 1024, height: 1024 },
    favicon: { src: "/favicon.ico" },
    favicon16: { src: "/favicon-16x16.png", width: 16, height: 16, sizes: "16x16" },
    favicon32: { src: "/favicon-32x32.png", width: 32, height: 32, sizes: "32x32" },
    favicon48: { src: "/favicon-48x48.png", width: 48, height: 48, sizes: "48x48" },
    favicon64: { src: "/favicon-64x64.png", width: 64, height: 64, sizes: "64x64" },
    appleTouchIcon: { src: "/apple-touch-icon.png", width: 180, height: 180, sizes: "180x180" },
    androidChrome192: { src: "/android-chrome-192x192.png", width: 192, height: 192, sizes: "192x192" },
    androidChrome512: { src: "/android-chrome-512x512.png", width: 512, height: 512, sizes: "512x512" },
    safariPinnedTab: { src: "/safari-pinned-tab.svg" },
    manifest: "/site.webmanifest",
  },
  social: {
    ogImage1200x630: { src: "/brand/canary/social/canary-og-image-1200x630.png", width: 1200, height: 630 },
  },
} as const;
