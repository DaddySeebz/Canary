import { del, get, put } from "@vercel/blob";
import { v4 as uuidv4 } from "uuid";

import { getBlobReadWriteToken } from "@/lib/env";

function buildBlobPath(projectId: string, filename: string) {
  return `projects/${projectId}/${filename}`;
}

export async function saveUploadedCsv(projectId: string, buffer: Buffer) {
  const filename = `${uuidv4()}.csv`;
  const blob = await put(buildBlobPath(projectId, filename), buffer, {
    access: "private",
    allowOverwrite: false,
    contentType: "text/csv",
    token: getBlobReadWriteToken(),
  });

  return { filename: blob.pathname, fullPath: blob.url };
}

export async function readStoredCsvText(pathname: string) {
  const blob = await get(pathname, {
    access: "private",
    useCache: false,
    token: getBlobReadWriteToken(),
  });

  if (!blob || blob.statusCode !== 200) {
    throw new Error("Uploaded CSV could not be loaded from storage.");
  }

  return await new Response(blob.stream).text();
}

export async function deleteProjectUploads(pathnames: string[]) {
  if (pathnames.length === 0) {
    return;
  }

  await del(pathnames, { token: getBlobReadWriteToken() });
}
