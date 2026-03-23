import fs from "node:fs";
import path from "node:path";

import Database from "better-sqlite3";

import { getDefaultDatabasePath } from "@/lib/runtime";

let database: Database.Database | null = null;

function resolveDatabasePath() {
  const configuredPath = process.env.DATABASE_PATH || getDefaultDatabasePath();
  return path.isAbsolute(configuredPath)
    ? configuredPath
    : path.resolve(/* turbopackIgnore: true */ process.cwd(), configuredPath);
}

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

export function getDatabase() {
  if (database) {
    return database;
  }

  const dbPath = resolveDatabasePath();
  fs.mkdirSync(path.dirname(dbPath), { recursive: true });

  database = new Database(dbPath);
  database.pragma("journal_mode = WAL");
  database.pragma("foreign_keys = ON");

  const schema = fs.readFileSync(new URL("./schema.sql", import.meta.url), "utf8");
  database.exec(schema);

  return database;
}
