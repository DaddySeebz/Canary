import { neon, type NeonQueryFunction } from "@neondatabase/serverless";

import { getDatabaseUrl } from "@/lib/env";
import { schemaSql } from "@/lib/db/schema";

let database: NeonQueryFunction<false, false> | null = null;
let schemaReady: Promise<void> | null = null;

export function parseJsonColumn<T>(value: string | null | undefined, fallback: T): T {
  if (!value) {
    return fallback;
  }

  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}

export function toJson(value: unknown) {
  return JSON.stringify(value ?? null);
}

function getNeonClient() {
  if (database) {
    return database;
  }

  database = neon(getDatabaseUrl());
  return database;
}

async function ensureSchema() {
  if (!schemaReady) {
    schemaReady = (async () => {
      const db = getNeonClient();
      const statements = schemaSql
        .split(";")
        .map((statement) => statement.trim())
        .filter(Boolean);

      for (const statement of statements) {
        await db.query(statement);
      }
    })().catch((error) => {
      schemaReady = null;
      throw error;
    });
  }

  await schemaReady;
}

export async function getDatabase() {
  await ensureSchema();
  return getNeonClient();
}

export async function queryRows<T>(query: string, params: unknown[] = []) {
  const db = await getDatabase();
  return (await db.query(query, params)) as T[];
}

export async function queryRow<T>(query: string, params: unknown[] = []) {
  const rows = await queryRows<T>(query, params);
  return rows[0] ?? null;
}
