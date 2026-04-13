import fs from "node:fs";
import path from "node:path";

import Database from "better-sqlite3";

import { ensureVercelDemoSeed } from "@/lib/demo/vercel-seed";
import { getDefaultDatabasePath } from "@/lib/runtime";
import { schemaSql } from "@/lib/db/schema";

let database: Database.Database | null = null;

function hasColumn(db: Database.Database, table: string, column: string) {
  const rows = db.prepare(`PRAGMA table_info(${table})`).all() as Array<{ name: string }>;
  return rows.some((row) => row.name === column);
}

function ensureSchemaUpgrades(db: Database.Database) {
  if (!hasColumn(db, "projects", "user_id")) {
    db.prepare(`ALTER TABLE projects ADD COLUMN user_id TEXT`).run();
  }
}

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

  database.exec(schemaSql);
  ensureSchemaUpgrades(database);
  ensureVercelDemoSeed(database);

  return database;
}
