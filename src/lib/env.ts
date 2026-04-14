import { z } from "zod";

const requiredRuntimeEnvSchema = z.object({
  DATABASE_URL: z.string().min(1),
  BLOB_READ_WRITE_TOKEN: z.string().min(1),
});

const optionalRuntimeEnvSchema = z.object({
  NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: z.string().min(1).optional(),
  CLERK_SECRET_KEY: z.string().min(1).optional(),
  OPENROUTER_API_KEY: z.string().min(1).optional(),
  CANARY_PUBLIC_DEMO_ENABLED: z
    .enum(["true", "false", "1", "0", "yes", "no"])
    .optional(),
  VERCEL_ENV: z.enum(["production", "preview", "development"]).optional(),
});

function parseRequiredRuntimeEnv() {
  const parsed = requiredRuntimeEnvSchema.safeParse(process.env);

  if (parsed.success) {
    return parsed.data;
  }

  const missing = Object.entries(parsed.error.flatten().fieldErrors)
    .filter(([, errors]) => (errors?.length ?? 0) > 0)
    .map(([key]) => key)
    .sort();

  throw new Error(
    `Canary is missing required environment variables: ${missing.join(", ")}.`,
  );
}

let cachedRequiredRuntimeEnv:
  | ReturnType<typeof parseRequiredRuntimeEnv>
  | null = null;

function getOptionalRuntimeEnv() {
  return optionalRuntimeEnvSchema.parse(process.env);
}

export function getRequiredRuntimeEnv() {
  if (!cachedRequiredRuntimeEnv) {
    cachedRequiredRuntimeEnv = parseRequiredRuntimeEnv();
  }

  return cachedRequiredRuntimeEnv;
}

export function getDatabaseUrl() {
  return getRequiredRuntimeEnv().DATABASE_URL;
}

export function getBlobReadWriteToken() {
  return getRequiredRuntimeEnv().BLOB_READ_WRITE_TOKEN;
}

export function isClerkConfigured() {
  const env = getOptionalRuntimeEnv();
  return Boolean(env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY && env.CLERK_SECRET_KEY);
}

export function isAiConfigured() {
  return Boolean(getOptionalRuntimeEnv().OPENROUTER_API_KEY);
}

export function isPublicDemoEnabled() {
  const raw = getOptionalRuntimeEnv().CANARY_PUBLIC_DEMO_ENABLED;
  if (!raw) {
    return false;
  }

  return raw === "true" || raw === "1" || raw === "yes";
}

export function isVercelPreviewDeployment() {
  return getOptionalRuntimeEnv().VERCEL_ENV === "preview";
}
