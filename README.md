# Canary

Canary is a Next.js 16 app for CSV audit workspaces, rule-based monitoring, and data quality intelligence.

## Local development

1. Copy `.env.local.example` to `.env.local`.
2. Set the required runtime variables:
   - `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
   - `CLERK_SECRET_KEY`
   - `DATABASE_URL`
   - `BLOB_READ_WRITE_TOKEN`
3. Optional:
   - `OPENROUTER_API_KEY` to enable AI rule chat
   - `CANARY_PUBLIC_DEMO_ENABLED=true` to expose the public `/demo` workspace
4. Install dependencies and run `npm run dev`.

## Clerk setup

Canary already uses Clerk with the App Router and custom auth pages:

- Sign-in route: `/login`
- Sign-up route: `/signup`
- Authenticated workspace: `/projects`

To enable the real audit flow:

1. Create a Clerk application for Canary.
2. Enable email + password as the primary sign-in method for testing.
3. Add your Vercel deployment domain(s) to Clerk so sign-in and sign-up can complete on preview and production.
4. Copy the Clerk keys into Vercel environment variables:
   - `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
   - `CLERK_SECRET_KEY`
5. Redeploy the app.
6. Visit `/signup`, create the first test user, and confirm you land in `/projects`.

Notes:

- Canary already sets the post-auth fallback redirect to `/projects` in the custom Clerk components.
- No `_app.tsx` or Pages Router setup is needed.
- `/demo` is optional and remains a separate read-only path when `CANARY_PUBLIC_DEMO_ENABLED=true`.

## Vercel deployment

Canary is designed for durable Vercel deployment with:

- Clerk for authentication
- Neon Postgres for relational data
- Vercel Blob for CSV storage

Recommended setup:

1. Add the Neon integration to the Vercel project.
2. Add the Vercel Blob integration or token.
3. Configure the Clerk keys in Vercel environment variables.
4. Optionally set `OPENROUTER_API_KEY` and `CANARY_PUBLIC_DEMO_ENABLED`.

Required Vercel environment variables for full product testing:

- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
- `CLERK_SECRET_KEY`
- `DATABASE_URL`
- `BLOB_READ_WRITE_TOKEN`

Recommended verification after deploy:

1. Open `/signup` and confirm the live Clerk form renders.
2. Create a test user and confirm redirect to `/projects`.
3. Confirm the `UserButton` appears in the workspace header.
4. Create a workspace, upload CSVs, run an audit, and refresh to confirm persistence.
5. Sign out and confirm `/projects` redirects back to `/login`.

The app pins Node.js to `22.x` through `package.json`.
