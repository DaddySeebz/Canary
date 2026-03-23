export function isVercelDeployment() {
  return Boolean(process.env.VERCEL);
}

export function getDefaultDatabasePath() {
  return isVercelDeployment() ? "/tmp/canary/audit.db" : "./data/audit.db";
}

export function getDefaultUploadDir() {
  return isVercelDeployment() ? "/tmp/canary/uploads" : "./data/uploads";
}

export function getDeploymentStorageMode() {
  return isVercelDeployment() ? "ephemeral" : "local";
}
