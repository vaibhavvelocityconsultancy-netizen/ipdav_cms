import fs from "fs";
import path from "path";
import https from "https";
import { execSync } from "child_process";
import { requireAuth, requirePermission } from "../../withPermission.js";

// ─── Paths ──────────────────────────────────────────────

const PROJECT_ROOT = process.cwd();
const SCHEMA_PATH = path.join(PROJECT_ROOT, "prisma", "schema.prisma");
const PKG_PATH = path.join(PROJECT_ROOT, "package.json");
const LOCK_PATH = path.join(PROJECT_ROOT, "package-lock.json");
const CONFIG_PATH = path.join(PROJECT_ROOT, "cmskit.config.json");

const GITHUB_ORG = process.env.CMSKIT_MODULES_ORG;
const GITHUB_REPO = process.env.CMSKIT_MODULES_REPO;
const GITHUB_TOKEN = process.env.CMSKIT_MODULES_TOKEN;

function githubRepoPath() {
  if (!GITHUB_REPO) return "";

  const configuredRepo = GITHUB_REPO.trim().replace(/\/+$/, "");
  const repoUrlMatch = configuredRepo.match(
    /github\.com[/:]([^/]+\/[^/]+?)(?:\.git)?$/i,
  );

  return (repoUrlMatch ? repoUrlMatch[1] : configuredRepo).replace(
    /\.git$/,
    "",
  );
}

// ─── Helpers ──────────────────────────────────────────────

function statusFilePath(jobId) {
  return path.join(PROJECT_ROOT, "tmp", `install-${jobId}.json`);
}

export function readInstalledModules() {
  if (!fs.existsSync(CONFIG_PATH)) return { installedModules: [] };
  return JSON.parse(fs.readFileSync(CONFIG_PATH, "utf-8"));
}

function writeInstalledModules(cfg) {
  fs.writeFileSync(CONFIG_PATH, JSON.stringify(cfg, null, 2));
}

// ─── Status / job logging ─────────────────────────────────

export async function writeJobStatus(jobId, data) {
  fs.mkdirSync(path.dirname(statusFilePath(jobId)), { recursive: true });
  fs.writeFileSync(statusFilePath(jobId), JSON.stringify(data, null, 2));
}

export async function readJobStatus(jobId) {
  if (!fs.existsSync(statusFilePath(jobId))) {
    throw new Error("Job not found");
  }
  return JSON.parse(fs.readFileSync(statusFilePath(jobId), "utf-8"));
}

export async function appendJobLog(jobId, message) {
  const current = fs.existsSync(statusFilePath(jobId))
    ? JSON.parse(fs.readFileSync(statusFilePath(jobId), "utf-8"))
    : { logs: [] };

  current.logs = current.logs || [];
  current.logs.push(`[${new Date().toISOString()}] ${message}`);
  current.status = "running";

  await writeJobStatus(jobId, current);
}

// ─── Backup / restore ─────────────────────────────────────

export async function backupBeforeInstall(jobId) {
  await requirePermission("modules_install");

  const schemaBackup = `${SCHEMA_PATH}.backup-${jobId}`;
  const pkgBackup = `${PKG_PATH}.backup-${jobId}`;
  let lockBackup = null;

  fs.copyFileSync(SCHEMA_PATH, schemaBackup);
  fs.copyFileSync(PKG_PATH, pkgBackup);

  if (fs.existsSync(LOCK_PATH)) {
    lockBackup = `${LOCK_PATH}.backup-${jobId}`;
    fs.copyFileSync(LOCK_PATH, lockBackup);
  }

  return { schemaBackup, pkgBackup, lockBackup };
}

export async function restoreFromBackup({
  schemaBackup,
  pkgBackup,
  lockBackup,
}) {
  await requirePermission("modules_install");

  if (schemaBackup && fs.existsSync(schemaBackup)) {
    fs.copyFileSync(schemaBackup, SCHEMA_PATH);
    fs.rmSync(schemaBackup);
  }
  if (pkgBackup && fs.existsSync(pkgBackup)) {
    fs.copyFileSync(pkgBackup, PKG_PATH);
    fs.rmSync(pkgBackup);
  }
  if (lockBackup && fs.existsSync(lockBackup)) {
    fs.copyFileSync(lockBackup, LOCK_PATH);
    fs.rmSync(lockBackup);
  }

  execSync("npm install", { cwd: PROJECT_ROOT, stdio: "pipe" });
}

export async function clearBackups({ schemaBackup, pkgBackup, lockBackup }) {
  [schemaBackup, pkgBackup, lockBackup].forEach((backupPath) => {
    if (backupPath && fs.existsSync(backupPath)) {
      fs.rmSync(backupPath, { force: true });
    }
  });
}

export async function backupDatabase(jobId) {
  await requirePermission("modules_install");

  if (!process.env.CMSKIT_DB_BACKUP_CMD) return null;

  const outPath = path.join(PROJECT_ROOT, "tmp", `db-backup-${jobId}.sql`);
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  execSync(process.env.CMSKIT_DB_BACKUP_CMD.replace("{OUT}", outPath));

  return outPath;
}

// ─── GitHub fetch ──────────────────────────────────────────

export async function downloadModuleTarball(moduleName, ref = "main") {
  await requirePermission("modules_install");

  return new Promise((resolve, reject) => {
    const url = `https://api.github.com/repos/${githubRepoPath() || `${GITHUB_ORG}/${GITHUB_REPO}`}/tarball/${ref}`;
    const destPath = path.join(
      PROJECT_ROOT,
      "tmp",
      `${moduleName}-${Date.now()}.tar.gz`,
    );
    fs.mkdirSync(path.dirname(destPath), { recursive: true });
    const fileStream = fs.createWriteStream(destPath);

    const request = (requestUrl) => {
      https
        .get(
          requestUrl,
          {
            headers: {
              Authorization: `Bearer ${GITHUB_TOKEN}`,
              "User-Agent": "cmskit-installer",
            },
          },
          (res) => {
            if (
              res.statusCode >= 300 &&
              res.statusCode < 400 &&
              res.headers.location
            ) {
              request(res.headers.location);
              return;
            }
            if (res.statusCode !== 200) {
              reject(
                new Error(`GitHub tarball fetch failed: ${res.statusCode}`),
              );
              return;
            }
            res.pipe(fileStream);
            fileStream.on("finish", () =>
              fileStream.close(() => resolve(destPath)),
            );
          },
        )
        .on("error", reject);
    };

    request(url);
  });
}

export async function extractModuleTarball(tarPath, extractDir) {
  fs.mkdirSync(extractDir, { recursive: true });
  execSync(`tar -xzf "${tarPath}" -C "${extractDir}" --strip-components=1`);
}

export async function readModuleManifest(moduleDir) {
  const manifestPath = path.join(moduleDir, "module.json");
  if (!fs.existsSync(manifestPath)) {
    throw new Error("module.json not found in downloaded module");
  }
  return JSON.parse(fs.readFileSync(manifestPath, "utf-8"));
}

// ─── Dependency check ──────────────────────────────────────

export async function checkModuleDependencies(manifest) {
  const cfg = readInstalledModules();
  const missing = (manifest.dependencies || []).filter(
    (dep) => !cfg.installedModules.includes(dep),
  );

  if (missing.length > 0) {
    throw new Error(
      `Module "${manifest.name}" requires: ${missing.join(", ")} — install those first`,
    );
  }
}

// ─── File copy ─────────────────────────────────────────────

export async function copyModuleFiles(moduleDir, targetPaths) {
  await requirePermission("modules_install");

  const copiedPaths = [];

  for (const [src, dest] of Object.entries(targetPaths || {})) {
    const srcPath = path.join(moduleDir, src);
    const destPath = path.join(PROJECT_ROOT, dest);

    if (fs.existsSync(destPath)) {
      throw new Error(
        `Target path already exists, refusing to overwrite: ${dest}`,
      );
    }

    fs.mkdirSync(path.dirname(destPath), { recursive: true });
    fs.cpSync(srcPath, destPath, { recursive: true });
    copiedPaths.push(destPath);
  }

  return copiedPaths;
}

export async function removeCopiedFiles(copiedPaths) {
  for (const filePath of [...copiedPaths].reverse()) {
    if (fs.existsSync(filePath)) {
      fs.rmSync(filePath, { recursive: true, force: true });
    }
  }
}

// ─── Schema merge ──────────────────────────────────────────

export async function mergeSchemaFragment(moduleDir, schemaFragmentName) {
  await requirePermission("modules_install");

  const fragmentPath = path.join(moduleDir, schemaFragmentName);
  const fragment = fs.readFileSync(fragmentPath, "utf-8");
  fs.appendFileSync(SCHEMA_PATH, "\n" + fragment);

  // NOTE: cross-module relation re-injection (e.g. tenant/user/post needing
  // this module's models) is not handled here — wire in relations.json
  // logic from the schema-split step if this module needs it.
}

// ─── npm / prisma / build steps ─────────────────────────────

export async function installNpmDependencies(deps) {
  await requirePermission("modules_install");

  if (!deps || deps.length === 0) return;
  execSync(`npm install ${deps.join(" ")}`, {
    cwd: PROJECT_ROOT,
    stdio: "pipe",
  });
}

export async function validateSchema() {
  execSync("npx prisma validate", { cwd: PROJECT_ROOT, stdio: "pipe" });
}

export async function runMigrations() {
  await requirePermission("modules_install");
  execSync("npx prisma migrate deploy", { cwd: PROJECT_ROOT, stdio: "pipe" });
}

export async function buildProject() {
  execSync("npm run build", { cwd: PROJECT_ROOT, stdio: "pipe" });
}

// ─── Finalize / restart ─────────────────────────────────────

export async function markModuleInstalled(moduleName) {
  const cfg = readInstalledModules();
  cfg.installedModules.push(moduleName);
  writeInstalledModules(cfg);
}

export async function triggerAppRestart() {
  const restartFlagPath = path.join(PROJECT_ROOT, "tmp", "restart.txt");
  fs.mkdirSync(path.dirname(restartFlagPath), { recursive: true });
  fs.writeFileSync(restartFlagPath, new Date().toISOString());
}

// ─── Orchestrator ────────────────────────────────────────────

export async function installModule(moduleName, jobId) {
  await requireAuth();
  await requirePermission("modules_install");

  let backups = null;
  let copiedPaths = [];
  let migrationApplied = false;
  let dbBackupPath = null;

  await writeJobStatus(jobId, {
    status: "running",
    module: moduleName,
    logs: [],
  });

  try {
    await appendJobLog(jobId, "Backing up schema.prisma and package.json");
    backups = await backupBeforeInstall(jobId);

    dbBackupPath = await backupDatabase(jobId);
    if (dbBackupPath) {
      await appendJobLog(jobId, `Database backed up to ${dbBackupPath}`);
    }

    await appendJobLog(jobId, `Downloading ${moduleName} from GitHub`);
    const tarPath = await downloadModuleTarball(moduleName);
    const extractDir = path.join(PROJECT_ROOT, "tmp", `extract-${jobId}`);
    await extractModuleTarball(tarPath, extractDir);

    const moduleDir = path.join(extractDir, moduleName);
    const manifest = await readModuleManifest(moduleDir);

    await checkModuleDependencies(manifest);

    await appendJobLog(jobId, "Copying module files into project");
    copiedPaths = await copyModuleFiles(moduleDir, manifest.targetPaths);
    const cachePath = path.join(PROJECT_ROOT, "modules-cache", moduleName);
    fs.mkdirSync(cachePath, { recursive: true });
    fs.writeFileSync(
      path.join(cachePath, "module.json"),
      JSON.stringify(manifest, null, 2),
    );

    await appendJobLog(jobId, "Merging Prisma schema fragment");
    await mergeSchemaFragment(moduleDir, manifest.schemaFragment);

    if ((manifest.npmDependencies || []).length > 0) {
      await appendJobLog(
        jobId,
        `Installing npm packages: ${manifest.npmDependencies.join(", ")}`,
      );
      await installNpmDependencies(manifest.npmDependencies);
    }

    await appendJobLog(jobId, "Validating Prisma schema");
    await validateSchema();

    await appendJobLog(jobId, "Running database migration");
    await runMigrations();
    migrationApplied = true;

    await appendJobLog(jobId, "Building project (this can take a few minutes)");
    await buildProject();

    await markModuleInstalled(moduleName);
    await triggerAppRestart();
    await clearBackups(backups);

    fs.rmSync(extractDir, { recursive: true, force: true });
    fs.rmSync(tarPath, { force: true });

    const finalStatus = await readJobStatus(jobId);
    await writeJobStatus(jobId, { ...finalStatus, status: "success" });
    await appendJobLog(
      jobId,
      "Install complete. App will restart on next request.",
    );
  } catch (err) {
    await appendJobLog(jobId, `ERROR: ${err.message}`);
    await appendJobLog(jobId, "Rolling back...");

    await removeCopiedFiles(copiedPaths);
    await appendJobLog(jobId, "Removed copied files");

    if (backups) {
      await restoreFromBackup(backups);
      await appendJobLog(jobId, "Restored schema.prisma and package.json");
    }

    if (migrationApplied) {
      if (dbBackupPath) {
        await appendJobLog(
          jobId,
          `DB migration was applied. Restore manually from: ${dbBackupPath}`,
        );
      } else {
        await appendJobLog(
          jobId,
          "WARNING: DB migration applied with no backup — manual review needed",
        );
      }
    }

    const finalStatus = await readJobStatus(jobId);
    await writeJobStatus(jobId, {
      ...finalStatus,
      status: "failed",
      error: err.message,
    });
  }
}

// ─── Modules index / list ───────────────────────────────────

export async function fetchModulesIndex() {
  return new Promise((resolve, reject) => {
    const configuredRepo = (GITHUB_REPO || "").trim().replace(/\/+$/, "");
    let repoPath = configuredRepo;

    try {
      const parsedRepoUrl = new URL(configuredRepo);
      repoPath = parsedRepoUrl.pathname.replace(/^\/+|\/+$/g, "");
    } catch {
      // CMSKIT_MODULES_REPO may be configured as owner/repo instead of a URL.
    }

    repoPath = repoPath.replace(/\.git$/, "");
    if (!repoPath.includes("/")) {
      repoPath = `${GITHUB_ORG}/${repoPath}`;
    }

    const apiUrl = `https://api.github.com/repos/${repoPath}/contents/modules-index.json`;
    const apiPath = new URL(apiUrl).pathname;

    console.log("========== GITHUB MODULE INDEX DEBUG ==========");
    console.log("GITHUB_REPO:", GITHUB_REPO);
    console.log("githubRepoPath():", repoPath);
    console.log("Final API URL:", apiUrl);
    console.log("===============================================");

    const req = https.request(
      {
        hostname: "api.github.com",
        path: apiPath,
        method: "GET",
        headers: {
          "User-Agent": "cmskit-module-installer",
          Accept: "application/vnd.github+json",
          Authorization: `Bearer ${GITHUB_TOKEN}`,
          "X-GitHub-Api-Version": "2022-11-28",
        },
      },
      (res) => {
        let data = "";

        res.on("data", (chunk) => {
          data += chunk;
        });

        res.on("end", () => {
          console.log("========== GITHUB RESPONSE ==========");
          console.log("Status:", res.statusCode);
          console.log("=====================================");

          if (res.statusCode !== 200) {
            reject(
              new Error(
                `Failed to fetch modules-index.json: ${res.statusCode} - ${data}`,
              ),
            );
            return;
          }

          try {
            const json = JSON.parse(data);

            const content = Buffer.from(json.content, "base64").toString(
              "utf8",
            );

            resolve(JSON.parse(content));
          } catch (error) {
            reject(error);
          }
        });
      },
    );

    req.on("error", reject);
    req.end();
  });
}

export async function listModulesWithStatus() {
  const index = await fetchModulesIndex();
  const cfg = readInstalledModules();
  const activeModules = cfg.activeModules || cfg.installedModules;

  return index.modules.map((m) => ({
    ...m,
    installed: cfg.installedModules.includes(m.name),
    active: activeModules.includes(m.name),
    files: Object.values(m.targetPaths || {}),
  }));
}

// ─── Deactivate / reactivate (UI visibility only, no file/data changes) ──

export async function deactivateModule(moduleName) {
  await requireAuth();
  await requirePermission("modules_install");

  const cfg = readInstalledModules();
  if (!cfg.installedModules.includes(moduleName)) {
    throw new Error(`Module "${moduleName}" is not installed`);
  }

  cfg.activeModules = (cfg.activeModules || cfg.installedModules).filter(
    (m) => m !== moduleName,
  );
  writeInstalledModules(cfg);
  return cfg;
}

export async function activateModule(moduleName) {
  await requireAuth();
  await requirePermission("modules_install");

  const cfg = readInstalledModules();
  if (!cfg.installedModules.includes(moduleName)) {
    throw new Error(`Module "${moduleName}" is not installed`);
  }

  const active = new Set(cfg.activeModules || cfg.installedModules);
  active.add(moduleName);
  cfg.activeModules = [...active];
  writeInstalledModules(cfg);
  return cfg;
}

export function isModuleActive(moduleName) {
  const cfg = readInstalledModules();
  const active = cfg.activeModules || cfg.installedModules;
  return active.includes(moduleName);
}

// ─── Uninstall ─────────────────────────────────────────────

export async function removeSchemaFragment(moduleName) {
  const content = fs.readFileSync(SCHEMA_PATH, "utf-8");
  const pattern = new RegExp(
    `\\n// --- MODULE:${moduleName} START ---[\\s\\S]*?// --- MODULE:${moduleName} END ---\\n`,
  );
  if (!pattern.test(content)) {
    throw new Error(
      `Could not find schema block for module "${moduleName}" — remove it manually from schema.prisma`,
    );
  }
  fs.writeFileSync(SCHEMA_PATH, content.replace(pattern, "\n"));
}

export async function checkNoDependents(moduleName) {
  const cfg = readInstalledModules();
  const index = await fetchModulesIndex();
  const dependents = index.modules.filter(
    (m) =>
      cfg.installedModules.includes(m.name) &&
      (m.dependencies || []).includes(moduleName),
  );
  if (dependents.length > 0) {
    throw new Error(
      `Cannot uninstall "${moduleName}" — required by: ${dependents.map((d) => d.name).join(", ")}`,
    );
  }
}

export async function uninstallModule(
  moduleName,
  jobId,
  { deleteData = false } = {},
) {
  await requireAuth();
  await requirePermission("modules_install");

  const cfg = readInstalledModules();
  const activeModules = cfg.activeModules || cfg.installedModules;
  if (activeModules.includes(moduleName)) {
    throw new Error(`Deactivate "${moduleName}" before uninstalling it`);
  }
  if (!cfg.installedModules.includes(moduleName)) {
    throw new Error(`Module "${moduleName}" is not installed`);
  }

  await writeJobStatus(jobId, {
    status: "running",
    module: moduleName,
    action: "uninstall",
    logs: [],
  });

  try {
    await appendJobLog(jobId, "Checking no other module depends on this one");
    await checkNoDependents(moduleName);

    // manifest was saved locally at install time — see note below
    const manifestPath = path.join(
      PROJECT_ROOT,
      "modules-cache",
      moduleName,
      "module.json",
    );
    if (!fs.existsSync(manifestPath)) {
      throw new Error(
        `Could not find local manifest for "${moduleName}" — cannot safely remove files`,
      );
    }
    const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf-8"));

    await appendJobLog(jobId, "Removing module files");
    for (const dest of Object.values(manifest.targetPaths || {})) {
      const destPath = path.join(PROJECT_ROOT, dest);
      if (fs.existsSync(destPath)) {
        fs.rmSync(destPath, { recursive: true, force: true });
      }
    }

    if (deleteData) {
      await appendJobLog(
        jobId,
        "Removing schema fragment (data will be dropped)",
      );
      await removeSchemaFragment(moduleName);
      await appendJobLog(
        jobId,
        "Syncing schema — this DROPS this module's tables",
      );
      await syncSchemaToDatabase();
    } else {
      await appendJobLog(jobId, "Keeping schema and data intact");
    }

    const updatedCfg = readInstalledModules();
    updatedCfg.installedModules = updatedCfg.installedModules.filter(
      (m) => m !== moduleName,
    );
    updatedCfg.activeModules = (updatedCfg.activeModules || []).filter(
      (m) => m !== moduleName,
    );
    writeInstalledModules(updatedCfg);

    fs.rmSync(path.join(PROJECT_ROOT, "modules-cache", moduleName), {
      recursive: true,
      force: true,
    });

    await appendJobLog(jobId, "Building project");
    await buildProject();
    await triggerAppRestart();

    const finalStatus = await readJobStatus(jobId);
    await writeJobStatus(jobId, { ...finalStatus, status: "success" });
  } catch (err) {
    await appendJobLog(jobId, `ERROR: ${err.message}`);
    const finalStatus = await readJobStatus(jobId);
    await writeJobStatus(jobId, {
      ...finalStatus,
      status: "failed",
      error: err.message,
    });
  }
}
