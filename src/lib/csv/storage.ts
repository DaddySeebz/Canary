import fs from "node:fs";
import path from "node:path";

import { v4 as uuidv4 } from "uuid";

function getBaseUploadDir() {
  return path.resolve(
    /* turbopackIgnore: true */ process.cwd(),
    process.env.UPLOAD_DIR || "./data/uploads",
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
