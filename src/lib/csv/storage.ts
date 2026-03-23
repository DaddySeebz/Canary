import fs from "node:fs";
import path from "node:path";

import { v4 as uuidv4 } from "uuid";

import { getDefaultUploadDir } from "@/lib/runtime";

function getBaseUploadDir() {
  const configuredPath = process.env.UPLOAD_DIR || getDefaultUploadDir();
  if (path.isAbsolute(configuredPath)) {
    return configuredPath;
  }

  return path.resolve(
    /* turbopackIgnore: true */ process.cwd(),
    configuredPath,
  );
}

export function ensureProjectUploadDir(projectId: string) {
  const dir = path.join(getBaseUploadDir(), projectId);
  fs.mkdirSync(dir, { recursive: true });
  return dir;
}

export function saveUploadedCsv(projectId: string, buffer: Buffer) {
  const projectDir = ensureProjectUploadDir(projectId);
  const filename = `${uuidv4()}.csv`;
  const fullPath = path.join(projectDir, filename);
  fs.writeFileSync(fullPath, buffer);
  return { filename, fullPath };
}

export function getStoredCsvPath(projectId: string, filename: string) {
  return path.join(getBaseUploadDir(), projectId, filename);
}

export function deleteProjectUploads(projectId: string) {
  fs.rmSync(path.join(getBaseUploadDir(), projectId), { recursive: true, force: true });
}
