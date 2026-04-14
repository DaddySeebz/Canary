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

The app pins Node.js to `22.x` through `package.json`.
