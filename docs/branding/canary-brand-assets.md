# Canary Brand Asset Guide

The Canary brand pack lives in `public/brand/canary/`, with favicon files at the public root so Next.js can serve them directly.

## Source of truth

- Component registry: [`src/lib/branding/logo-assets.ts`](../../src/lib/branding/logo-assets.ts)
- UI component: [`src/components/branding/canary-logo.tsx`](../../src/components/branding/canary-logo.tsx)
- Browser icons and manifest: [`src/app/layout.tsx`](../../src/app/layout.tsx)

## Logo families

- `svg/canary-logo-horizontal-dark.svg` - use on dark surfaces.
- `svg/canary-logo-horizontal-light.svg` - use on light surfaces.
- `svg/canary-logo-stacked-dark.svg` - stacked lockup for dark surfaces.
- `svg/canary-logo-stacked-light.svg` - stacked lockup for light surfaces.
- `svg/canary-icon-mark-gold.svg` - standalone mark for dark surfaces.
- `svg/canary-icon-mark.svg` - monochrome currentColor mark for light surfaces.
- `svg/canary-wordmark-white.svg` - wordmark on dark surfaces.
- `svg/canary-wordmark-black.svg` - wordmark on light surfaces.
- `svg/canary-wordmark.svg` - monochrome currentColor wordmark fallback.

## PNG exports

- `png/canary-logo-horizontal-transparent-dark.png`
- `png/canary-logo-horizontal-transparent-light.png`
- `png/canary-logo-stacked-transparent.png`
- `png/canary-logo-stacked-dark.png`
- `png/canary-icon-gold-transparent.png`
- `png/canary-icon-gold-flat-transparent.png`
- `png/canary-icon-gold-on-black.png`
- `png/canary-icon-white-flat-transparent.png`
- `png/canary-icon-black-flat-transparent.png`
- `png/canary-wordmark-white-transparent.png`
- `png/canary-wordmark-black-transparent.png`
- `png/canary-wordmark-gold-transparent.png`

Use the PNGs when a consumer cannot handle SVGs or needs a raster fallback.

## Browser icons

- `favicon.ico`
- `favicon-16x16.png`
- `favicon-32x32.png`
- `favicon-48x48.png`
- `favicon-64x64.png`
- `favicon-source-1024.png`
- `apple-touch-icon.png`
- `android-chrome-192x192.png`
- `android-chrome-512x512.png`
- `safari-pinned-tab.svg`
- `site.webmanifest`

## Social preview

- `/brand/canary/social/canary-og-image-1200x630.png`

## How the app uses the pack

- `CanaryLogo` defaults to the dark surface variant.
- Use `surface="light"` for light backgrounds.
- Use `variant="mark"` for icon-only placements.
- Use `variant="inline"` for horizontal lockups.
- Use `variant="stacked"` for stacked lockups.
- Keep `showTagline={false}` in dense headers and set it to `true` only when the extra line helps.

Example:

```tsx
<CanaryLogo variant="inline" surface="dark" showTagline={false} />
```
